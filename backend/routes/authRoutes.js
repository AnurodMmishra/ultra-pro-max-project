const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const {
  register,
  login,
  getMe,
  resendOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  updateProfile,
  logout,
} = require("../controllers/authController");
=======
const { register, login, getMe, resendOtp, verifyEmailOtp, verifyPhoneOtp, updateProfile } = require("../controllers/authController");
>>>>>>> origin/feature/new-pages-and-database-cleanup
const authMiddleware = require("../middleware/auth");
const mongoReady = require("../middleware/mongoReady");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", mongoReady, asyncHandler(register));
router.post("/login", mongoReady, asyncHandler(login));
router.post("/resend-otp", mongoReady, asyncHandler(resendOtp));
router.post("/verify-email-otp", mongoReady, asyncHandler(verifyEmailOtp));
router.post("/verify-phone-otp", mongoReady, asyncHandler(verifyPhoneOtp));
router.get("/me", mongoReady, authMiddleware, asyncHandler(getMe));
<<<<<<< HEAD
router.put(
  "/update-profile",
  mongoReady,
  authMiddleware,
  asyncHandler(updateProfile),
);
router.post("/logout", asyncHandler(logout));
=======
router.put("/update-profile", mongoReady, authMiddleware, asyncHandler(updateProfile));
>>>>>>> origin/feature/new-pages-and-database-cleanup

module.exports = router;
