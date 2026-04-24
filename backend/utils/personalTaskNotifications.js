const transporter = require("../config/mailer");

const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePhoneNumber(phone) {
  const raw = String(phone || "").trim();
  if (!raw) return "";

  if (raw.startsWith("+")) {
    const digitsWithPlus = raw.slice(1).replace(/\D/g, "");
    if (digitsWithPlus.length === 10 && /^[6-9]/.test(digitsWithPlus)) {
      return `+91${digitsWithPlus}`;
    }
    return digitsWithPlus ? `+${digitsWithPlus}` : "";
  }

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Default local 10-digit mobile numbers to India.
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  if (
    digits.length === 11 &&
    digits.startsWith("0") &&
    /^[6-9]/.test(digits.slice(1))
  ) {
    return `+91${digits.slice(1)}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    /^[6-9]/.test(digits.slice(2))
  ) {
    return `+${digits}`;
  }

  if (/^\d{8,15}$/.test(digits)) {
    return `+${digits}`;
  }

  return "";
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim());
}

function isValidPhone(phone) {
  return E164_REGEX.test(normalizePhoneNumber(phone));
}

function createChannelState(requested, recipient) {
  return {
    requested,
    recipient: recipient || null,
    delivered: false,
    error: null,
  };
}

function buildNotificationContent({ task, stage, appUrl, today }) {
  const safeTitle = escapeHtml(task.title || "Untitled Task");
  const deadline = task.deadline || "No deadline";
  const dashboardUrl = `${String(appUrl || "http://localhost:5000").replace(/\/$/, "")}/dashboard`;
  const isOverdue = stage === "deadline" && deadline < today;

  if (stage === "deadline") {
    const headline = isOverdue
      ? "Your task is overdue"
      : "Your task is due today";
    const smsPrefix = isOverdue ? "OVERDUE" : "due TODAY";
    return {
      emailSubject: isOverdue
        ? `⚠️ Overdue Task Reminder: "${task.title}" — DeadlineShield`
        : `⚠️ Deadline Today: "${task.title}" — DeadlineShield`,
      emailHtml: `<div style="font-family:Arial,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
<h2 style="color:#00ffff;">⏰ DeadlineShield</h2>
<p style="font-size:16px;color:#f5f5f5;margin-bottom:18px;">${headline}.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-left:4px solid #ff6b6b;border-radius:8px;padding:16px;margin:16px 0;">
<strong style="font-size:18px;color:#fff;">${safeTitle}</strong>
<p style="color:#aaa;margin:8px 0 0;">📅 Deadline: ${escapeHtml(deadline)}</p>
</div>
<p style="color:#bbb;line-height:1.6;">Complete the task${task.requireProof ? " and upload your proof photo" : ""} to stop reminders.</p>
<p style="margin-top:20px;"><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;background:#00ffff;color:#111;text-decoration:none;border-radius:8px;font-weight:700;">Open Dashboard</a></p>
</div>`,
      emailText: `DeadlineShield reminder: "${task.title}" is ${isOverdue ? "overdue" : "due today"} (${deadline}). Open ${dashboardUrl} to complete it.`,
      smsBody: `⚠️ DeadlineShield: Task "${task.title}" is ${smsPrefix} (${deadline}). Complete it${task.requireProof ? " and upload proof" : ""}.`,
    };
  }

  return {
    emailSubject: `✅ Task Created: "${task.title}" — Due ${deadline}`,
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
<h2 style="color:#00ffff;">⏰ DeadlineShield</h2>
<p>Your task has been created successfully.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-left:4px solid #00ffff;border-radius:8px;padding:16px;margin:16px 0;">
<strong style="font-size:18px;color:#fff;">${safeTitle}</strong>
<p style="color:#aaa;margin:8px 0 0;">📅 Deadline: ${escapeHtml(deadline)}</p>
</div>
<p style="color:#bbb;line-height:1.6;">You'll receive a reminder when the deadline arrives${task.requireProof ? ", and this task will require a proof photo before completion" : ""}.</p>
</div>`,
    emailText: `Task created: "${task.title}" — Due ${deadline}. DeadlineShield will remind you when the task is due.`,
    smsBody: `✅ DeadlineShield: Task "${task.title}" created. Due ${deadline}. We'll remind you when the deadline arrives.`,
  };
}

async function sendPersonalTaskNotifications({
  task,
  stage = "created",
  today = null,
  appUrl = process.env.APP_URL || "http://localhost:5000",
}) {
  const notifyType = task.notifyType;
  const emailRequested = notifyType === "email" || notifyType === "both";
  const smsRequested = notifyType === "sms" || notifyType === "both";
  const email = String(task.email || "").trim();
  const phone = normalizePhoneNumber(task.phone);
  const delivery = {
    stage,
    email: createChannelState(emailRequested, email),
    sms: createChannelState(smsRequested, phone),
    deliveredAny: false,
  };

  const content = buildNotificationContent({
    task,
    stage,
    appUrl,
    today: today || task.deadline,
  });

  if (emailRequested) {
    if (!email) {
      delivery.email.error = "Email address missing";
    } else if (!isValidEmail(email)) {
      delivery.email.error = "Email address is invalid";
    } else if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      delivery.email.error = "Email transport is not configured";
    } else {
      try {
        await transporter.sendMail({
          from: `"DeadlineShield" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: content.emailSubject,
          html: content.emailHtml,
          text: content.emailText,
        });
        delivery.email.delivered = true;
      } catch (error) {
        delivery.email.error = error.message || "Email delivery failed";
      }
    }
  }

  if (smsRequested) {
    if (!phone) {
      delivery.sms.error = "Phone number missing";
    } else if (!isValidPhone(phone)) {
      delivery.sms.error = "Phone number must be in international format";
    } else if (!twilioClient || !process.env.TWILIO_SMS_FROM) {
      delivery.sms.error = "SMS transport is not configured";
    } else {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_SMS_FROM,
          to: phone,
          body: content.smsBody,
        });
        delivery.sms.delivered = true;
      } catch (error) {
        delivery.sms.error = error.message || "SMS delivery failed";
      }
    }
  }

  delivery.deliveredAny = delivery.email.delivered || delivery.sms.delivered;
  return delivery;
}

module.exports = {
  normalizePhoneNumber,
  isValidEmail,
  isValidPhone,
  sendPersonalTaskNotifications,
};
