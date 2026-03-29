const express = require("express");
const router = express.Router();
const {
    getTasks,
    addTask,
    editTask,
    deleteTask,
    markComplete
} = require("../controllers/taskController");
const { uploadProof } = require("../controllers/uploadController");
const upload = require("../config/multer");

router.get("/", getTasks);
router.post("/add", addTask);
router.put("/edit/:id", editTask);
router.delete("/delete/:id", deleteTask);
router.patch("/complete/:id", markComplete);
router.post("/upload-proof/:id", upload.single("proof"), uploadProof);

module.exports = router;