/* ══════════════════════════════════════════════
   YOUR ORIGINAL JS — untouched
══════════════════════════════════════════════ */

const ctx = document.getElementById('completionChart').getContext('2d');
let completedTasks = 0;
let totalTasks = 0;

const completionChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Completed', 'Pending'],
    datasets: [{ data: [0, 1], backgroundColor: ['#3ea6fb', '#d84e7c'], borderWidth: 1 }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 14 } } } }
  }
});

function updatePieChart() {
  const pending = totalTasks - completedTasks;
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  completionChart.data.datasets[0].data = [completedTasks, pending];
  completionChart.update();
  document.getElementById('completionText').textContent = `${percentage}% of tasks completed`;
  updateNavStats();
}

const tasksContainer = document.querySelector('.tasks-container');
const addTaskBtn = document.querySelector('.add-task-btn');
addTaskBtn.addEventListener('click', openAddTaskForm);

function openAddTaskForm() {
  const formCard = document.createElement('div');
  formCard.className = 'task-form';
  formCard.innerHTML = `
    <label>Task:
      <input type="text" id="taskName" placeholder="Enter task name">
    </label>
    <label>Deadline:
      <input type="text" id="taskDeadline" placeholder="YYYY-MM-DD HH:MM">
    </label>
    <label>Get reminders through:
      <div class="options">
        <span class="option-circle" data-id="whatsapp"></span>WhatsApp
        <span class="option-circle" data-id="email"></span>Email
      </div>
    </label>
    <label>Upload photo as proof?
      <div class="options">
        <span class="option-circle" data-id="upload"></span>Yes
      </div>
    </label>
    <button class="save-btn">Save</button>
  `;
  tasksContainer.appendChild(formCard);

  formCard.querySelectorAll('.option-circle').forEach(c => {
    c.addEventListener('click', () => c.classList.toggle('selected'));
  });

  formCard.querySelector('.save-btn').addEventListener('click', () => {
    const name       = formCard.querySelector('#taskName').value;
    const deadline   = formCard.querySelector('#taskDeadline').value;
    const uploadProof = formCard.querySelector('[data-id="upload"]').classList.contains('selected');
    if (!name || !deadline) { alert('Enter task name and deadline'); return; }
    addTaskCard(name, deadline, uploadProof);
    formCard.remove();
  });
}

function updateTaskStatus(card, name, deadline) {
  const today    = new Date().toISOString().split("T")[0];
  const taskDate = card.dataset.deadline;
  const taskInfo = card.querySelector('.task-info');

  if (card.dataset.completed === "true") {
    taskInfo.innerHTML = `<h3>${name}</h3><p style="color:lime;font-weight:bold;text-align:center;">DONE</p>`;
  } else if (taskDate < today) {
    taskInfo.innerHTML = `<h3>${name}</h3><p style="color:red;font-weight:bold;text-align:center;">PENDING</p>`;
  } else {
    taskInfo.innerHTML = `<h3>${name}</h3><p>${deadline}</p>`;
  }
}

function addTaskCard(name, deadline, uploadProof) {
  totalTasks++;
  updatePieChart();

  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.deadline  = deadline.substring(0, 10);
  card.dataset.proof     = uploadProof;
  card.dataset.completed = "false";
  card.dataset.name      = name;

  card.innerHTML = `
    <div class="left-circle"></div>
    <div class="task-info"><h3>${name}</h3><p>${deadline}</p></div>
    <button class="deleteBtn">Delete</button>
  `;
  tasksContainer.appendChild(card);

  const leftCircle = card.querySelector('.left-circle');
  const deleteBtn  = card.querySelector('.deleteBtn');
  const taskInfo   = card.querySelector('.task-info');

  leftCircle.addEventListener('click', () => {
    if (card.dataset.completed === "false") {

      if (card.dataset.proof === "true") {
        taskInfo.innerHTML = `
          <h3>${name}</h3>
          <p style="color:red;font-weight:bold;text-align:center;">PENDING</p>
          <p>Upload photo as proof:</p>
          <label class="custom-file-label">Choose File</label>
          <input type="file" class="custom-file-input" accept="image/*">
        `;
        const fileInput = taskInfo.querySelector('.custom-file-input');
        const fileLabel = taskInfo.querySelector('.custom-file-label');
        fileLabel.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
          if (fileInput.files.length > 0) {
            card.dataset.completed = "true";
            leftCircle.classList.add('completed');
            completedTasks++;
            updatePieChart();
            updateTaskStatus(card, name, deadline);
            markStreakToday(); // NEW
            checkDeadlines();
          }
        });
      } else {
        card.dataset.completed = "true";
        leftCircle.classList.add('completed');
        completedTasks++;
        updatePieChart();
        updateTaskStatus(card, name, deadline);
        markStreakToday(); // NEW
        checkDeadlines();
      }

    } else {
      card.dataset.completed = "false";
      leftCircle.classList.remove('completed');
      completedTasks--;
      updatePieChart();
      updateTaskStatus(card, name, deadline);
    }
    applyScrollShrink();
  });

  deleteBtn.addEventListener('click', () => {
    if (card.dataset.completed === "true") completedTasks--;
    totalTasks--;
    updatePieChart();
    card.remove();
    applyScrollShrink();
    checkDeadlines();
  });

  refreshUI();
}

function checkDeadlines() {
  const today = new Date().toISOString().split("T")[0];
  const cards = Array.from(document.querySelectorAll('.task-card'));
  const dacList = document.getElementById('dacList');
  const alertCard = document.getElementById('deadlineAlertCard');

  dacList.innerHTML = '';
  let urgentCount = 0;

  cards.forEach(card => {
    const name     = card.querySelector('h3')?.innerText || "";
    const deadline = card.dataset.deadline;

    if (deadline === today) {
      card.classList.add('deadline-today');
      tasksContainer.prepend(card);
    } else {
      card.classList.remove('deadline-today');
    }

    // Build alert card list
    if ((deadline <= today) && card.dataset.completed !== "true") {
      urgentCount++;
      const label = deadline === today ? '🔴 Due TODAY' : '⚠️ Overdue';
      dacList.innerHTML += `
        <div class="dac-item">
          <strong>${name}</strong> — ${label} (${deadline})
        </div>`;
    }

    updateTaskStatus(card, name, deadline);
  });

  alertCard.style.display = urgentCount > 0 ? 'block' : 'none';
}

function applyScrollShrink() {
  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    const rect   = card.getBoundingClientRect();
    const sh     = window.innerHeight;
    let scale    = 1 - (rect.top / sh) * 0.15;
    if (scale > 1)    scale = 1;
    if (scale < 0.85) scale = 0.85;
    card.style.transform = `scale(${scale})`;
  });
}

function refreshUI() {
  checkDeadlines();
  applyScrollShrink();
}

document.querySelector('.right-column').addEventListener('scroll', applyScrollShrink);
window.addEventListener('load', refreshUI);


/* ══════════════════════════════════════════════
   NEW CODE — NAVBAR / THEME / PROFILE / STREAK
══════════════════════════════════════════════ */

// ── USER PROFILE ──
// Reads the profile saved by the landing page on register.
// Falls back gracefully if somehow missing.
let userProfile = JSON.parse(localStorage.getItem('ds_profile') || 'null') || {
  name: '', email: '', phone: ''
};

function renderProfile() {
  const name  = userProfile.name  || 'No Name';
  const email = userProfile.email || 'No Email';
  const phone = userProfile.phone || 'No Phone';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  document.getElementById('avatarInitials').textContent = initials;
  document.getElementById('pdAvatar').textContent       = initials;
  document.getElementById('pdName').textContent         = name;
  document.getElementById('pdEmail').textContent        = email;
  document.getElementById('pdPhone').textContent        = phone;
}
renderProfile();

// ── PROFILE DROPDOWN ──
const profileBtn      = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
profileBtn.addEventListener('click', e => {
  e.stopPropagation();
  profileDropdown.classList.toggle('open');
});
document.addEventListener('click', () => profileDropdown.classList.remove('open'));
profileDropdown.addEventListener('click', e => e.stopPropagation());

// ── THEME TOGGLE ──
let isLight = localStorage.getItem('ds_theme') === 'light';
applyTheme();
document.getElementById('themeBtn').addEventListener('click', () => {
  isLight = !isLight;
  localStorage.setItem('ds_theme', isLight ? 'light' : 'dark');
  applyTheme();
});

function applyTheme() {
  document.body.classList.toggle('light', isLight);
  document.getElementById('themeIcon').textContent = isLight ? '🌙' : '☀️';
  document.getElementById('themeText').textContent = isLight ? 'Dark Mode' : 'Light Mode';
  completionChart.options.plugins.legend.labels.color = isLight ? '#111' : '#fff';
  completionChart.update();
}

// ── NAV STATS ──
function updateNavStats() {
  document.getElementById('nav-total').textContent   = totalTasks;
  document.getElementById('nav-done').textContent    = completedTasks;
  document.getElementById('nav-pending').textContent = totalTasks - completedTasks;
}

// ── STREAK ──
// Logic: if you complete at least 1 task today → streak increases by 1.
//        if you had zero completions on a day → streak resets to 0.
//        Tracked by storing the last-completion date and streak count in localStorage.

function markStreakToday() {
  const today   = new Date().toDateString();
  const lastDay = localStorage.getItem('ds_streak_lastday');
  let   count   = parseInt(localStorage.getItem('ds_streak_count') || '0');

  if (lastDay === today) {
    // Already completed a task today — streak already counted, no change needed
  } else {
    // New day with a completion → increase streak
    count++;
    localStorage.setItem('ds_streak_lastday', today);
    localStorage.setItem('ds_streak_count',   count);
  }

  document.getElementById('streakCount').textContent = count;
}

// Check at page load: if last completion was NOT today AND NOT yesterday → reset streak to 0
(function checkStreakOnLoad() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastDay   = localStorage.getItem('ds_streak_lastday');
  let   count     = parseInt(localStorage.getItem('ds_streak_count') || '0');

  if (lastDay && lastDay !== today && lastDay !== yesterday) {
    // Missed at least one day — reset streak
    count = 0;
    localStorage.setItem('ds_streak_count', 0);
  }

  document.getElementById('streakCount').textContent = count;
})();

// ── HELP MODAL ──
document.getElementById('helpBtn').addEventListener('click', () => {
  document.getElementById('helpOverlay').classList.add('open');
});
function closeHelp() {
  document.getElementById('helpOverlay').classList.remove('open');
}
document.getElementById('helpOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeHelp();
});

// ── EDIT PROFILE MODAL ──
function openEditProfile() {
  profileDropdown.classList.remove('open');
  document.getElementById('editName').value  = userProfile.name;
  document.getElementById('editEmail').value = userProfile.email;
  document.getElementById('editPhone').value = userProfile.phone;
  document.getElementById('editOverlay').classList.add('open');
}
function closeEditProfile() {
  document.getElementById('editOverlay').classList.remove('open');
}
function saveProfile() {
  const name  = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  if (!name || !email) { showToast('⚠️ Name and email are required.'); return; }
  userProfile = { name, email, phone };
  localStorage.setItem('ds_profile', JSON.stringify(userProfile));
  renderProfile();
  closeEditProfile();
  showToast('✅ Profile updated!');
}
document.getElementById('editOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeEditProfile();
});

// ── EXPORT TASKS ──
function exportTasks() {
  profileDropdown.classList.remove('open');
  const cards = document.querySelectorAll('.task-card');
  if (!cards.length) { showToast('No tasks to export.'); return; }
  let csv = 'Task,Deadline,Status\n';
  cards.forEach(card => {
    const name     = card.querySelector('h3')?.innerText || '';
    const deadline = card.dataset.deadline;
    const status   = card.dataset.completed === 'true' ? 'Completed' : 'Pending';
    csv += `"${name}","${deadline}","${status}"\n`;
  });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: 'deadlineshield_tasks.csv'
  });
  a.click();
  showToast('📥 Tasks exported!');
}

// ── LOG OUT ──
function logOut() {
  showToast('👋 Logging out…');
  setTimeout(() => window.location.href = 'index.html', 1400);
}

// ── TOAST ──
function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}