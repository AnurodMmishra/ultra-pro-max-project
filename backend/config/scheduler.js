const cron = require("node-cron");
const transporter = require("./mailer");
const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// This function will run every hour
const startScheduler = (TaskModel) => {

    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Scheduler running - checking deadlines...");

        try {
            const today = new Date().toISOString().split("T")[0]; // "2026-04-01"

            // Find all tasks that are due today and not completed
            const dueTasks = await TaskModel.find({
                deadline: today,
                isCompleted: false
            });

            console.log(`Found ${dueTasks.length} task(s) due today`);

            for (const task of dueTasks) {

                // 📧 EMAIL
                if (task.notifyType === "email" && task.email) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: task.email,
                        subject: "⚠️ Deadline Reminder - DeadlineShield",
                        text: `Your task "${task.title}" is due today! Please complete it and upload proof.`
                    });
                    console.log(`Email sent to ${task.email} for task: ${task.title}`);
                }

                // 📱 WHATSAPP
                else if (task.notifyType === "whatsapp" && task.phone) {
                    await client.messages.create({
                        from: process.env.TWILIO_WHATSAPP,
                        to: `whatsapp:${task.phone}`,
                        body: `⚠️ Deadline Reminder: Your task "${task.title}" is due today! Please complete it and upload proof.`
                    });
                    console.log(`WhatsApp sent to ${task.phone} for task: ${task.title}`);
                }
            }

        } catch (error) {
            console.error("Scheduler error:", error.message);
        }
    });

    console.log("✅ Scheduler started - checking every hour");
};

module.exports = startScheduler;