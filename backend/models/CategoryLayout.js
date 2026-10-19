
const mongoose = require("mongoose");

const categoryLayoutSchema = new mongoose.Schema({
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        unique: true
    },
    items: [{
        itemType: {
            type: String,
            enum: ["game", "subcategory"],
            required: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("CategoryLayout", categoryLayoutSchema);
