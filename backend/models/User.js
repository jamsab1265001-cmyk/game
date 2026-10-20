
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^\+923\d{9}$/
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        reservedBalance: {
            type: Number,
            default: 0,
            min: 0
        },

        balance: {
            type: Number,
            default: 0,
            min: 0
        },

        vipLevel: {
            type: Number,
            default: 1,
            min: 1
        },

        totalDeposits: {
            type: Number,
            default: 0,
            min: 0
        },

        totalBets: {
            type: Number,
            default: 0,
            min: 0
        },
        inviteCode: {
            type: String,
            trim: true,
            default: ""
        },
        referredBy: {
            type: String,
            trim: true,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
