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
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(getTasks));
router.post("/add", asyncHandler(addTask));
router.put("/edit/:id", asyncHandler(editTask));
router.delete("/delete/:id", asyncHandler(deleteTask));
router.patch("/complete/:id", asyncHandler(markComplete));
router.post("/upload-proof/:id", upload.single("proof"), asyncHandler(uploadProof));

module.exports = router;