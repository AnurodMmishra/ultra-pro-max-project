const { normalizePhoneNumber } = require("./personalTaskNotifications");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIdentityText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim());
}

function getProfessionalUserIdentityKey(user) {
  const phone = normalizePhoneNumber(user?.phone);
  if (phone) {
    return `phone:${phone}`;
  }

  const email = normalizeIdentityText(user?.email);
  if (email) {
    return `email:${email}`;
  }

  const name = normalizeIdentityText(user?.name);
  if (name) {
    return `name:${name}`;
  }

  return `id:${String(user?._id || "")}`;
}

function getProfessionalUserPriority(user) {
  const updatedAt = new Date(user?.updatedAt || 0).getTime() || 0;
  const createdAt = new Date(user?.createdAt || 0).getTime() || 0;

  let score = 0;
  if (normalizePhoneNumber(user?.phone)) score += 4;
  if (isValidEmail(user?.email)) score += 3;
  if (user?.isPhoneVerified) score += 2;
  if (user?.isEmailVerified) score += 1;

  return { score, updatedAt, createdAt };
}

function pickPrimaryProfessionalUser(users) {
  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }

  return [...users].sort((left, right) => {
    const a = getProfessionalUserPriority(left);
    const b = getProfessionalUserPriority(right);

    if (b.score !== a.score) return b.score - a.score;
    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
    if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
    return String(left?._id || "").localeCompare(String(right?._id || ""));
  })[0];
}

function dedupeProfessionalUsers(users) {
  const grouped = new Map();

  for (const user of users || []) {
    const key = getProfessionalUserIdentityKey(user);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(user);
  }

  return Array.from(grouped.values())
    .map((group) => pickPrimaryProfessionalUser(group))
    .filter(Boolean);
}

function getProfessionalIdentityAliasUsers(users, user) {
  const identityKey = getProfessionalUserIdentityKey(user);
  const aliases = (users || []).filter(
    (candidate) => getProfessionalUserIdentityKey(candidate) === identityKey,
  );

  return aliases.length > 0 ? aliases : [user];
}

module.exports = {
  dedupeProfessionalUsers,
  getProfessionalIdentityAliasUsers,
  getProfessionalUserIdentityKey,
};
