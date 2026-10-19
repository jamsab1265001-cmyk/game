
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },

        sortOrder: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "Announcement",
    announcementSchema
);
