const express = require("express");
const router = express.Router();
const {
<<<<<<< HEAD
  getTasks,
  addTask,
  editTask,
  deleteTask,
  markComplete,
=======
    getTasks,
    addTask,
    editTask,
    deleteTask,
    markComplete
>>>>>>> origin/feature/new-pages-and-database-cleanup
} = require("../controllers/taskController");
const { uploadProof } = require("../controllers/uploadController");
const upload = require("../config/multer");
const asyncHandler = require("../utils/asyncHandler");
<<<<<<< HEAD
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
=======

router.get("/", asyncHandler(getTasks));
router.post("/add", asyncHandler(addTask));
router.put("/edit/:id", asyncHandler(editTask));
router.delete("/delete/:id", asyncHandler(deleteTask));
router.patch("/complete/:id", asyncHandler(markComplete));
router.post("/upload-proof/:id", upload.single("proof"), asyncHandler(uploadProof));

module.exports = router;
>>>>>>> origin/feature/new-pages-and-database-cleanup
