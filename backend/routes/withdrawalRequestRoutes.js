
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const adminAuth = require("../middleware/auth");

async function userAuth(req, res, next) {
    try {
        const token = (req.headers.authorization || "").replace(/^Bearer /, "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "user") {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findOne({
            _id: decoded.id,
            isActive: true
        });

        if (!user) {
            return res.status(401).json({ message: "Login required" });
        }

        req.currentUser = user;
        next();
    } catch {
        res.status(401).json({ message: "Login required" });
    }
}

// User: Check balance
router.get("/balance", userAuth, async (req, res) => {
    res.json({
        success: true,
        balance: req.currentUser.balance || 0,
        reservedBalance: req.currentUser.reservedBalance || 0
    });
});

// User: Submit withdrawal
router.post("/", userAuth, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            method,
            accountDetails,
            accountTitle = "",
            amount
        } = req.body || {};

        if (
            !["Crypto", "JazzCash", "Easypaisa", "Bank"].includes(method) ||
            typeof accountDetails !== "string" ||
            !accountDetails.trim() ||
            !Number.isFinite(amount) ||
            amount < 100 ||
            amount > 50000
        ) {
            return res.status(400).json({
                message: "Invalid withdrawal details"
            });
        }

        await session.withTransaction(async () => {
            const user = await User.findOneAndUpdate(
                {
                    _id: req.currentUser._id,
                    isActive: true,
                    balance: { $gte: amount }
                },
                {
                    $inc: {
                        balance: -amount,
                        reservedBalance: amount
                    }
                },
                { new: true, session }
            );

            if (!user) {
                const error = new Error("Insufficient balance");
                error.status = 400;
                throw error;
            }

            const [withdrawal] = await WithdrawalRequest.create(
                [{
                    user: user._id,
                    method,
                    accountDetails: accountDetails.trim(),
                    accountTitle,
                    amount
                }],
                { session }
            );

            res.locals.withdrawal = withdrawal;
        });

        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted for review",
            withdrawal: res.locals.withdrawal
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.status
                ? error.message
                : "Withdrawal request failed"
        });
    } finally {
        await session.endSession();
    }
});

// User: Own withdrawals
router.get("/my", userAuth, async (req, res) => {
    const withdrawals = await WithdrawalRequest.find({
        user: req.currentUser._id
    }).sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
});

// Admin: All withdrawals
router.get("/admin", adminAuth, async (req, res) => {
    const withdrawals = await WithdrawalRequest.find()
        .populate("user", "mobile")
        .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
});

// Admin: Approve verified payout
router.patch("/:id/approve", adminAuth, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { payoutReference } = req.body || {};

        if (
            !mongoose.isValidObjectId(req.params.id) ||
            typeof payoutReference !== "string" ||
            !payoutReference.trim()
        ) {
            return res.status(400).json({
                message: "Valid payout reference required"
            });
        }

        await session.withTransaction(async () => {
            const withdrawal = await WithdrawalRequest.findOneAndUpdate(
                { _id: req.params.id, status: "pending" },
                {
                    $set: {
                        status: "approved",
                        payoutReference: payoutReference.trim(),
                        reviewedAt: new Date()
                    }
                },
                { new: true, session }
            );

            if (!withdrawal) {
                const error = new Error("Withdrawal already reviewed");
                error.status = 409;
                throw error;
            }

            const user = await User.findOneAndUpdate(
                {
                    _id: withdrawal.user,
                    reservedBalance: { $gte: withdrawal.amount }
                },
                {
                    $inc: {
                        reservedBalance: -withdrawal.amount
                    }
                },
                { session }
            );

            if (!user) throw new Error("Reserved balance unavailable");

            res.locals.withdrawal = withdrawal;
        });

        res.json({
            success: true,
            message: "Withdrawal approved",
            withdrawal: res.locals.withdrawal
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.status ? error.message : "Approval failed"
        });
    } finally {
        await session.endSession();
    }
});

// Admin: Reject and refund reserved balance
router.patch("/:id/reject", adminAuth, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid withdrawal ID" });
        }

        await session.withTransaction(async () => {
            const withdrawal = await WithdrawalRequest.findOneAndUpdate(
                { _id: req.params.id, status: "pending" },
                {
                    $set: {
                        status: "rejected",
                        reviewedAt: new Date()
                    }
                },
                { new: true, session }
            );

            if (!withdrawal) {
                const error = new Error("Withdrawal already reviewed");
                error.status = 409;
                throw error;
            }

            const user = await User.findOneAndUpdate(
                {
                    _id: withdrawal.user,
                    reservedBalance: { $gte: withdrawal.amount }
                },
                {
                    $inc: {
                        reservedBalance: -withdrawal.amount,
                        balance: withdrawal.amount
                    }
                },
                { session }
            );

            if (!user) throw new Error("Reserved balance unavailable");

            res.locals.withdrawal = withdrawal;
        });

        res.json({
            success: true,
            message: "Withdrawal rejected. Balance refunded."
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.status ? error.message : "Rejection failed"
        });
    } finally {
        await session.endSession();
    }
});

module.exports = router;
