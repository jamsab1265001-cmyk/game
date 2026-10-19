
const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        type: {
            type: String,
            enum: ["image", "text"],
            required: true
        },

        image: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" }
        },

        text: {
            type: String,
            default: "",
            maxlength: 1000
        },

        targetType: {
            type: String,
            enum: ["internal", "external"],
            required: true
        },

        target: {
            type: String,
            required: true,
            trim: true
        },

        intensity: {
            type: Number,
            min: 1,
            max: 10,
            default: 5
        },

        intervalSeconds: {
            type: Number,
            min: 10,
            max: 3600,
            default: 60
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Popup", popupSchema);
