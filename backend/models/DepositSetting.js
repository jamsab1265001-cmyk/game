
const mongoose = require("mongoose");

const depositSettingSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            enum: ["Crypto", "JazzCash", "Easypaisa"],
            required: true
        },

        channel: {
            type: String,
            required: true,
            trim: true
        },

        accountDetails: {
            type: String,
            required: true,
            trim: true
        },

        accountTitle: {
            type: String,
            default: "",
            trim: true
        },

        minAmount: {
            type: Number,
            default: 100,
            min: 1
        },

        maxAmount: {
            type: Number,
            default: 100000
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

depositSettingSchema.index(
    { method: 1, channel: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "DepositSetting",
    depositSettingSchema
);
