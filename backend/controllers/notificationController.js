const transporter = require("../config/mailer");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// MAIN CONTROLLER
const sendNotification = async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const { type, email, phone, title, deadline, subject, message } = req.body;

        // EMAIL
        if (type === "email") {

            const finalSubject = subject || "Deadline Reminder";
            const finalMessage =
                message || `Your task "${title}" is due on ${deadline}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: finalSubject,
                text: finalMessage
            });

            return res.json({ message: "Email sent" });
        }

        //  WHATSAPP
        else if (type === "whatsapp") {

            const finalMessage =
                message || `Your task "${title}" is due on ${deadline}`;

            await client.messages.create({
                from: process.env.TWILIO_WHATSAPP,
                to: `whatsapp:${phone}`,
                body: finalMessage
            });

            return res.json({ message: "WhatsApp message sent" });
        }

        else {
            return res.status(400).json({
                message: "Invalid notification type. Use email or whatsapp."
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { sendNotification };