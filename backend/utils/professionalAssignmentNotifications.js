const transporter = require("../config/mailer");
const {
  normalizePhoneNumber,
  isValidEmail,
  isValidPhone,
} = require("./personalTaskNotifications");

const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_AUTH
    ? require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createChannelState(requested, recipient) {
  return {
    requested,
    recipient: recipient || null,
    delivered: false,
    error: null,
  };
}

function buildDashboardUrl(appUrl) {
  return `${String(appUrl || "http://localhost:5000").replace(/\/$/, "")}/dashboard`;
}

function buildProfessionalAssignmentContent({
  assignment,
  recipient,
  creatorName,
  stage,
  today,
  dashboardUrl,
}) {
  const title = assignment.title || "Untitled Assignment";
  const safeTitle = escapeHtml(title);
  const safeRecipientName = escapeHtml(recipient?.name || "there");
  const safeCreatorName = escapeHtml(creatorName || "your instructor");
  const deadline = assignment.deadline || "No deadline";
  const safeDeadline = escapeHtml(deadline);
  const safeDescription = assignment.description
    ? escapeHtml(assignment.description)
    : "";
  const isOverdue = stage === "deadline" && deadline < today;

  if (stage === "deadline") {
    const heading = isOverdue
      ? "This assignment is overdue."
      : "This assignment is due today.";
    const smsStatus = isOverdue ? "OVERDUE" : "due TODAY";

    return {
      emailSubject: isOverdue
        ? `⚠️ Overdue Assignment Reminder: "${title}" — DeadlineShield`
        : `⚠️ Assignment Due Today: "${title}" — DeadlineShield`,
      emailHtml: `<div style="font-family:Arial,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
<h2 style="color:#00ffff;">⏰ DeadlineShield</h2>
<p style="font-size:16px;color:#f5f5f5;margin-bottom:18px;">${heading}</p>
<div style="background:#1a1a1a;border:1px solid #333;border-left:4px solid #ff6b6b;border-radius:8px;padding:16px;margin:16px 0;">
<strong style="font-size:18px;color:#fff;">${safeTitle}</strong>
<p style="color:#aaa;margin:8px 0 0;">📅 Deadline: ${safeDeadline}</p>
</div>
<p>Hello <strong>${safeRecipientName}</strong>, your assignment from <strong>${safeCreatorName}</strong> needs attention.${safeDescription ? `<br><br>Description: ${safeDescription}` : ""}</p>
<p style="color:#bbb;line-height:1.6;">Complete it${assignment.requireProof ? " and upload your proof photo" : ""} to stop reminders.</p>
<p style="margin-top:20px;"><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;background:#00ffff;color:#111;text-decoration:none;border-radius:8px;font-weight:700;">Open Dashboard</a></p>
</div>`,
      emailText: `DeadlineShield reminder: Assignment "${title}" from ${creatorName || "your instructor"} is ${isOverdue ? "overdue" : "due today"} (${deadline}). Open ${dashboardUrl} to complete it.`,
      smsBody: `⚠️ DeadlineShield: Assignment "${title}" is ${smsStatus} (${deadline}). Complete it${assignment.requireProof ? " and upload proof" : ""}.`,
    };
  }

  return {
    emailSubject: `📋 New Assignment: "${title}" — Due ${deadline}`,
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#0f0f0f;color:#e0e0e0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
<h2 style="color:#00ffff;">⏰ DeadlineShield</h2>
<p>Hello <strong>${safeRecipientName}</strong>, you have a new assignment from <strong>${safeCreatorName}</strong>.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-left:4px solid #00ffff;border-radius:8px;padding:16px;margin:16px 0;">
<strong style="font-size:18px;color:#fff;">${safeTitle}</strong>
<p style="color:#aaa;margin:8px 0 0;">📅 Deadline: ${safeDeadline}</p>
</div>
${safeDescription ? `<p>Description: ${safeDescription}</p>` : ""}
<p style="color:#bbb;line-height:1.6;">Open the professional dashboard to complete it${assignment.requireProof ? " with a proof photo" : ""}.</p>
<p style="margin-top:20px;"><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;background:#00ffff;color:#111;text-decoration:none;border-radius:8px;font-weight:700;">Open Dashboard</a></p>
</div>`,
    emailText: `New assignment from ${creatorName || "your instructor"}: "${title}" due ${deadline}. Open ${dashboardUrl} to complete it.`,
    smsBody: `📋 DeadlineShield: New assignment "${title}" from ${creatorName || "your instructor"} due ${deadline}.`,
  };
}

async function sendProfessionalAssignmentNotifications({
  assignment,
  recipient,
  creatorName,
  stage = "created",
  today = null,
  appUrl = process.env.APP_URL || "http://localhost:5000",
}) {
  const notifyType = assignment.notifyType || "email";
  const emailRequested = notifyType === "email" || notifyType === "both";
  const smsRequested = notifyType === "sms" || notifyType === "both";
  const email = String(
    (assignment.customEmail && String(assignment.customEmail).trim()) ||
      recipient?.email ||
      "",
  ).trim();
  const phone = normalizePhoneNumber(
    (assignment.customPhone && String(assignment.customPhone).trim()) ||
      recipient?.phone ||
      "",
  );
  const delivery = {
    stage,
    email: createChannelState(emailRequested, email),
    sms: createChannelState(smsRequested, phone),
    deliveredAny: false,
  };

  const dashboardUrl = buildDashboardUrl(appUrl);
  const content = buildProfessionalAssignmentContent({
    assignment,
    recipient,
    creatorName,
    stage,
    today: today || assignment.deadline,
    dashboardUrl,
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
      delivery.sms.error = "Phone number must be valid";
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
  sendProfessionalAssignmentNotifications,
};
