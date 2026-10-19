
const router = require("express").Router();
const mongoose = require("mongoose");
const Popup = require("../models/Popup");
const auth = require("../middleware/auth");

const allowedPages = [
    "home", "deposit", "withdraw", "vip",
    "promo", "earn", "mine", "service",
    "roulette", "ranking", "withdraw-history"
];

function validatePopup(data) {
    if (!["image", "text"].includes(data.type)) {
        return "Invalid popup type";
    }

    if (data.type === "image" && !data.image?.url) {
        return "Popup image required";
    }

    if (data.type === "text" && !data.text?.trim()) {
        return "Popup text required";
    }

    if (data.targetType === "internal") {
        if (!allowedPages.includes(data.target)) {
            return "Invalid in-app target";
        }
    } else if (data.targetType === "external") {
        try {
            const url = new URL(data.target);
            if (url.protocol !== "https:") {
                return "External link must use HTTPS";
            }
        } catch {
            return "Invalid external URL";
        }
    } else {
        return "Invalid target type";
    }

    if (
        !Number.isInteger(data.intensity) ||
        data.intensity < 1 ||
        data.intensity > 10
    ) {
        return "Intensity must be between 1 and 10";
    }

    if (
        !Number.isInteger(data.intervalSeconds) ||
        data.intervalSeconds < 10 ||
        data.intervalSeconds > 3600
    ) {
        return "Interval must be between 10 and 3600 seconds";
    }

    return null;
}

// Public: Active popups
router.get("/", async (req, res) => {
    try {
        const popups = await Popup.find({ isActive: true })
            .select("title type image text targetType target intensity intervalSeconds")
            .lean();

        res.json({ success: true, popups });
    } catch {
        res.status(500).json({ message: "Unable to load popups" });
    }
});

// Admin: All popups
router.get("/admin", auth, async (req, res) => {
    try {
        const popups = await Popup.find()
            .sort({ createdAt: -1 });

        res.json({ success: true, popups });
    } catch {
        res.status(500).json({ message: "Unable to load popups" });
    }
});

// Admin: Create popup
router.post("/", auth, async (req, res) => {
    try {
        const data = req.body || {};
        const validationError = validatePopup(data);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const popup = await Popup.create({
            title: data.title,
            type: data.type,
            image: data.image,
            text: data.text,
            targetType: data.targetType,
            target: data.target,
            intensity: data.intensity,
            intervalSeconds: data.intervalSeconds,
            isActive: data.isActive !== false
        });

        res.status(201).json({ success: true, popup });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Update popup
router.put("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid popup ID" });
        }

        const popup = await Popup.findById(req.params.id);

        if (!popup) {
            return res.status(404).json({ message: "Popup not found" });
        }

        const allowed = [
            "title", "type", "image", "text",
            "targetType", "target", "intensity",
            "intervalSeconds", "isActive"
        ];

        allowed.forEach((field) => {
            if (req.body[field] !== undefined) {
                popup[field] = req.body[field];
            }
        });

        const validationError = validatePopup(popup);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        await popup.save();

        res.json({ success: true, popup });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: Delete popup
router.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid popup ID" });
        }

        const popup = await Popup.findByIdAndDelete(req.params.id);

        if (!popup) {
            return res.status(404).json({ message: "Popup not found" });
        }

        res.json({ success: true });
    } catch {
        res.status(500).json({ message: "Unable to delete popup" });
    }
});

module.exports = router;
