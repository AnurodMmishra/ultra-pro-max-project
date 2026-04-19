const Task = require("../models/Task");
const User = require("../models/User");
const transporter = require("../config/mailer");

// ── Create Assignment ─────────────────────────────────
exports.createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            deadline,
            assignTo,
            requireProof,
            sendEmail,
            sendSMS
        } = req.body;

        if (!title || !deadline) {
            return res.status(400).json({ message: "Title and deadline are required" });
        }

        if (!assignTo) {
            return res.status(400).json({ message: "assignTo is required" });
        }

        // Determine notifyType based on what channels are requested
        let notifyType = "email";
        if (sendEmail && sendSMS) notifyType = "both";
        else if (sendSMS) notifyType = "sms";
        else notifyType = "email";

        const assignment = new Task({
            title,
            description: description || "",
            deadline,
            notifyType,
            email: null,
            phone: null,
            isCompleted: false,
            proofImage: null
        });

        await assignment.save();

        // Collect users to notify based on assignTo criteria
        let assignedUsers = [];
        try {
            if (assignTo === "all") {
                assignedUsers = await User.find({});
            } else if (assignTo === "individual" && req.body.individualUsers) {
                assignedUsers = await User.find({
                    _id: { $in: req.body.individualUsers }
                });
            }
        } catch (userErr) {
            console.error("Failed to fetch assigned users:", userErr.message);
        }

        // Send email notifications if requested
        if ((sendEmail || notifyType === "email" || notifyType === "both") && assignedUsers.length > 0) {
            for (const user of assignedUsers) {
                if (user.email && user.emailNotifications !== false) {
                    try {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: user.email,
                            subject: `📋 New Assignment: ${title}`,
                            text: `Hello ${user.name},\n\nYou have been assigned a new task:\n\nTitle: ${title}\n${description ? `Description: ${description}\n` : ""}Deadline: ${deadline}\n\nPlease log in to DeadlineShield to view and complete this assignment.\n\nGood luck!`
                        });
                        console.log(`Assignment notification sent to ${user.email}`);
                    } catch (mailErr) {
                        console.error(`Failed to notify ${user.email}:`, mailErr.message);
                    }
                }
            }
        }

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment,
            assignedCount: assignedUsers.length
        });

    } catch (error) {
        console.error("Assignment creation error:", error);
        return res.status(500).json({ message: "Failed to create assignment", error: error.message });
    }
};

// ── Send Reminders ────────────────────────────────────
exports.sendReminders = async (req, res) => {
    try {
        const { taskId, reminderTimes, channels } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: "taskId is required" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const deadlineDate = new Date(task.deadline + "T23:59:59");
        const now = new Date();

        if (deadlineDate <= now) {
            return res.status(400).json({ message: "Deadline has already passed" });
        }

        const times = Array.isArray(reminderTimes) ? reminderTimes : ["24h"];
        let scheduled = 0;

        for (const time of times) {
            let msOffset = 0;
            if (time === "24h")  msOffset = 24 * 60 * 60 * 1000;
            else if (time === "2h")  msOffset = 2 * 60 * 60 * 1000;
            else if (time === "30m") msOffset = 30 * 60 * 1000;
            else continue;

            const reminderAt = new Date(deadlineDate.getTime() - msOffset);
            const delay = reminderAt.getTime() - now.getTime();

            if (delay <= 0) continue; // already past

            setTimeout(async () => {
                try {
                    const fresh = await Task.findById(taskId);
                    if (!fresh || fresh.isCompleted) return;

                    const label = time === "24h" ? "24 hours" : time === "2h" ? "2 hours" : "30 minutes";

                    if ((!channels || channels.includes("email")) && fresh.email) {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: fresh.email,
                            subject: `⚠️ Reminder: "${fresh.title}" due in ${label}`,
                            text: `This is a reminder that your task "${fresh.title}" is due in ${label} (${fresh.deadline}).\n\nPlease complete it before the deadline!`
                        });
                        console.log(`Reminder (${time}) sent to ${fresh.email} for: ${fresh.title}`);
                    }
                } catch (err) {
                    console.error(`Scheduled reminder error (${time}):`, err.message);
                }
            }, delay);

            scheduled++;
        }

        return res.json({
            message: `${scheduled} reminder(s) scheduled successfully`,
            taskId,
            scheduled
        });

    } catch (error) {
        console.error("Send reminders error:", error);
        return res.status(500).json({ message: "Failed to schedule reminders", error: error.message });
    }
};
