const express = require("express");
const router = express.Router();
const {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  markComplete,
} = require("../controllers/taskController");
const { uploadProof } = require("../controllers/uploadController");
const upload = require("../config/multer");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, asyncHandler(getTasks));
router.post("/add", authMiddleware, asyncHandler(addTask));
router.put("/edit/:id", authMiddleware, asyncHandler(editTask));
router.delete("/delete/:id", authMiddleware, asyncHandler(deleteTask));
router.patch("/complete/:id", authMiddleware, asyncHandler(markComplete));
router.post(
  "/upload-proof/:id",
  authMiddleware,
  upload.single("proof"),
  asyncHandler(uploadProof),
);

module.exports = router;
