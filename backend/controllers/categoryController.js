
const Category = require("../models/Category");
const Game = require("../models/Game");
const mongoose = require("mongoose");

const slugify = (name) =>
    name.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

exports.getCategories = async (req, res) => {
    try {
        const filter = { isActive: true };

        const categories = await Category.find(filter)
            .populate("parentCategories", "name slug")
            .sort({ sortOrder: 1, createdAt: 1 });

        const legacyCategories = await Category.collection
            .find({
                parentCategory: { $type: "objectId" },
                type: { $exists: false }
            })
            .project({ _id: 1 })
            .toArray();

        const legacyIds = new Set(
            legacyCategories.map((category) => String(category._id))
        );

        categories.forEach((category) => {
            if (legacyIds.has(String(category._id))) {
                category.type = "subcategory";
            }
        });

        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const {
            name, icon, banner, type = "parent",
            sortOrder, isActive, displayStyle = "full-row"
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name required"
            });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: slugify(name),
            icon,
            banner,
            type,
            parentCategories: [],
            sortOrder,
            displayStyle: type === "subcategory" ? displayStyle : "full-row",
            isActive
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const allowed = [
            "name",
            "icon",
            "banner",
            "type",
            "parentCategories",
            "sortOrder",
            "displayStyle",
            "isActive"
        ];
        const updates = {};

        allowed.forEach((key) => {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        });

        if (updates.name !== undefined) {
            updates.slug = slugify(updates.name);
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({ success: true, category });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (category) {
            await Game.updateMany(
                { categories: id },
                { $pull: { categories: category._id } }
            );
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
