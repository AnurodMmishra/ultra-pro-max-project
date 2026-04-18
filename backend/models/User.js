const mongoose = require("mongoose");

<<<<<<< HEAD
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailOtpHash: {
      type: String,
      default: null,
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },
    phoneOtpHash: {
      type: String,
      default: null,
    },
    phoneOtpExpiresAt: {
      type: Date,
      default: null,
    },
    otpSendCount: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Date,
      default: null,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: true,
    },
    whatsappNotifications: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "other"],
      default: "other",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
=======
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    emailOtpHash: {
        type: String,
        default: null
    },
    emailOtpExpiresAt: {
        type: Date,
        default: null
    },
    phoneOtpHash: {
        type: String,
        default: null
    },
    phoneOtpExpiresAt: {
        type: Date,
        default: null
    },
    otpSendCount: {
        type: Number,
        default: 0
    },
    otpLastSentAt: {
        type: Date,
        default: null
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    smsNotifications: {
        type: Boolean,
        default: true
    },
    whatsappNotifications: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
>>>>>>> origin/feature/new-pages-and-database-cleanup

module.exports = mongoose.model("User", userSchema);
