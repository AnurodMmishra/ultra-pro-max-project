const path = require("path");

const uploadProof = (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // TODO: When MongoDB is ready, update task by id in database
        // For now just return success with file info
        return res.json({
            message: "Proof uploaded successfully",
            taskId: id,
            file: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadProof };