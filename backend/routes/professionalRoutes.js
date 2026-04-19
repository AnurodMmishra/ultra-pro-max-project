const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ctrl = require("../controllers/professionalController");

// Student routes
router.get("/my-assignments", auth, asyncHandler(ctrl.getMyAssignments));
router.patch("/assignments/:id/complete", auth, asyncHandler(ctrl.markAssignmentComplete));

// Faculty / Admin routes
router.post("/assignments", auth, asyncHandler(ctrl.createAssignment));
router.get("/students", auth, asyncHandler(ctrl.getStudents));
router.get("/faculty", auth, asyncHandler(ctrl.getFaculty));
router.get("/created-assignments", auth, asyncHandler(ctrl.getCreatedAssignments));

module.exports = router;
