
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WebP images allowed"));
        }
    }
});

router.post("/", auth, (req, res) => {
    upload.single("image")(req, res, async (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image required"
            });
        }

        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "game-platform",
                        resource_type: "image",
                        transformation: [
                            { width: 800, height: 800, crop: "limit" }
                        ]
                    },
                    (err, result) => err ? reject(err) : resolve(result)
                );

                stream.end(req.file.buffer);
            });

            res.status(201).json({
                success: true,
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            });
        } catch {
            res.status(500).json({
                success: false,
                message: "Image upload failed"
            });
        }
    });
});

module.exports = router;
