const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');

// Create assignment (faculty only)
router.post('/assign', auth, assignmentController.createAssignment);

// Send reminders
router.post('/send-reminders', auth, assignmentController.sendReminders);

module.exports = router;
