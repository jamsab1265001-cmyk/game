
const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        method: {
            type: String,
            enum: ["Crypto", "JazzCash", "Easypaisa", "Bank"],
            required: true
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

        amount: {
            type: Number,
            required: true,
            min: 100
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        payoutReference: {
            type: String,
            default: "",
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "WithdrawalRequest",
    withdrawalRequestSchema
);
