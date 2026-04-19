const User = require("../models/User");
const Assignment = require("../models/Assignment");
const transporter = require("../config/mailer");

// Initialize Twilio if credentials are available
const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

// ── Student: get assignments assigned to me ───────────
exports.getMyAssignments = async (req, res) => {
    try {
        // Only students can access this
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can access this" });
        }

        const assignments = await Assignment.find({ assignedTo: req.user.id })
            .populate("assignedBy", "name email")
            .sort({ deadline: 1 });

        res.json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Student: mark assignment complete ─────────────────
exports.markAssignmentComplete = async (req, res) => {
    try {
        // Only students can access this
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can access this" });
        }

        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        const completion = assignment.completions.find(
            c => c.userId.toString() === req.user.id.toString()
        );
        if (!completion) return res.status(403).json({ success: false, message: "Not assigned to you" });

        completion.status = "completed";
        completion.completedAt = new Date().toISOString();
        await assignment.save();

        res.json({ success: true, message: "Marked as complete", data: assignment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Faculty/Admin: create assignment ──────────────────
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, deadline, assignTo, notifyType } = req.body;
        if (!title || !deadline) return res.status(400).json({ success: false, message: "Title and deadline required" });
        if (!assignTo) return res.status(400).json({ success: false, message: "assignTo is required" });

        const creator = await User.findById(req.user.id);
        if (!creator) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Only faculty and admin can create assignments
        if (!["faculty", "admin"].includes(creator.role)) {
            return res.status(403).json({ success: false, message: "Only faculty and admin can create assignments" });
        }

        // Determine target role based on creator role
        const targetRole = creator.role === "admin" ? "faculty" : "student";

        let targetUsers = [];
        if (assignTo === "all") {
            targetUsers = await User.find({ role: targetRole });
        } else if (Array.isArray(assignTo)) {
            targetUsers = await User.find({ _id: { $in: assignTo }, role: targetRole });
        }

        const completions = targetUsers.map(u => ({ userId: u._id, status: "pending" }));

        const assignment = new Assignment({
            title,
            description: description || "",
            deadline,
            notifyType: notifyType || "email",
            assignedBy: req.user.id,
            assignedTo: targetUsers.map(u => u._id),
            completions
        });

        await assignment.save();

        // Send notifications
        for (const user of targetUsers) {
            const emailBody = `Hello ${user.name},\n\nYou have a new assignment from ${creator.name}:\n\nTitle: ${title}\n${description ? `Description: ${description}\n` : ""}Deadline: ${deadline}\n\nLog in to DeadlineShield to complete it before the deadline.\n\nBest regards,\nDeadlineShield`;

            // 📧 Send EMAIL notification
            if ((notifyType === "email" || notifyType === "both") && user.email && process.env.EMAIL_USER) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: `📋 New Assignment: ${title} — Due ${deadline}`,
                        text: emailBody
                    });
                    console.log(`Email sent to ${user.email} for assignment: ${title}`);
                } catch (e) { 
                    console.error("Email notification failed:", e.message); 
                }
            }

            // 📱 Send SMS notification
            if ((notifyType === "sms" || notifyType === "both") && user.phone && twilioClient && process.env.TWILIO_SMS_FROM) {
                try {
                    await twilioClient.messages.create({
                        from: process.env.TWILIO_SMS_FROM,
                        to: user.phone,
                        body: `📋 New Assignment from ${creator.name}: "${title}" due ${deadline}. Log in to DeadlineShield to complete it.`
                    });
                    console.log(`SMS sent to ${user.phone} for assignment: ${title}`);
                } catch (e) { 
                    console.error("SMS notification failed:", e.message); 
                }
            }
        }

        res.status(201).json({ success: true, message: "Assignment created", data: assignment, assignedCount: targetUsers.length });
    } catch (err) {
        console.error("createAssignment error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Faculty: get all students ─────────────────────────
exports.getStudents = async (req, res) => {
    try {
        // Only faculty can access this
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "faculty") {
            return res.status(403).json({ success: false, message: "Only faculty can access this" });
        }

        const students = await User.find({ role: "student" }).select("name email phone createdAt");
        res.json({ success: true, data: students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin: get all faculty ────────────────────────────
exports.getFaculty = async (req, res) => {
    try {
        // Only admin can access this
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Only admin can access this" });
        }

        const faculty = await User.find({ role: "faculty" }).select("name email phone createdAt");
        res.json({ success: true, data: faculty });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Faculty/Admin: get assignments they created ────────
exports.getCreatedAssignments = async (req, res) => {
    try {
        // Only faculty and admin can access this
        const user = await User.findById(req.user.id);
        if (!user || !["faculty", "admin"].includes(user.role)) {
            return res.status(403).json({ success: false, message: "Only faculty and admin can access this" });
        }

        const assignments = await Assignment.find({ assignedBy: req.user.id })
            .populate("assignedTo", "name email")
            .populate("completions.userId", "name email")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
