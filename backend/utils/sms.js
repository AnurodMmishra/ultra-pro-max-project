const { normalizePhoneNumber, isValidPhone } = require("./phone");

const twilioAccountSid = String(process.env.TWILIO_SID || "").trim();
const twilioAuthToken = String(process.env.TWILIO_AUTH || "").trim();

const twilioClient =
  twilioAccountSid && twilioAuthToken
    ? require("twilio")(twilioAccountSid, twilioAuthToken)
    : null;

function getTwilioSenderConfig() {
  const messagingServiceSid = String(
    process.env.TWILIO_MESSAGING_SERVICE_SID || "",
  ).trim();
  if (messagingServiceSid) {
    return {
      ok: true,
      params: { messagingServiceSid },
      label: `messaging service ${messagingServiceSid}`,
    };
  }

  const from = normalizePhoneNumber(process.env.TWILIO_SMS_FROM);
  if (!from) {
    return {
      ok: false,
      error:
        "TWILIO_SMS_FROM must be an SMS-capable Twilio number in E.164 format, for example +14155552671.",
    };
  }

  return {
    ok: true,
    params: { from },
    label: from,
  };
}

function formatTwilioError(error) {
  const parts = [];
  if (error?.code) parts.push(`Twilio ${error.code}`);
  if (error?.status) parts.push(`HTTP ${error.status}`);
  if (error?.message) parts.push(error.message);
  if (error?.moreInfo) parts.push(error.moreInfo);
  return parts.join(": ") || "SMS delivery failed";
}

function getSmsConfigStatus() {
  const sender = getTwilioSenderConfig();
  return {
    hasCredentials: Boolean(twilioAccountSid && twilioAuthToken),
    hasSender: sender.ok,
    senderLabel: sender.ok ? sender.label : null,
    error: sender.ok ? null : sender.error,
  };
}

async function sendSms({ to, body }) {
  const phone = normalizePhoneNumber(to);
  if (!phone || !isValidPhone(phone)) {
    return {
      delivered: false,
      recipient: phone || null,
      error:
        "Phone number must include a valid country code, or be a valid Indian 10-digit mobile number.",
    };
  }

  if (!twilioClient) {
    return {
      delivered: false,
      recipient: phone,
      error: "SMS transport is not configured (TWILIO_SID/TWILIO_AUTH missing).",
    };
  }

  const sender = getTwilioSenderConfig();
  if (!sender.ok) {
    return {
      delivered: false,
      recipient: phone,
      error: sender.error,
    };
  }

  try {
    const message = await twilioClient.messages.create({
      ...sender.params,
      to: phone,
      body,
    });
    return {
      delivered: true,
      recipient: phone,
      sid: message.sid,
      error: null,
    };
  } catch (error) {
    return {
      delivered: false,
      recipient: phone,
      error: formatTwilioError(error),
    };
  }
}

module.exports = {
  getSmsConfigStatus,
  sendSms,
};
