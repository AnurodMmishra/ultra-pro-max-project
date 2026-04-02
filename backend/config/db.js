const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI || !String(process.env.MONGO_URI).trim()) {
        console.error(
            "MONGO_URI is missing. Open backend/.env and set MONGO_URI to your MongoDB connection string."
        );
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");
        return true;
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        return false;
    }
};

module.exports = connectDB;
