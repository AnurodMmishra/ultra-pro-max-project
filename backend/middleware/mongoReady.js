const mongoose = require("mongoose");

/** Mongoose readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting */
function mongoReady(req, res, next) {
    if (typeof next !== "function") {
        console.error("mongoReady: next is not a function");
        return res.status(500).json({ message: "Internal server error" });
    }
    if (mongoose.connection.readyState === 1) {
        return next();
    }
    return res.status(503).json({
        message: "Database not connected",
        error:
            "MongoDB Atlas is not reachable from this machine. In Atlas: Network Access → add your IP (or 0.0.0.0/0 for local testing). Database Access → ensure a database user exists and your MONGO_URI password matches. See docs/MONGODB_ATLAS_AND_SERVER_ERROR.md",
        hint: "Open http://localhost:5000/api/health in your browser to check status."
    });
}

module.exports = mongoReady;
