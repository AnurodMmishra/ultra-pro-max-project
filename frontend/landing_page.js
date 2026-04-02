/* ── CLOCK ── */
function updateClock() {
  const now = new Date();
  const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
  document.getElementById('second').style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
  document.getElementById('minute').style.transform = `translateX(-50%) rotate(${m * 6 + s * 0.1}deg)`;
  document.getElementById('hour').style.transform   = `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── TABS ── */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.target === name);
  });
  document.querySelectorAll('.form-panel').forEach(p => {
    p.classList.toggle('active', p.id === name);
  });
}
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.target));
});
document.querySelectorAll('[data-switch]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchTab(link.dataset.switch);
  });
});

/* ── TOAST ── */
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/** Show API JSON errors (503 database, 400 validation, etc.) */
function showApiError(data) {
  const parts = [data.message, data.error, data.hint].filter(Boolean);
  const line = parts.join(' — ');
  const short = line.length > 200 ? line.slice(0, 197) + '…' : line;
  showToast('❌ ' + (short || 'Something went wrong'));
  console.warn('API response:', data);
}

const API_BASE_URL = 'http://localhost:5000/api';

/* ── WhatsApp / phone: flags + dial codes (all countries via intl-tel-input) ── */
function guessInitialCountry() {
  try {
    const r = new Intl.Locale(navigator.language).region;
    return r && /^[a-z]{2}$/i.test(r) ? r.toLowerCase() : 'us';
  } catch {
    return 'us';
  }
}

let registerPhoneIti = null;
let pendingVerifyEmail = '';
let pendingVerifyPhone = '';
let emailVerified = false;
let phoneVerified = false;

function initRegisterPhone() {
  const input = document.getElementById('register-phone');
  if (!input || typeof window.intlTelInput !== 'function') return;

  registerPhoneIti = window.intlTelInput(input, {
    utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.5.3/build/js/utils.js',
    initialCountry: guessInitialCountry(),
    preferredCountries: [
      'us', 'gb', 'in', 'au', 'ca', 'de', 'fr', 'br', 'mx', 'jp',
      'nz', 'sg', 'ae', 'za', 'ng', 'ke', 'eg', 'es', 'it', 'nl', 'se', 'no', 'ie', 'pk', 'bd'
    ],
    separateDialCode: true,
    nationalMode: true,
    formatOnDisplay: true,
    dropdownContainer: document.body
  });
}

function getRegisterPhoneE164() {
  if (!registerPhoneIti) return '';
  let e164 = '';
  try {
    e164 = registerPhoneIti.getNumber ? registerPhoneIti.getNumber() : '';
  } catch (_) { /* utils may still be loading */ }
  if (e164 && /^\+[\d]+$/.test(e164.replace(/\s/g, ''))) {
    return e164.replace(/\s/g, '');
  }

  const input = document.getElementById('register-phone');
  const national = input ? input.value.replace(/\D/g, '') : '';
  if (!national) return '';
  const d = registerPhoneIti.getSelectedCountryData();
  if (!d || d.dialCode === undefined) return '';
  return `+${d.dialCode}${national}`;
}

initRegisterPhone();

function showOtpPanel({ email, phone }) {
  pendingVerifyEmail = email || pendingVerifyEmail;
  pendingVerifyPhone = phone || pendingVerifyPhone;
  emailVerified = false;
  phoneVerified = false;

  const panel = document.getElementById('otp-panel');
  if (panel) panel.style.display = 'block';
  const status = document.getElementById('otp-status');
  if (status) status.textContent = 'Enter both OTP codes to verify, then log in.';
}

function setOtpStatus(text) {
  const status = document.getElementById('otp-status');
  if (status) status.textContent = text;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  let data = {};
  try { data = JSON.parse(txt); } catch { data = { message: txt }; }
  return { res, data };
}

// OTP button handlers
document.getElementById('verify-email-otp-btn')?.addEventListener('click', async () => {
  const code = document.getElementById('otp-email')?.value.trim();
  if (!pendingVerifyEmail || !code) return showToast('⚠️ Enter the email OTP.');
  try {
    const { res, data } = await postJson(`${API_BASE_URL}/auth/verify-email-otp`, { email: pendingVerifyEmail, code });
    if (!res.ok) return showApiError(data);
    emailVerified = true;
    setOtpStatus(`Email verified. ${phoneVerified ? 'All set — you can log in.' : 'Now verify phone OTP.'}`);
    showToast('✅ Email verified');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
});

document.getElementById('verify-phone-otp-btn')?.addEventListener('click', async () => {
  const code = document.getElementById('otp-phone')?.value.trim();
  if (!pendingVerifyEmail || !code) return showToast('⚠️ Enter the phone OTP.');
  try {
    const { res, data } = await postJson(`${API_BASE_URL}/auth/verify-phone-otp`, { email: pendingVerifyEmail, code });
    if (!res.ok) return showApiError(data);
    phoneVerified = true;
    setOtpStatus(`${emailVerified ? 'All set — you can log in.' : 'Phone verified. Now verify email OTP.'}`);
    showToast('✅ Phone verified');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
});

document.getElementById('resend-email-otp-btn')?.addEventListener('click', async () => {
  if (!pendingVerifyEmail) return showToast('⚠️ Register first.');
  try {
    const { res, data } = await postJson(`${API_BASE_URL}/auth/resend-otp`, { email: pendingVerifyEmail, type: 'email' });
    if (!res.ok) return showApiError(data);
    showToast('✅ Email OTP sent');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
});

document.getElementById('resend-phone-otp-btn')?.addEventListener('click', async () => {
  if (!pendingVerifyEmail) return showToast('⚠️ Register first.');
  try {
    const { res, data } = await postJson(`${API_BASE_URL}/auth/resend-otp`, { email: pendingVerifyEmail, type: 'phone' });
    if (!res.ok) return showApiError(data);
    showToast('✅ Phone OTP sent');
  } catch (e) {
    showToast('❌ ' + e.message);
  }
});

/* ── REGISTER ── */
document.getElementById('register-btn').addEventListener('click', async () => {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const pass = document.getElementById('register-password').value.trim();
  const confirm = document.getElementById('register-password-confirm').value.trim();
  const phone = getRegisterPhoneE164();

  if (!name || !email || !phone || !pass || !confirm) return showToast('⚠️ Please fill in all fields.');
  if (pass !== confirm) return showToast('⚠️ Passwords do not match.');
  if (pass.length < 6)  return showToast('⚠️ Password must be at least 6 characters.');
  if (phone.replace(/\D/g, '').length < 8) return showToast('⚠️ Please enter a complete WhatsApp number.');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, phone })
    });

    // Read response once as text, then parse
    const responseText = await response.text();
    let data = {};
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Response status:', response.status);
      console.error('Response text:', responseText);
      return showToast('❌ Server error - ' + responseText.substring(0, 50));
    }

    if (!response.ok) {
      return showApiError(data);
    }

    // New flow: OTP verification required
    if (data.requiresVerification) {
      showToast('✅ OTP sent. Please verify.');
      showOtpPanel({ email: data.user?.email || email, phone: data.user?.phone || phone });
      return;
    }

    // Backward compatible (if server returns token)
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('✅ Account created! Redirecting…');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
      return;
    }

    showToast('✅ Registered. Please verify OTP then log in.');
  } catch (error) {
    console.error('Registration error:', error);
    showToast('❌ ' + error.message);
  }
});

/* ── LOGIN ── */
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  if (!email || !pass) return showToast('⚠️ Please enter your credentials.');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    // Read response once as text, then parse
    const responseText = await response.text();
    let data = {};
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Response status:', response.status);
      console.error('Response text:', responseText);
      return showToast('❌ Server error - ' + responseText.substring(0, 50));
    }

    if (!response.ok) {
      // If verification required, show OTP panel on register tab
      if (response.status === 403 && (data.needsEmailVerification || data.needsPhoneVerification)) {
        pendingVerifyEmail = email;
        switchTab('register');
        showOtpPanel({ email });
        setOtpStatus('Verify OTP(s) for this account, then try login again.');
      }
      return showApiError(data);
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast('✅ Logging in…');
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
  } catch (error) {
    console.error('Login error:', error);
    showToast('❌ ' + error.message);
  }
});