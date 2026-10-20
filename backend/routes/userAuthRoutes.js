
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

async function generateInviteCode() {
    let code;
    do {
        code = crypto.randomBytes(6).toString("hex").toUpperCase();
    } while (await User.exists({ inviteCode: code }));
    return code;
}

// Pakistan mobile number: 03001234567 or +923001234567
function normalizeMobile(value) {
    const mobile = String(value || "").replace(/[\s-]/g, "");

    if (/^03\d{9}$/.test(mobile)) {
        return "+92" + mobile.slice(1);
    }

    if (/^3\d{9}$/.test(mobile)) {
        return "+92" + mobile;
    }

    if (/^\+923\d{9}$/.test(mobile)) {
        return mobile;
    }

    return null;
}

function createToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { mobile, password, inviteCode = "" } = req.body || {};

        const normalizedMobile = normalizeMobile(mobile);

        if (!normalizedMobile) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Pakistan mobile number"
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        if (typeof inviteCode !== "string" || inviteCode.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Invalid invite code"
            });
        }

        const existing = await User.exists({ mobile: normalizedMobile });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "This mobile number is already registered"
            });
        }

        const referredBy = inviteCode.trim();

        if (referredBy && !(await User.exists({ inviteCode: referredBy }))) {
            return res.status(400).json({
                success: false,
                message: "Invalid invitation code"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const ownInviteCode = await generateInviteCode();

        const user = await User.create({
            mobile: normalizedMobile,
            password: hashedPassword,
            inviteCode: ownInviteCode,
            referredBy
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token: createToken(user),
            user: {
                id: user._id,
                mobile: user.mobile,
                inviteCode: user.inviteCode
            }
        });
    } catch (error) {
        res.status(error.code === 11000 ? 409 : 500).json({
            success: false,
            message: error.code === 11000
                ? "This mobile number is already registered"
                : "Registration failed"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { mobile, password } = req.body || {};
        const normalizedMobile = normalizeMobile(mobile);

        if (!normalizedMobile || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Enter a valid mobile number and password"
            });
        }

        const user = await User.findOne({
            mobile: normalizedMobile
        }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            token: createToken(user),
            user: {
                id: user._id,
                mobile: user.mobile,
                inviteCode: user.inviteCode
            }
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// Logged-in user's VIP details
router.get("/vip", async (req, res) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ")
            ? header.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({ message: "Login required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "user") {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findOne({
            _id: decoded.id,
            isActive: true
        }).select("mobile vipLevel totalDeposits totalBets");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        res.json({
            success: true,
            vip: {
                uid: user._id.toString().slice(-8).toUpperCase(),
                level: user.vipLevel ?? 1,
                totalDeposits: user.totalDeposits ?? 0,
                totalBets: user.totalBets ?? 0
            }
        });
    } catch {
        res.status(401).json({ message: "Invalid or expired session" });
    }
});

module.exports = router;
