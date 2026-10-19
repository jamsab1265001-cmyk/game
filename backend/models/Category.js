
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        icon: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
        },
        sortOrder: {
            type: Number,
            default: 0,
        },

        displayStyle: {
            type: String,
            enum: ["full-row", "single-item"],
            default: "full-row",
        },

        type: {
            type: String,
            enum: ["parent", "subcategory"],
            default: "parent",
            required: true
        },
        parentCategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],
        banner: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
