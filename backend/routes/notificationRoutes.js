const express = require("express");
const router = express.Router();

const { sendNotification } = require("../controllers/notificationController");
const asyncHandler = require("../utils/asyncHandler");

router.get("/test", (req, res) => {
    res.send("Notification route working");
});

router.post("/send", asyncHandler(sendNotification));

module.exports = router;