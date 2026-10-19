
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const admin = await Admin.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: admin._id.toString(), role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            token,
            admin: { id: admin._id, email: admin.email }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

exports.getProfile = async (req, res) => {
    const admin = await Admin.findById(req.adminId).select("email");

    if (!admin) {
        return res.status(401).json({
            success: false,
            message: "Admin not found"
        });
    }

    res.json({ success: true, admin });
};
