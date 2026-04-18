const transporter = require("../config/mailer");
const twilio = require("twilio");

const client =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

// MAIN CONTROLLER - Send notification (email or WhatsApp)
const sendNotification = async (req, res) => {
  try {
    const { type, email, phone, title, deadline, subject, message } = req.body;

    // Validation
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Notification type is required (email or whatsapp)",
      });
    }

    // EMAIL
    if (type === "email") {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required for email notifications",
        });
      }

      const finalSubject = subject || "Deadline Reminder";
      const finalMessage =
        message || `Your task "${title}" is due on ${deadline}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: finalSubject,
        text: finalMessage,
      });

      return res.json({ success: true, message: "Email sent successfully" });
    }

    // WHATSAPP
    else if (type === "whatsapp") {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Phone is required for WhatsApp notifications",
        });
      }

      const finalMessage =
        message ||
        `⚠️ Deadline Reminder: Your task "${title}" is due on ${deadline}`;

      if (!client) {
        return res
          .status(503)
          .json({
            success: false,
            message: "WhatsApp notifications are not configured",
          });
      }

      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP,
        to: `whatsapp:${phone}`,
        body: finalMessage,
      });

      return res.json({
        success: true,
        message: "WhatsApp message sent successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type. Use 'email' or 'whatsapp'.",
      });
    }
  } catch (error) {
    console.error("Notification Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { sendNotification };
