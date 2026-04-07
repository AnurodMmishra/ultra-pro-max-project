const path = require("path");
const express = require("express");
const cors = require("cors");

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

app.use(cors());
app.use(express.json());

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

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));


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
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});