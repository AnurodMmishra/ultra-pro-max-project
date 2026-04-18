const cron = require("node-cron");
const transporter = require("./mailer");
const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

// This function will run every hour
const startScheduler = (TaskModel) => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Scheduler running - checking deadlines...");

    try {
      const today = new Date().toISOString().split("T")[0]; // "2026-04-01"

      // ═══ PROCESS PERSONAL TASKS ═══
      const dueTasks = await TaskModel.find({
        deadline: today,
        isCompleted: false,
      });

      console.log(`Found ${dueTasks.length} personal task(s) due today`);

      for (const task of dueTasks) {
        // 📧 EMAIL
        if (
          (task.notifyType === "email" || task.notifyType === "both") &&
          task.email
        ) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: task.email,
              subject: "⚠️ Deadline Reminder - DeadlineShield",
              text: `Your task "${task.title}" is due today! Please complete it and upload proof.`,
            });
            console.log(`Email sent to ${task.email} for task: ${task.title}`);
          } catch (e) {
            console.error(`Email failed for task ${task.title}:`, e.message);
          }
        }

        // 📱 SMS
        if (
          (task.notifyType === "sms" || task.notifyType === "both") &&
          task.phone &&
          twilioClient &&
          process.env.TWILIO_SMS_FROM
        ) {
          try {
            await twilioClient.messages.create({
              from: process.env.TWILIO_SMS_FROM,
              to: task.phone,
              body: `⚠️ DeadlineShield Reminder: Your task "${task.title}" is due today! Please complete it.`,
            });
            console.log(`SMS sent to ${task.phone} for task: ${task.title}`);
          } catch (smsErr) {
            console.error(`SMS failed for task ${task.title}:`, smsErr.message);
          }
        }

        // 📱 WHATSAPP (legacy support)
        if (task.notifyType === "whatsapp" && task.phone && twilioClient) {
          try {
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: `whatsapp:${task.phone}`,
              body: `⚠️ Deadline Reminder: Your task "${task.title}" is due today! Please complete it and upload proof.`,
            });
            console.log(
              `WhatsApp sent to ${task.phone} for task: ${task.title}`,
            );
          } catch (waErr) {
            console.error(
              `WhatsApp failed for task ${task.title}:`,
              waErr.message,
            );
          }
        }
      }

      // ═══ PROCESS PROFESSIONAL ASSIGNMENTS ═══
      const AssignmentModel = require("../models/Assignment");
      const UserModel = require("../models/User");
      
      const dueAssignments = await AssignmentModel.find({
        deadline: today
      }).populate("assignedTo", "email phone name");

      console.log(`Found ${dueAssignments.length} assignment(s) due today`);

      for (const assignment of dueAssignments) {
        // For each user assigned to this assignment
        for (const assignedUser of assignment.assignedTo) {
          // Check if this user has already completed it
          const completion = assignment.completions.find(
            c => c.userId.toString() === assignedUser._id.toString()
          );
          
          if (completion && completion.status === "completed") {
            continue; // Skip if already completed
          }

          // 📧 Send EMAIL notification
          if ((assignment.notifyType === "email" || assignment.notifyType === "both") && assignedUser.email && process.env.EMAIL_USER) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: assignedUser.email,
                subject: `⚠️ Assignment Deadline Reminder - ${assignment.title}`,
                text: `Hello ${assignedUser.name},\n\nThis is a reminder that your assignment "${assignment.title}" is due today!\n\n${assignment.description ? `Description: ${assignment.description}\n` : ""}Please log in to DeadlineShield to complete it before the deadline.\n\nBest regards,\nDeadlineShield`
              });
              console.log(`Email sent to ${assignedUser.email} for assignment: ${assignment.title}`);
            } catch (e) {
              console.error(`Email failed for assignment ${assignment.title}:`, e.message);
            }
          }

          // 📱 Send SMS notification
          if ((assignment.notifyType === "sms" || assignment.notifyType === "both") && assignedUser.phone && twilioClient && process.env.TWILIO_SMS_FROM) {
            try {
              await twilioClient.messages.create({
                from: process.env.TWILIO_SMS_FROM,
                to: assignedUser.phone,
                body: `⚠️ DeadlineShield Reminder: Assignment "${assignment.title}" is due today! Log in to complete it.`
              });
              console.log(`SMS sent to ${assignedUser.phone} for assignment: ${assignment.title}`);
            } catch (smsErr) {
              console.error(`SMS failed for assignment ${assignment.title}:`, smsErr.message);
            }
          }
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error.message);
    }
  });

  console.log("✅ Scheduler started - checking every hour");
};

module.exports = startScheduler;
