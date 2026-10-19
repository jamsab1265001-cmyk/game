
const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        paymentSetting: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DepositSetting",
            required: true
        },

        method: {
            type: String,
            required: true
        },

        channel: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        transactionId: {
            type: String,
            required: true,
            trim: true
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

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        }
    },
    { timestamps: true }
);

depositRequestSchema.index(
    { method: 1, transactionId: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "DepositRequest",
    depositRequestSchema
);
