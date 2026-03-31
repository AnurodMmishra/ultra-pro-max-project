const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        console.log("Running without MongoDB - scheduler disabled");
        // Don't exit, keep server running
    }
};

module.exports = connectDB;