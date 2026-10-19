
const Game = require("../models/Game");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const allowedFields = [
    "name", "gameUrl", "image", "categories",
    "type", "linkedCategory", "sortOrder", "isActive"
];

const validateCategories = async (ids) => {
    if (!Array.isArray(ids) || !ids.every(mongoose.isValidObjectId)) {
        return false;
    }

    const count = await Category.countDocuments({
        _id: { $in: ids }
    });

    return count === new Set(ids.map(String)).size;
};

exports.getGames = async (req, res) => {
    try {
        const filter = { isActive: true };

        if (req.query.category) {
            if (!mongoose.isValidObjectId(req.query.category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }
            filter.categories = req.query.category;
        }

        const games = await Game.find(filter)
            .populate("categories", "name slug").populate("linkedCategory", "name slug banner")
            .sort({ sortOrder: 1, createdAt: -1 });

        res.json({ success: true, games });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load games"
        });
    }
};

exports.getAdminGames = async (req, res) => {
    try {
        const games = await Game.find()
            .populate("categories", "name slug").populate("linkedCategory", "name slug banner")
            .sort({ sortOrder: 1, createdAt: -1 });

        res.json({ success: true, games });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to load games"
        });
    }
};


exports.createGame = async (req, res) => {
    try {
        const {
            name, gameUrl, image,
            isActive = true,
            displayStyle = "single-item"
        } = req.body;

        const game = await Game.create({
            name,
            gameUrl,
            image,
            type: "game",
            categories: [],
            linkedCategory: null,
            displayStyle,
            isActive
        });

        res.status(201).json({ success: true, game });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid game ID"
            });
        }

        const updates = {};

        ["name", "gameUrl", "image", "isActive", "displayStyle"].forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });


        const game = await Game.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            });
        }

        res.json({ success: true, game });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid game ID"
            });
        }

        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
            });
        }

        res.json({ success: true });
    } catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete game"
        });
    }
};
