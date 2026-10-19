
const express = require("express");
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const { login, getProfile } = require("../controllers/adminController");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

router.post("/login", loginLimiter, login);
router.get("/me", auth, getProfile);

module.exports = router;
