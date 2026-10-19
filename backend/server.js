require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Game Backend API Running"
    });
});

const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/categories", categoryRoutes);

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

const setupRoutes = require("./routes/setupRoutes");

app.use("/api/admin/setup", setupRoutes);

const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/upload", uploadRoutes);

const gameRoutes = require("./routes/gameRoutes");

app.use("/api/games", gameRoutes);

const layoutRoutes = require("./routes/layoutRoutes");

app.use("/api/layouts", layoutRoutes);

const subcategoryLayoutRoutes = require("./routes/subcategoryLayoutRoutes");

app.use("/api/subcategory-layouts", subcategoryLayoutRoutes);

const announcementRoutes = require("./routes/announcementRoutes");

app.use("/api/announcements", announcementRoutes);

const userAuthRoutes = require("./routes/userAuthRoutes");

app.use("/api/auth", userAuthRoutes);

const contactSettingRoutes = require("./routes/contactSettingRoutes");

app.use("/api/contact-settings", contactSettingRoutes);

const depositSettingRoutes = require("./routes/depositSettingRoutes");

app.use("/api/deposit-settings", depositSettingRoutes);

const depositRequestRoutes = require("./routes/depositRequestRoutes");

app.use("/api/deposit-requests", depositRequestRoutes);

const withdrawalRequestRoutes = require("./routes/withdrawalRequestRoutes");

app.use("/api/withdrawal-requests", withdrawalRequestRoutes);

const popupRoutes = require("./routes/popupRoutes");

app.use("/api/popups", popupRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
};

startServer();