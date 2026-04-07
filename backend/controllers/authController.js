const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const twilio = require("twilio");

const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MIN_RESEND_MS = 30 * 1000;
const UNVERIFIED_USER_CLEANUP_MS = 30 * 60 * 1000;

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function setOtp(user, { type, code }) {
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    if (type === "email") {
        user.emailOtpHash = hash;
        user.emailOtpExpiresAt = expiresAt;
    } else if (type === "phone") {
        user.phoneOtpHash = hash;
        user.phoneOtpExpiresAt = expiresAt;
    } else {
        throw new Error("Invalid OTP type");
    }
    user.otpSendCount = (user.otpSendCount || 0) + 1;
    user.otpLastSentAt = new Date();
}

function canResendOtp(user) {
    if (!user.otpLastSentAt) return true;
    return Date.now() - new Date(user.otpLastSentAt).getTime() >= OTP_MIN_RESEND_MS;
}

async function cleanupUnverifiedUsers() {
    try {
        const cutoffTime = new Date(Date.now() - UNVERIFIED_USER_CLEANUP_MS);
        const result = await User.deleteMany({
            $or: [
                { isEmailVerified: false, isPhoneVerified: false, createdAt: { $lt: cutoffTime } },
                { isEmailVerified: false, createdAt: { $lt: cutoffTime } },
                { isPhoneVerified: false, createdAt: { $lt: cutoffTime } }
            ]
        });
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} unverified users older than 30 minutes`);
        }
    } catch (error) {
        console.error("Error cleaning up unverified users:", error);
    }
}

async function sendEmailOtp({ toEmail, code }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email OTP not configured (EMAIL_USER/EMAIL_PASS missing)");
        return; // Skip email OTP instead of throwing error
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: "DeadlineShield OTP Verification",
            text: `Your DeadlineShield verification code is: ${code}\n\nThis code expires in 10 minutes.`
        });
        console.log("Email OTP sent successfully to:", toEmail);
    } catch (error) {
        console.error("Failed to send email OTP:", error.message);
        // Don't throw error, just log it - allow registration to continue
    }
}

async function sendWhatsappOrSmsOtp({ toPhoneE164, code }) {
    if (!twilioClient) {
        console.log("Phone OTP not configured (TWILIO_SID/TWILIO_AUTH missing)");
        return; // Skip phone OTP instead of throwing error
    }

    // Validate phone number format
    if (!toPhoneE164 || !/^\+[\d]{10,15}$/.test(toPhoneE164)) {
        console.log("Invalid phone number format for OTP:", toPhoneE164);
        return; // Skip invalid phone numbers
    }

    // Always use SMS for OTP - WhatsApp requires pre-approved templates
    if (process.env.TWILIO_SMS_FROM) {
        try {
            await twilioClient.messages.create({
                from: process.env.TWILIO_SMS_FROM,
                to: toPhoneE164,
                body: `DeadlineShield OTP: ${code} (expires in 10 minutes)`
            });
            console.log("SMS OTP sent successfully to:", toPhoneE164);
            return { channel: "sms" };
        } catch (error) {
            console.error("Failed to send SMS OTP:", error.message);
            // Don't throw error, just log it - allow registration to continue
        }
    }

    console.log("Phone OTP not configured (TWILIO_SMS_FROM missing)");
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "your_secret_key_change_in_production", {
        expiresIn: "30d"
    });
};

const register = async (req, res) => {
    try {
        console.log("Register route hit!", req.body);
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            console.log("Missing fields:", { name, email, password });
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Clean up old unverified users periodically
        await cleanupUnverifiedUsers();

        // Check if user already exists and is fully verified
        let existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isEmailVerified && existingUser.isPhoneVerified) {
            console.log("User already exists and is verified");
            return res.status(400).json({ message: "User already exists" });
        }

        // If user exists but is not verified, delete the old registration
        if (existingUser) {
            console.log("Deleting unverified user for re-registration");
            await User.deleteOne({ email });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with verification flags set to false
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            isEmailVerified: false,
            isPhoneVerified: false
        });

        const emailOtp = generateOtpCode();
        const phoneOtp = generateOtpCode();
        await setOtp(user, { type: "email", code: emailOtp });
        await setOtp(user, { type: "phone", code: phoneOtp });

        // Save user but mark as unverified
        await user.save();
        console.log("User saved successfully (unverified):", user._id);

        try {
            await sendEmailOtp({ toEmail: user.email, code: emailOtp });
            if (user.phone) {
                await sendWhatsappOrSmsOtp({ toPhoneE164: user.phone, code: phoneOtp });
            }
        } catch (otpError) {
            console.error("Failed to send OTP:", otpError);
            // Delete user since OTP sending failed
            await User.deleteOne({ email });
            return res.status(500).json({
                message: "Failed to send verification codes. Please try again."
            });
        }

        res.json({
            message: "Registration initiated. Please verify your email and phone.",
            requiresVerification: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        const msg = error.message || "Server error";
        const isMongo =
            /mongo|buffering timed out|ECONNREFUSED|ENOTFOUND|Atlas|network/i.test(msg);
        res.status(500).json({
            message: isMongo ? "Database error — check MongoDB connection" : "Server error",
            error: msg
        });
    }
};

const login = async (req, res) => {
    try {
        console.log("Login route hit!", req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log("Missing credentials");
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Strict verification check - both email and phone must be verified
        if (!user.isEmailVerified || !user.isPhoneVerified) {
            console.log("User not fully verified:", { 
                emailVerified: user.isEmailVerified, 
                phoneVerified: user.isPhoneVerified 
            });
            return res.status(403).json({
                message: "Account verification required. Please verify both email and phone.",
                needsEmailVerification: !user.isEmailVerified,
                needsPhoneVerification: !user.isPhoneVerified
            });
        }

        const token = generateToken(user._id);

        res.json({
            message: "Logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        const msg = error.message || "Server error";
        const isMongo =
            /mongo|buffering timed out|ECONNREFUSED|ENOTFOUND|Atlas|network/i.test(msg);
        res.status(500).json({
            message: isMongo ? "Database error — check MongoDB connection" : "Server error",
            error: msg
        });
    }
};

const resendOtp = async (req, res) => {
    const { email, type } = req.body;
    if (!email || !type) {
        return res.status(400).json({ message: "email and type are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!canResendOtp(user)) {
        return res.status(429).json({ message: "Please wait before requesting another OTP" });
    }

    const code = generateOtpCode();
    await setOtp(user, { type, code });
    await user.save();

    if (type === "email") {
        await sendEmailOtp({ toEmail: user.email, code });
        return res.json({ message: "Email OTP sent" });
    }

    if (!user.phone) {
        return res.status(400).json({ message: "No phone number on account" });
    }
    const info = await sendWhatsappOrSmsOtp({ toPhoneE164: user.phone, code });
    return res.json({ message: `Phone OTP sent via ${info.channel}` });
};

const verifyEmailOtp = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "email and code are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emailOtpHash || !user.emailOtpExpiresAt || new Date(user.emailOtpExpiresAt) < new Date()) {
        return res.status(400).json({ message: "Email OTP expired. Request a new one." });
    }

    const ok = await bcrypt.compare(String(code).trim(), user.emailOtpHash);
    if (!ok) return res.status(400).json({ message: "Invalid email OTP" });

    user.isEmailVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpiresAt = null;
    await user.save();

    return res.json({
        message: "Email verified",
        isEmailVerified: true,
        isPhoneVerified: user.isPhoneVerified
    });
};

const verifyPhoneOtp = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "email and code are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.phoneOtpHash || !user.phoneOtpExpiresAt || new Date(user.phoneOtpExpiresAt) < new Date()) {
        return res.status(400).json({ message: "Phone OTP expired. Request a new one." });
    }

    const ok = await bcrypt.compare(String(code).trim(), user.phoneOtpHash);
    if (!ok) return res.status(400).json({ message: "Invalid phone OTP" });

    user.isPhoneVerified = true;
    user.phoneOtpHash = null;
    user.phoneOtpExpiresAt = null;
    await user.save();

    return res.json({
        message: "Phone verified",
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: true
    });
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, emailNotifications, smsNotifications, whatsappNotifications } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
        if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;
        if (whatsappNotifications !== undefined) updateData.whatsappNotifications = whatsappNotifications;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        
        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                whatsappNotifications: user.whatsappNotifications
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login, getMe, resendOtp, verifyEmailOtp, verifyPhoneOtp, updateProfile };
