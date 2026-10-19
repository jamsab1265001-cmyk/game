
const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        gameUrl: {
            type: String,
            default: "",
            required: function () {
                return this.type === "game";
            },
            trim: true,
            validate: {
                validator: function (value) {
                    if (this.type === "category") {
                        return true;
                    }

                    try {
                        return new URL(value).protocol === "https:";
                    } catch {
                        return false;
                    }
                },
                message: "A valid HTTPS game URL is required",
            },
        },
        image: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
        },
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        }],

        type: {
            type: String,
            enum: ["game", "category"],
            default: "game",
            required: true,
        },
        linkedCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },


        sortOrder: {
            type: Number,
            default: 0,
        },

        displayStyle: {
            type: String,
            enum: ["single-item", "full-row"],
            default: "single-item",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

gameSchema.index({ categories: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Game", gameSchema);
