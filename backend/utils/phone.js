const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

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

  // Default local 10-digit mobile numbers to India for this app's primary users.
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

function maskPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return "";
  return normalized.replace(/(\+\d{1,3})\d+(\d{4})$/, "$1******$2");
}

module.exports = {
  normalizePhoneNumber,
  isValidEmail,
  isValidPhone,
  maskPhoneNumber,
};
