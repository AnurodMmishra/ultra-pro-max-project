const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const startScheduler = require("./config/scheduler");
const Task = require("./models/Task");

connectDB().then(() => {
    // Start scheduler only after MongoDB connects
    startScheduler(Task);
});

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notify", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Deadline Shield Backend Running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});