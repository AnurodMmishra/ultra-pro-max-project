const path = require("path");
const Task = require("../models/Task");

const uploadProof = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Update task in database with proof image path
        const task = await Task.findByIdAndUpdate(
            id,
            { proofImage: `/uploads/${req.file.filename}` },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        return res.json({
            success: true,
            message: "Proof uploaded successfully",
            data: task
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { uploadProof };