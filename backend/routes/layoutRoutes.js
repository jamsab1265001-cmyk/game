
const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const Category = require("../models/Category");
const Game = require("../models/Game");
const CategoryLayout = require("../models/CategoryLayout");

router.get("/:parentId", async (req, res) => {
    try {
        const { parentId } = req.params;

        if (!mongoose.isValidObjectId(parentId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const parent = await Category.findOne({
            _id: parentId,
            type: "parent",
            isActive: true
        });

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        const layout = await CategoryLayout.findOne({
            parentCategory: parentId
        }).lean();

        const items = [];

        for (const entry of layout?.items || []) {
            if (entry.itemType === "game") {
                const game = await Game.findOne({
                    _id: entry.itemId,
                    isActive: true,
                    type: "game"
                }).select("name gameUrl image displayStyle").lean();

                if (game) {
                    items.push({ itemType: "game", item: game });
                }
            } else {
                const category = await Category.findOne({
                    _id: entry.itemId,
                    type: "subcategory",
                    isActive: true
                }).select("name slug banner icon displayStyle").lean();

                if (category) {
                    items.push({ itemType: "subcategory", item: category });
                }
            }
        }

        res.json({ success: true, items });
    } catch {
        res.status(500).json({ message: "Failed to load layout" });
    }
});

router.put("/:parentId", auth, async (req, res) => {
    try {
        const { parentId } = req.params;
        const { items } = req.body;

        if (!mongoose.isValidObjectId(parentId) || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const parent = await Category.findOne({
            _id: parentId,
            type: "parent"
        });

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        if (items.length > 500) {
            return res.status(400).json({ message: "Too many items" });
        }

        const seen = new Set();

        for (const entry of items) {
            if (
                !["game", "subcategory"].includes(entry.itemType) ||
                !mongoose.isValidObjectId(entry.itemId)
            ) {
                return res.status(400).json({ message: "Invalid layout item" });
            }

            const key = `${entry.itemType}:${entry.itemId}`;

            if (seen.has(key)) {
                return res.status(400).json({ message: "Duplicate item" });
            }

            seen.add(key);

            const exists = entry.itemType === "game"
                ? await Game.exists({ _id: entry.itemId, type: "game" })
                : await Category.exists({ _id: entry.itemId, type: "subcategory" });

            if (!exists) {
                return res.status(400).json({ message: "Item does not exist" });
            }
        }

        const saved = await CategoryLayout.findOneAndUpdate(
            { parentCategory: parentId },
            {
                $set: {
                    items: items.map(({ itemType, itemId }) => ({
                        itemType,
                        itemId
                    }))
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, layout: saved });
    } catch {
        res.status(500).json({ message: "Failed to save layout" });
    }
});

module.exports = router;
