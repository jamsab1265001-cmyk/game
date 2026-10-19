
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required"
        });
    }

    try {
        const token = authorization.slice(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin" || !decoded.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        req.adminId = decoded.id;
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
