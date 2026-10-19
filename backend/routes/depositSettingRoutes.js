
const router = require("express").Router();
const DepositSetting = require("../models/DepositSetting");
const auth = require("../middleware/auth");

// Public: Active payment methods
router.get("/", async (req, res) => {
    try {
        const settings = await DepositSetting.find({
            isActive: true
        }).select("-__v");

        res.json({ success: true, settings });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load deposit settings"
        });
    }
});

// Admin: All payment methods
router.get("/admin", auth, async (req, res) => {
    try {
        const settings = await DepositSetting.find()
            .sort({ method: 1, channel: 1 });

        res.json({ success: true, settings });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load settings"
        });
    }
});

// Admin: Add payment method
router.post("/", auth, async (req, res) => {
    try {
        const {
            method,
            channel,
            accountDetails,
            accountTitle = "",
            minAmount = 100,
            maxAmount = 100000,
            isActive = true
        } = req.body || {};

        if (
            !["Crypto", "JazzCash", "Easypaisa"].includes(method) ||
            typeof channel !== "string" ||
            !channel.trim() ||
            typeof accountDetails !== "string" ||
            !accountDetails.trim() ||
            !Number.isFinite(minAmount) ||
            !Number.isFinite(maxAmount) ||
            minAmount < 1 ||
            maxAmount < minAmount ||
            typeof isActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid deposit settings"
            });
        }

        const setting = await DepositSetting.create({
            method,
            channel: channel.trim(),
            accountDetails: accountDetails.trim(),
            accountTitle,
            minAmount,
            maxAmount,
            isActive
        });

        res.status(201).json({ success: true, setting });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            success: false,
            message: error.code === 11000
                ? "This payment channel already exists"
                : error.message
        });
    }
});

// Admin: Update payment method
router.put("/:id", auth, async (req, res) => {
    try {
        const allowed = [
            "method", "channel", "accountDetails",
            "accountTitle", "minAmount", "maxAmount", "isActive"
        ];

        const updates = {};

        allowed.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (
            updates.minAmount !== undefined &&
            (!Number.isFinite(updates.minAmount) || updates.minAmount < 1)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid minimum amount"
            });
        }

        const setting = await DepositSetting.findById(req.params.id);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            });
        }

        Object.assign(setting, updates);

        if (setting.maxAmount < setting.minAmount) {
            return res.status(400).json({
                success: false,
                message: "Maximum amount must be greater than minimum"
            });
        }

        await setting.save();

        res.json({ success: true, setting });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Admin: Delete payment method
router.delete("/:id", auth, async (req, res) => {
    try {
        const setting = await DepositSetting.findByIdAndDelete(req.params.id);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            });
        }

        res.json({ success: true });
    } catch {
        res.status(400).json({
            success: false,
            message: "Unable to delete payment method"
        });
    }
});

module.exports = router;
