
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

exports.setupStatus = async (req, res) => {
    try {
        const count = await Admin.countDocuments();
        res.json({ setupRequired: count === 0 });
    } catch {
        res.status(500).json({ message: "Database unavailable" });
    }
};

exports.createFirstAdmin = async (req, res) => {
    try {
        const { email, password, setupKey } = req.body || {};

        if (typeof email !== "string" ||
            typeof setupKey !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        if (!process.env.ADMIN_SETUP_KEY ||
            setupKey !== process.env.ADMIN_SETUP_KEY) {
            return res.status(403).json({ message: "Invalid setup key" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
            typeof password !== "string" || password.length < 12) {
            return res.status(400).json({
                message: "Valid email and minimum 12-character password required"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await Admin.create({
            email: email.trim().toLowerCase(),
            password: passwordHash
        });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 500).json({
            message: "Admin setup failed"
        });
    }
};
