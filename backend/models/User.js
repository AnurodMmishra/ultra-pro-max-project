const mongoose = require("mongoose");

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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Password is hashed in authController before save (no pre-save hooks)

module.exports = mongoose.model("User", userSchema);
