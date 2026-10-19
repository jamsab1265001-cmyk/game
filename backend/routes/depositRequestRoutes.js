
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const DepositSetting = require("../models/DepositSetting");
const DepositRequest = require("../models/DepositRequest");
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

// User: Submit deposit confirmation
router.post("/", userAuth, async (req, res) => {
    try {
        const { paymentSetting, amount, transactionId } = req.body || {};

        if (!mongoose.isValidObjectId(paymentSetting)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        const setting = await DepositSetting.findOne({
            _id: paymentSetting,
            isActive: true
        });

        if (!setting) {
            return res.status(404).json({ message: "Payment method unavailable" });
        }

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount < setting.minAmount ||
            amount > setting.maxAmount
        ) {
            return res.status(400).json({
                message: `Amount must be between ${setting.minAmount} and ${setting.maxAmount}`
            });
        }

        if (
            typeof transactionId !== "string" ||
            !/^[a-zA-Z0-9_-]{6,100}$/.test(transactionId.trim())
        ) {
            return res.status(400).json({
                message: "Enter a valid transaction/reference ID"
            });
        }

        const deposit = await DepositRequest.create({
            user: req.currentUser._id,
            paymentSetting: setting._id,
            method: setting.method,
            channel: setting.channel,
            amount,
            transactionId: transactionId.trim()
        });

        res.status(201).json({
            success: true,
            message: "Deposit request submitted for verification",
            deposit: {
                id: deposit._id,
                amount: deposit.amount,
                status: deposit.status
            }
        });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 500).json({
            message: error.code === 11000
                ? "Transaction ID already submitted"
                : "Unable to submit deposit request"
        });
    }
});

// User: Own deposit history
router.get("/my", userAuth, async (req, res) => {
    try {
        const deposits = await DepositRequest.find({
            user: req.currentUser._id
        }).sort({ createdAt: -1 });

        res.json({ success: true, deposits });
    } catch {
        res.status(500).json({ message: "Unable to load history" });
    }
});

// Admin: All deposit requests
router.get("/admin", adminAuth, async (req, res) => {
    try {
        const deposits = await DepositRequest.find()
            .populate("user", "mobile")
            .sort({ createdAt: -1 });

        res.json({ success: true, deposits });
    } catch {
        res.status(500).json({ message: "Unable to load deposits" });
    }
});

// Admin: Reject deposit request
router.patch("/:id/reject", adminAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid deposit ID" });
        }

        const deposit = await DepositRequest.findOneAndUpdate(
            { _id: req.params.id, status: "pending" },
            { $set: { status: "rejected", reviewedAt: new Date() } },
            { new: true }
        );

        if (!deposit) {
            return res.status(409).json({
                message: "Deposit not found or already reviewed"
            });
        }

        res.json({ success: true, deposit });
    } catch {
        res.status(500).json({ message: "Unable to reject deposit" });
    }
});


router.patch("/:id/approve", adminAuth, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (!mongoose.isValidObjectId(req.params.id)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid deposit ID" });
        }

        const deposit = await DepositRequest.findOneAndUpdate(
            { _id: req.params.id, status: "pending" },
            {
                $set: {
                    status: "approved",
                    reviewedAt: new Date()
                }
            },
            { new: true, session }
        );

        if (!deposit) {
            await session.abortTransaction();
            return res.status(409).json({
                message: "Deposit already reviewed or not found"
            });
        }

        const user = await User.findOneAndUpdate(
            { _id: deposit.user, isActive: true },
            {
                $inc: {
                    balance: deposit.amount,
                    totalDeposits: deposit.amount
                }
            },
            { new: true, session }
        );

        if (!user) {
            throw new Error("User account unavailable");
        }

        await session.commitTransaction();

        res.json({
            success: true,
            message: "Deposit approved and balance credited",
            deposit,
            newBalance: user.balance
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        res.status(500).json({
            success: false,
            message: "Approval failed. Balance not credited."
        });
    } finally {
        await session.endSession();
    }
});


module.exports = router;
