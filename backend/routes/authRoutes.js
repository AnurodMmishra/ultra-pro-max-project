const express = require("express");
const router = express.Router();
const { register, login, getMe, resendOtp, verifyEmailOtp, verifyPhoneOtp } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const mongoReady = require("../middleware/mongoReady");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", mongoReady, asyncHandler(register));
router.post("/login", mongoReady, asyncHandler(login));
router.post("/resend-otp", mongoReady, asyncHandler(resendOtp));
router.post("/verify-email-otp", mongoReady, asyncHandler(verifyEmailOtp));
router.post("/verify-phone-otp", mongoReady, asyncHandler(verifyPhoneOtp));
router.get("/me", mongoReady, authMiddleware, asyncHandler(getMe));

module.exports = router;
