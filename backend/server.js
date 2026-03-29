const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const connectDB = require("./config/db");
connectDB();

// middleware
app.use(cors());
app.use(express.json());

//added uploads folder in backend and linked this to server
app.use("/uploads", express.static("uploads"));

//connecting taskRoutes
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

//connecting notificationRoutes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notify", notificationRoutes);


// test route
app.get("/", (req, res) => {
    res.send("Deadline Shield Backend Running ");
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});