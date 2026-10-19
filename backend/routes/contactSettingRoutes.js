
const router = require("express").Router();
const ContactSetting = require("../models/ContactSetting");
const auth = require("../middleware/auth");

const platforms = ["whatsapp", "facebook", "telegram"];

// Public: Active contact links
router.get("/", async (req, res) => {
    try {
        const contacts = await ContactSetting.find({
            isActive: true
        });

        res.json({ success: true, contacts });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load contacts"
        });
    }
});

// Admin: All contact settings
router.get("/admin", auth, async (req, res) => {
    try {
        const contacts = await ContactSetting.find();

        res.json({ success: true, contacts });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load contact settings"
        });
    }
});

// Admin: Add or update a platform
router.put("/:platform", auth, async (req, res) => {
    try {
        const { platform } = req.params;
        const { url, buttonText = "Contact Now", isActive = true } = req.body || {};

        if (!platforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                message: "Invalid platform"
            });
        }

        if (
            typeof url !== "string" ||
            !/^https:\/\//i.test(url.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid HTTPS link required"
            });
        }

        const parsed = new URL(url.trim());

        const allowedHosts = {
            whatsapp: ["wa.me", "api.whatsapp.com", "chat.whatsapp.com"],
            facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com", "m.me"],
            telegram: ["t.me", "telegram.me"]
        };

        if (!allowedHosts[platform].includes(parsed.hostname.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Link does not match selected platform"
            });
        }

        if (
            typeof buttonText !== "string" ||
            !buttonText.trim() ||
            buttonText.length > 40 ||
            typeof isActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact settings"
            });
        }

        const contact = await ContactSetting.findOneAndUpdate(
            { platform },
            {
                $set: {
                    url: url.trim(),
                    buttonText: buttonText.trim(),
                    isActive
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, contact });
    } catch {
        res.status(400).json({
            success: false,
            message: "Unable to save contact settings"
        });
    }
});

module.exports = router;
