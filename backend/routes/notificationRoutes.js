const express = require("express");
const router = express.Router();

const { sendNotification } = require("../controllers/notificationController");

// ✅ ADD THIS TEST ROUTE
router.get("/test", (req, res) => {
    res.send("Notification route working");
});

// ✅ YOUR POST ROUTE
router.post("/send", sendNotification);

module.exports = router;