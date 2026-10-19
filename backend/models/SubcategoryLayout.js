
const mongoose = require("mongoose");

const subcategoryLayoutSchema = new mongoose.Schema({
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        unique: true
    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    }]
}, { timestamps: true });

module.exports = mongoose.model(
    "SubcategoryLayout",
    subcategoryLayoutSchema
);
