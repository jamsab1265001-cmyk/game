
const mongoose = require("mongoose");

const contactSettingSchema = new mongoose.Schema(
    {
        platform: {
            type: String,
            enum: ["whatsapp", "facebook", "telegram"],
            required: true,
            unique: true
        },
        url: {
            type: String,
            required: true,
            trim: true
        },
        buttonText: {
            type: String,
            default: "Contact Now",
            maxlength: 40
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "ContactSetting",
    contactSettingSchema
);
