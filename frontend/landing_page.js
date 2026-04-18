function updateClock() {
  const now = new Date();
  const s = now.getSeconds(),
    m = now.getMinutes(),
    h = now.getHours() % 12;
  document.getElementById("second").style.transform =
    `translateX(-50%) rotate(${s * 6}deg)`;
  document.getElementById("minute").style.transform =
    `translateX(-50%) rotate(${m * 6 + s * 0.1}deg)`;
  document.getElementById("hour").style.transform =
    `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)`;
}
updateClock();
setInterval(updateClock, 1000);

function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.target === name);
  });
  document.querySelectorAll(".form-panel").forEach((p) => {
    p.classList.toggle("active", p.id === name);
  });
}
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.target));
});
document.querySelectorAll("[data-switch]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(link.dataset.switch);
  });
});

function showToast(msg, duration = 3000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

function showApiError(data) {
  const shortMessage = data.message || "Server error";
  const simplifiedMessage =
    shortMessage.length > 60 ? "Server error" : shortMessage;
  showToast("❌ " + simplifiedMessage);
  console.warn("API response:", data);
}

const API_BASE_URL = "http://localhost:5000/api";

function guessInitialCountry() {
  return "in";
}

let registerPhoneIti = null;
let pendingVerifyEmail = "";
let pendingVerifyPhone = "";
let emailVerified = false;
let phoneVerified = false;

function initRegisterPhone() {
  const input = document.getElementById("register-phone");
  if (!input || typeof window.intlTelInput !== "function") return;

  if (registerPhoneIti) {
    registerPhoneIti.destroy();
    registerPhoneIti = null;
  }

  input.value = "";

  registerPhoneIti = window.intlTelInput(input, {
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.5.3/build/js/utils.js",
    initialCountry: guessInitialCountry(),
    preferredCountries: [
      "in",
      "us",
      "gb",
      "au",
      "ca",
      "de",
      "fr",
      "br",
      "mx",
      "jp",
      "nz",
      "sg",
      "ae",
      "za",
      "ng",
      "ke",
      "eg",
      "es",
      "it",
      "nl",
      "se",
      "no",
      "ie",
      "pk",
      "bd",
    ],
    separateDialCode: true,
    nationalMode: true,
    formatOnDisplay: true,
    dropdownContainer: document.body,
  });
}
function getRegisterPhoneE164() {
  if (!registerPhoneIti) return "";
  let e164 = "";
  try {
    e164 = registerPhoneIti.getNumber ? registerPhoneIti.getNumber() : "";
  } catch (_) {}
  if (e164 && /^\+[\d]+$/.test(e164.replace(/\s/g, ""))) {
    return e164.replace(/\s/g, "");
  }

  const input = document.getElementById("register-phone");
  const national = input ? input.value.replace(/\D/g, "") : "";
  if (!national) return "";
  const d = registerPhoneIti.getSelectedCountryData();
  if (!d || d.dialCode === undefined) return "";
  return `+${d.dialCode}${national}`;
}

initRegisterPhone();

function validatePassword(password) {
  const requirements = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  return requirements;
}

function updatePasswordRequirements(password) {
  const reqs = validatePassword(password);

  Object.keys(reqs).forEach((req) => {
    const element = document.getElementById(`req-${req}`);
    if (element) {
      if (reqs[req]) {
        element.classList.add("valid");
        element.classList.remove("invalid");
      } else {
        element.classList.add("invalid");
        element.classList.remove("valid");
      }
    }
  });

  return Object.values(reqs).every(Boolean);
}

function checkPasswordMatch() {
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "register-password-confirm",
  ).value;
  const matchError = document.getElementById("password-match-error");

  if (confirmPassword && password !== confirmPassword) {
    matchError.style.display = "block";
    return false;
  } else {
    matchError.style.display = "none";
    return true;
  }
}

document.getElementById("password-info-btn")?.addEventListener("click", () => {
  const requirements = document.getElementById("password-requirements");
  const errorMsg = document.getElementById("password-error-message");
  requirements.style.display =
    requirements.style.display === "none" ? "block" : "none";
  if (requirements.style.display === "block") {
    errorMsg.style.display = "none";
  }
});

document
  .getElementById("password-toggle-btn")
  ?.addEventListener("click", () => {
    const passwordInput = document.getElementById("register-password");
    const toggleBtn = document.getElementById("password-toggle-btn");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(0,255,255,0.9); filter: drop-shadow(0 0 3px rgba(0,255,255,0.4));">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeGlow 0.3s ease-in-out";
    } else {
      passwordInput.type = "password";
      toggleBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(255,255,255,0.4);">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 10.07 10.07 0 0 1-5.94 5.94M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
        <line x1="1" y1="12" x2="23" y2="12" style="stroke: rgba(255,255,255,0.6); stroke-width: 2.5;"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeDim 0.3s ease-in-out";
    }

    setTimeout(() => {
      toggleBtn.style.animation = "";
    }, 300);
  });

document
  .getElementById("password-toggle-btn-confirm")
  ?.addEventListener("click", () => {
    const confirmPasswordInput = document.getElementById(
      "register-password-confirm",
    );
    const toggleBtn = document.getElementById("password-toggle-btn-confirm");

    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(0,255,255,0.9); filter: drop-shadow(0 0 3px rgba(0,255,255,0.4));">
        <circle cx="12" cy="12" r="3"/>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeGlow 0.3s ease-in-out";
    } else {
      confirmPasswordInput.type = "password";
      toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(255,255,255,0.4);">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 10.07 10.07 0 0 1-5.94 5.94M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
        <line x1="1" y1="12" x2="23" y2="12" style="stroke: rgba(255,255,255,0.6); stroke-width: 2.5;"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeDim 0.3s ease-in-out";
    }

    setTimeout(() => {
      toggleBtn.style.animation = "";
    }, 300);
  });

document
  .getElementById("login-password-toggle-btn")
  ?.addEventListener("click", () => {
    const passwordInput = document.getElementById("login-password");
    const toggleBtn = document.getElementById("login-password-toggle-btn");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(0,255,255,0.9); filter: drop-shadow(0 0 3px rgba(0,255,255,0.4));">
        <circle cx="12" cy="12" r="3"/>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeGlow 0.3s ease-in-out";
    } else {
      passwordInput.type = "password";
      toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(255,255,255,0.4);">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 10.07 10.07 0 0 1-5.94 5.94M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/>
        <line x1="1" y1="12" x2="23" y2="12" style="stroke: rgba(255,255,255,0.6); stroke-width: 2.5;"/>
      </svg>
    `;
      toggleBtn.style.animation = "eyeDim 0.3s ease-in-out";
    }

    setTimeout(() => {
      toggleBtn.style.animation = "";
    }, 300);
  });

document.getElementById("register-password")?.addEventListener("input", (e) => {
  const password = e.target.value;
  const isValid = updatePasswordRequirements(password);
  const errorMsg = document.getElementById("password-error-message");

  if (password && !isValid) {
    errorMsg.style.display = "block";
  } else {
    errorMsg.style.display = "none";
  }

  checkPasswordMatch();
});

document
  .getElementById("register-password-confirm")
  ?.addEventListener("input", checkPasswordMatch);

// Auto-scroll when dropdown is focused
document.getElementById("register-role")?.addEventListener("focus", () => {
  // Scroll the dropdown into view smoothly
  document.getElementById("register-role").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("register-btn")?.addEventListener("click", async () => {
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const phone = getRegisterPhoneE164();
  const password = document.getElementById("register-password").value.trim();
  const confirmPassword = document
    .getElementById("register-password-confirm")
    .value.trim();
  const role = document.getElementById("register-role")?.value;

  if (!name || !email || !phone || !password || !confirmPassword || !role) {
    return showToast("⚠️ Please fill all fields and select your designation.");
  }

  const pwdReqs = validatePassword(password);
  if (!Object.values(pwdReqs).every(Boolean)) {
    return showToast("⚠️ Password does not meet all requirements.");
  }

  if (password !== confirmPassword) {
    return showToast("⚠️ Passwords do not match.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role }),
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.error("Response status:", response.status);
      console.error("Response text:", responseText);
      return showToast("❌ Server error - " + responseText.substring(0, 50));
    }

    if (!response.ok) {
      showApiError(data);
      return;
    }

    showToast(
      "✅ Registration successful! Please verify your email and phone.",
    );
    pendingVerifyEmail = email;
    showOtpPanel({ email });
  } catch (error) {
    console.error("Registration error:", error);
    showToast("❌ Registration failed. Please try again.");
  }
});

function setOtpStatus(text) {
  const status = document.getElementById("otp-status");
  if (status) status.textContent = text;
}

function showOtpPanel({ email }) {
  const panel = document.getElementById("otp-panel");
  if (panel) {
    panel.style.display = "block";
    const status = document.getElementById("otp-status");
    if (status) {
      status.textContent = `Enter both OTP codes to verify, then log in.`;
    }
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  let data = {};
  try {
    data = JSON.parse(txt);
  } catch {
    data = { message: txt };
  }
  return { res, data };
}

document
  .getElementById("verify-email-otp-btn")
  ?.addEventListener("click", async () => {
    const code = document.getElementById("otp-email")?.value.trim();
    if (!pendingVerifyEmail || !code)
      return showToast("⚠️ Enter the email OTP.");
    try {
      const { res, data } = await postJson(
        `${API_BASE_URL}/auth/verify-email-otp`,
        { email: pendingVerifyEmail, code },
      );
      if (!res.ok) return showApiError(data);
      emailVerified = true;
      setOtpStatus(
        `Email verified. ${phoneVerified ? "All set — you can log in." : "Now verify phone OTP."}`,
      );
      showToast("✅ Email verified");

      if (emailVerified && phoneVerified) {
        setTimeout(() => {
          switchTab("login");
          showToast(
            "✅ Verification complete! Please log in with your credentials.",
          );
        }, 1000);
      }
    } catch (e) {
      showToast("❌ " + e.message);
    }
  });

document
  .getElementById("verify-phone-otp-btn")
  ?.addEventListener("click", async () => {
    const code = document.getElementById("otp-phone")?.value.trim();
    if (!pendingVerifyEmail || !code)
      return showToast("⚠️ Enter the phone OTP.");
    try {
      const { res, data } = await postJson(
        `${API_BASE_URL}/auth/verify-phone-otp`,
        { email: pendingVerifyEmail, code },
      );
      if (!res.ok) return showApiError(data);
      phoneVerified = true;
      setOtpStatus(
        `${emailVerified ? "All set — you can log in." : "Phone verified. Now verify email OTP."}`,
      );
      showToast("✅ Phone verified");

      if (emailVerified && phoneVerified) {
        setTimeout(() => {
          switchTab("login");
          showToast(
            "✅ Verification complete! Please log in with your credentials.",
          );
        }, 1000);
      }
    } catch (e) {
      showToast("❌ " + e.message);
    }
  });

document
  .getElementById("resend-email-otp-btn")
  ?.addEventListener("click", async () => {
    if (!pendingVerifyEmail) return showToast("⚠️ Register first.");
    try {
      const { res, data } = await postJson(`${API_BASE_URL}/auth/resend-otp`, {
        email: pendingVerifyEmail,
        type: "email",
      });
      if (!res.ok) return showApiError(data);
      showToast("✅ Email OTP sent");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  });

document
  .getElementById("resend-phone-otp-btn")
  ?.addEventListener("click", async () => {
    if (!pendingVerifyEmail) return showToast("⚠️ Register first.");
    try {
      const { res, data } = await postJson(`${API_BASE_URL}/auth/resend-otp`, {
        email: pendingVerifyEmail,
        type: "phone",
      });
      if (!res.ok) return showApiError(data);
      showToast("✅ Phone OTP sent");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  });

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value.trim();
  if (!email || !pass) return showToast("⚠️ Please enter your credentials.");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.error("Response status:", response.status);
      console.error("Response text:", responseText);
      return showToast("❌ Server error - " + responseText.substring(0, 50));
    }

    if (!response.ok) {
      if (
        response.status === 403 &&
        (data.needsEmailVerification || data.needsPhoneVerification)
      ) {
        pendingVerifyEmail = email;
        switchTab("register");
        showOtpPanel({ email });
        setOtpStatus("Verify OTP(s) for this account, then try login again.");
      }
      return showApiError(data);
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user && data.user.role) {
      localStorage.setItem("userRole", data.user.role);
    }

    showToast("✅ Logging in…");
    setTimeout(() => (window.location.href = "dashboard.html"), 1500);
  } catch (error) {
    console.error("Login error:", error);
    showToast("❌ " + error.message);
  }
});
