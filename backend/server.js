const path = require("path");
const express = require("express");
const cors = require("cors");

// Always load backend/.env even if you start Node from the project root
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const startScheduler = require("./config/scheduler");
const Task = require("./models/Task");

connectDB().then((connected) => {
    if (connected) {
        startScheduler(Task);
    }
});

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// --- Register /api/health and /api BEFORE any app.use("/api/...", router) so nothing can shadow them (Express 5) ---
function sendHealth(req, res) {
    const state = mongoose.connection.readyState;
    const labels = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    res.json({
        ok: state === 1,
        mongo: {
            state,
            stateLabel: labels[state] || "unknown",
            connected: state === 1
        },
        hint:
            state !== 1
                ? "Fix MongoDB Atlas: Network Access (IP whitelist) + Database Access (user/password in MONGO_URI). See docs/MONGODB_ATLAS_AND_SERVER_ERROR.md"
                : "API ready."
    });
}

app.get("/api/health", sendHealth);
app.get("/api/health/", sendHealth);

app.get("/api", (req, res) => {
    res.json({
        name: "Deadline Shield API",
        message: "Server is running. Use http:// (not https://) on port 5000.",
        endpoints: {
            health: "GET /api/health",
            auth: "POST /api/auth/register | /api/auth/login",
            tasks: "GET /api/tasks"
        }
    });
});

// Friendly landing (browser)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "api-test.html"));
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notify", notificationRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// 404 handler - return JSON instead of HTML
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", path: req.path, method: req.method });
});

// Global error handler - return JSON instead of HTML
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    const status = err && typeof err.status === "number" ? err.status : 500;
    const message =
        err && typeof err.message === "string" && err.message ? err.message : "Server error";
    if (!res.headersSent) {
        res.status(status).json({
            message,
            error: process.env.NODE_ENV === "development" ? message : undefined
        });
    }
});

const PORT = process.env.PORT || 5000;
// Listen on all interfaces so http://127.0.0.1 and http://localhost both work reliably on Windows
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running:`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  http://127.0.0.1:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});