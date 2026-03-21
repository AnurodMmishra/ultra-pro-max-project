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

/* ── REGISTER ── */
document.getElementById('register-btn').addEventListener('click', () => {
  const inputs = document.querySelectorAll('#register input');
  const [name, email, phone, pass, confirm] = [...inputs].map(i => i.value.trim());
  if (!name || !email || !phone || !pass || !confirm) return showToast('⚠️ Please fill in all fields.');
  if (pass !== confirm) return showToast('⚠️ Passwords do not match.');
  if (pass.length < 6)  return showToast('⚠️ Password must be at least 6 characters.');

  /* ✅ SAVE registration details to localStorage so dashboard can read them */
  localStorage.setItem('ds_profile', JSON.stringify({ name: name, email: email, phone: phone }));

  showToast('✅ Account created! Redirecting…');
  setTimeout(() => window.location.href = 'dashboard.html', 1800);
});

/* ── LOGIN ── */
document.getElementById('login-btn').addEventListener('click', () => {
  const inputs = document.querySelectorAll('#login input');
  const [email, pass] = [...inputs].map(i => i.value.trim());
  if (!email || !pass) return showToast('⚠️ Please enter your credentials.');
  showToast('✅ Logging in…');
  setTimeout(() => window.location.href = 'dashboard.html', 1500);
});