
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const controller = require("../controllers/setupController");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

const onlyBeforeSetup = async (req, res, next) => {
    try {
        if (await Admin.exists({})) {
            return res.status(403).json({
                message: "Admin setup already completed"
            });
        }
        next();
    } catch {
        res.status(500).json({ message: "Database unavailable" });
    }
};

router.get("/status", controller.setupStatus);
router.post("/", limiter, onlyBeforeSetup, controller.createFirstAdmin);

module.exports = router;
