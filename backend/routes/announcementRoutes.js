
const router = require("express").Router();
const Announcement = require("../models/Announcement");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

// Public: Homepage active announcements
router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true
        }).sort({ sortOrder: 1, createdAt: 1 });

        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load announcements"
        });
    }
});

// Admin: All announcements
router.get("/admin", auth, async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ sortOrder: 1, createdAt: 1 });

        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load announcements"
        });
    }
});

// Admin: Add announcement
router.post("/", auth, async (req, res) => {
    try {
        const { message, sortOrder = 0, isActive = true } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const announcement = await Announcement.create({
            message: message.trim(),
            sortOrder,
            isActive
        });

        res.status(201).json({ success: true, announcement });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Admin: Update announcement
router.put("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid announcement ID"
            });
        }

        const updates = {};

        ["message", "sortOrder", "isActive"].forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.message !== undefined) {
            if (typeof updates.message !== "string" || !updates.message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Message is required"
                });
            }
            updates.message = updates.message.trim();
        }

        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        res.json({ success: true, announcement });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Admin: Delete announcement
router.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid announcement ID"
            });
        }

        const announcement = await Announcement.findByIdAndDelete(
            req.params.id
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete announcement"
        });
    }
});

module.exports = router;
