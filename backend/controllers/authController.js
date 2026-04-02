const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const twilio = require("twilio");

const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MIN_RESEND_MS = 30 * 1000; // 30 seconds

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
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

async function sendEmailOtp({ toEmail, code }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email OTP not configured (EMAIL_USER/EMAIL_PASS missing)");
    }
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: "DeadlineShield OTP Verification",
        text: `Your DeadlineShield verification code is: ${code}\n\nThis code expires in 10 minutes.`
    });
}

async function sendWhatsappOrSmsOtp({ toPhoneE164, code }) {
    if (!twilioClient) {
        throw new Error("Phone OTP not configured (TWILIO_SID/TWILIO_AUTH missing)");
    }

    // Prefer WhatsApp if configured
    if (process.env.TWILIO_WHATSAPP) {
        await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP,
            to: `whatsapp:${toPhoneE164}`,
            body: `Your DeadlineShield verification code is: ${code}. It expires in 10 minutes.`
        });
        return { channel: "whatsapp" };
    }

    // Optional SMS fallback if user adds a sending number
    if (process.env.TWILIO_SMS_FROM) {
        await twilioClient.messages.create({
            from: process.env.TWILIO_SMS_FROM,
            to: toPhoneE164,
            body: `DeadlineShield OTP: ${code} (expires in 10 minutes)`
        });
        return { channel: "sms" };
    }

    throw new Error("Phone OTP not configured (TWILIO_WHATSAPP or TWILIO_SMS_FROM missing)");
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "your_secret_key_change_in_production", {
        expiresIn: "30d"
    });
};

// REGISTER user
const register = async (req, res) => {
    try {
        console.log("Register route hit!", req.body);
        const { name, email, password, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            console.log("Missing fields:", { name, email, password });
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Check if user exists
        console.log("Checking if user exists with email:", email);
        let user = await User.findOne({ email });
        if (user) {
            console.log("User already exists");
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user (hash here — not in a Mongoose pre-save hook)
        console.log("Creating new user...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            name,
            email,
            password: hashedPassword,
            phone: phone || null
        });

        // Create OTPs and send them
        const emailOtp = generateOtpCode();
        const phoneOtp = generateOtpCode();
        await setOtp(user, { type: "email", code: emailOtp });
        await setOtp(user, { type: "phone", code: phoneOtp });

        await user.save();
        console.log("User saved successfully:", user._id);

        // Send after save (so retry doesn't create duplicate users)
        await sendEmailOtp({ toEmail: user.email, code: emailOtp });
        if (user.phone) {
            await sendWhatsappOrSmsOtp({ toPhoneE164: user.phone, code: phoneOtp });
        }

        res.json({
            message: "Registered. OTP sent to email and phone.",
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

// LOGIN user
const login = async (req, res) => {
    try {
        console.log("Login route hit!", req.body);
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            console.log("Missing credentials");
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Check if user exists
        console.log("Finding user with email:", email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password (bcrypt here — no Mongoose middleware)
        console.log("Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isEmailVerified || !user.isPhoneVerified) {
            return res.status(403).json({
                message: "Verification required",
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

// RESEND OTP (email or phone)
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

// VERIFY EMAIL OTP
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

// VERIFY PHONE OTP
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

// GET current user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, login, getMe, resendOtp, verifyEmailOtp, verifyPhoneOtp };
