
const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const Category = require("../models/Category");
const Game = require("../models/Game");
const SubcategoryLayout = require("../models/SubcategoryLayout");

router.get("/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        if (!mongoose.isValidObjectId(subcategoryId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const category = await Category.findOne({
            _id: subcategoryId,
            type: "subcategory",
            isActive: true
        });
        if (!category) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        const layout = await SubcategoryLayout.findOne({
            subcategory: subcategoryId
        }).populate({
            path: "games",
            match: { isActive: true, type: "game" },
            select: "name gameUrl image sortOrder"
        });

        res.json({
            success: true,
            games: layout?.games?.filter(Boolean) || []
        });
    } catch {
        res.status(500).json({ message: "Failed to load games" });
    }
});

router.put("/:subcategoryId", auth, async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const { games } = req.body || {};

        if (
            !mongoose.isValidObjectId(subcategoryId) ||
            !Array.isArray(games) ||
            games.length > 500
        ) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const category = await Category.exists({
            _id: subcategoryId,
            type: "subcategory",
            isActive: true
        });

        if (!category) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        if (
            !games.every(mongoose.isValidObjectId) ||
            new Set(games.map(String)).size !== games.length
        ) {
            return res.status(400).json({ message: "Invalid game IDs" });
        }

        const count = await Game.countDocuments({
            _id: { $in: games },
            type: "game"
        });

        if (count !== games.length) {
            return res.status(400).json({ message: "Games not found" });
        }

        const layout = await SubcategoryLayout.findOneAndUpdate(
            { subcategory: subcategoryId },
            { $set: { games } },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, layout });
    } catch {
        res.status(500).json({ message: "Failed to save games" });
    }
});

module.exports = router;
