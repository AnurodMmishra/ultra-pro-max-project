const path = require("path");
const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const startScheduler = require("./config/scheduler");
const Task = require("./models/Task");

connectDB().then((connected) => {
<<<<<<< HEAD
  if (connected) {
    startScheduler(Task);
  }
=======
    if (connected) {
        startScheduler(Task);
    }
>>>>>>> origin/feature/new-pages-and-database-cleanup
});

const app = express();

<<<<<<< HEAD
// Configure CORS with simple approach - must be FIRST
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  next();
});

// Explicitly handle all OPTIONS preflight for /api/* (regex for Express)
app.options(/^\/api\//, (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging for debugging 405 errors
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${req.method}] ${req.path} -> ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  next();
});

function sendHealth(req, res) {
  const state = mongoose.connection.readyState;
  const labels = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({
    ok: state === 1,
    mongo: {
      state,
      stateLabel: labels[state] || "unknown",
      connected: state === 1,
    },
    hint:
      state !== 1
        ? "Fix MongoDB Atlas: Network Access (IP whitelist) + Database Access (user/password in MONGO_URI). See docs/MONGODB_ATLAS_AND_SERVER_ERROR.md"
        : "API ready.",
  });
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
}

app.get("/api/health", sendHealth);
app.get("/api/health/", sendHealth);

app.get("/api", (req, res) => {
<<<<<<< HEAD
  res.json({
    name: "Deadline Shield API",
    message: "Server is running. Use http:// (not https://) on port 5000.",
    endpoints: {
      health: "GET /api/health",
      auth: "POST /api/auth/register | /api/auth/login",
      tasks: "GET /api/tasks",
      assignments: "POST /api/assignments/assign",
    },
  });
=======
    res.json({
        name: "Deadline Shield API",
        message: "Server is running. Use http:// (not https://) on port 5000.",
        endpoints: {
            health: "GET /api/health",
            auth: "POST /api/auth/register | /api/auth/login",
            tasks: "GET /api/tasks"
        }
    });
>>>>>>> origin/feature/new-pages-and-database-cleanup
});

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
<<<<<<< HEAD
const assignmentRoutes = require("./routes/assignmentRoutes");
const professionalRoutes = require("./routes/professionalRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/professional", professionalRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const status = err && typeof err.status === "number" ? err.status : 500;
  const message =
    err && typeof err.message === "string" && err.message
      ? err.message
      : "Server error";
  if (!res.headersSent) {
    res.status(status).json({
      message,
      error: process.env.NODE_ENV === "development" ? message : undefined,
    });
  }
=======

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
>>>>>>> origin/feature/new-pages-and-database-cleanup
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server running: http://localhost:${PORT}`);
});
=======
    console.log(`Server running: http://localhost:${PORT}`);
});
>>>>>>> origin/feature/new-pages-and-database-cleanup
