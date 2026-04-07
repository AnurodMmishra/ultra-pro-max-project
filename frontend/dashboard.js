




if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

const API_BASE_URL = 'http://localhost:5000/api';


async function apiCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}


const TaskAPI = {
  getAll: () => apiCall('/tasks'),
  create: (taskData) => apiCall('/tasks/add', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),
  update: (id, taskData) => apiCall(`/tasks/edit/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  }),
  delete: (id) => apiCall(`/tasks/delete/${id}`, { method: 'DELETE' }),
  markComplete: (id) => apiCall(`/tasks/complete/${id}`, { method: 'PATCH' }),
  uploadProof: (id, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    return fetch(`${API_BASE_URL}/tasks/upload-proof/${id}`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  }
};





const ctx = document.getElementById('completionChart').getContext('2d');
let completedTasks = 0;
let totalTasks = 0;
let tasksMap = new Map(); // Store task data by ID

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
    <label>Description:
      <textarea id="taskDesc" placeholder="Enter task description (optional)"></textarea>
    </label>
    <label>Deadline:
      <input type="date" id="taskDeadline" placeholder="YYYY-MM-DD">
    </label>
    <label>Get reminders through:
      <div class="options">
        <span class="option-circle" data-id="whatsapp">📱</span>WhatsApp
        <span class="option-circle" data-id="email">📧</span>Email
      </div>
    </label>
    <label id="emailLabel" style="display:none;">Email:
      <input type="email" id="taskEmail" placeholder="your@email.com">
    </label>
    <label id="phoneLabel" style="display:none;">Phone:
      <input type="tel" id="taskPhone" placeholder="+1234567890">
    </label>
    <label>Upload photo as proof?
      <div class="options">
        <span class="option-circle" data-id="upload">📸</span>Yes
      </div>
    </label>
    <button class="save-btn">Save</button>
    <button class="cancel-btn" style="background:#666; margin-left:10px;">Cancel</button>
  `;
  tasksContainer.appendChild(formCard);

  let selectedNotifyType = null;

  formCard.querySelectorAll('.option-circle').forEach(c => {
    c.addEventListener('click', () => {
      if (c.dataset.id === 'upload') {
        c.classList.toggle('selected');
      } else {
        formCard.querySelectorAll(`[data-id="${c.dataset.id}"]`).forEach(el => el.classList.remove('selected'));
        c.classList.add('selected');
        selectedNotifyType = c.dataset.id;


        document.getElementById('emailLabel').style.display = selectedNotifyType === 'email' ? 'block' : 'none';
        document.getElementById('phoneLabel').style.display = selectedNotifyType === 'whatsapp' ? 'block' : 'none';
      }
    });
  });

  formCard.querySelector('.save-btn').addEventListener('click', async () => {
    const name = formCard.querySelector('#taskName').value;
    const desc = formCard.querySelector('#taskDesc').value;
    const deadline = formCard.querySelector('#taskDeadline').value;
    const email = formCard.querySelector('#taskEmail').value;
    const phone = formCard.querySelector('#taskPhone').value;
    const uploadProof = formCard.querySelector('[data-id="upload"]').classList.contains('selected');

    if (!name || !deadline || !selectedNotifyType) {
      alert('Please enter task name, deadline, and select notification type');
      return;
    }

    if (selectedNotifyType === 'email' && !email) {
      alert('Please enter email address');
      return;
    }

    if (selectedNotifyType === 'whatsapp' && !phone) {
      alert('Please enter phone number');
      return;
    }

    try {
      const newTask = await TaskAPI.create({
        title: name,
        description: desc,
        deadline: deadline,
        notifyType: selectedNotifyType,
        email: selectedNotifyType === 'email' ? email : null,
        phone: selectedNotifyType === 'whatsapp' ? phone : null
      });

      if (newTask.success || newTask.data) {
        addTaskCard(newTask.data, uploadProof);
        formCard.remove();
        showToast('✅ Task created!');
      }
    } catch (error) {
      alert('Failed to create task: ' + error.message);
    }
  });

  formCard.querySelector('.cancel-btn').addEventListener('click', () => formCard.remove());
}

function updateTaskStatus(card, taskData) {
  const today = new Date().toISOString().split("T")[0];
  const taskDate = taskData.deadline;
  const taskInfo = card.querySelector('.task-info');

  if (taskData.isCompleted) {
    taskInfo.innerHTML = `<h3>${taskData.title}</h3><p style="color:lime;font-weight:bold;text-align:center;">✓ DONE</p>`;
  } else if (taskDate < today) {
    taskInfo.innerHTML = `<h3>${taskData.title}</h3><p style="color:red;font-weight:bold;text-align:center;">⚠️ OVERDUE</p>`;
  } else {
    taskInfo.innerHTML = `<h3>${taskData.title}</h3><p>${taskDate}</p>`;
  }
}

function addTaskCard(taskData, needsProof = false) {
  totalTasks++;
  completedTasks += taskData.isCompleted ? 1 : 0;
  updatePieChart();

  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.taskId = taskData._id;
  card.dataset.deadline = taskData.deadline;
  card.dataset.completed = taskData.isCompleted.toString();
  card.dataset.name = taskData.title;

  tasksMap.set(taskData._id, taskData);

  card.innerHTML = `
    <div class="left-circle ${taskData.isCompleted ? 'completed' : ''}"></div>
    <div class="task-info"><h3>${taskData.title}</h3><p>${taskData.deadline}</p></div>
    <button class="deleteBtn">🗑️</button>
  `;
  tasksContainer.appendChild(card);

  const leftCircle = card.querySelector('.left-circle');
  const deleteBtn = card.querySelector('.deleteBtn');

  leftCircle.addEventListener('click', async () => {
    if (taskData.isCompleted) return;

    if (needsProof || taskData.proofImage) {
      const taskInfo = card.querySelector('.task-info');
      taskInfo.innerHTML = `
        <h3>${taskData.title}</h3>
        <p style="color:orange;font-weight:bold;text-align:center;">Upload Proof</p>
        <p>Upload photo as proof:</p>
        <label class="custom-file-label">Choose File</label>
        <input type="file" class="custom-file-input" accept="image/*">
      `;
      const fileInput = taskInfo.querySelector('.custom-file-input');
      const fileLabel = taskInfo.querySelector('.custom-file-label');
      fileLabel.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        if (fileInput.files.length > 0) {
          try {
            const file = fileInput.files[0];
            await TaskAPI.uploadProof(taskData._id, file);
            await TaskAPI.markComplete(taskData._id);
            
            taskData.isCompleted = true;
            card.dataset.completed = 'true';
            leftCircle.classList.add('completed');
            completedTasks++;
            updatePieChart();
            updateTaskStatus(card, taskData);
            markStreakToday();
            checkDeadlines();
            showToast('✅ Task completed!');
          } catch (error) {
            alert('Failed to upload proof: ' + error.message);
          }
        }
      });
    } else {
      try {
        await TaskAPI.markComplete(taskData._id);
        taskData.isCompleted = true;
        card.dataset.completed = 'true';
        leftCircle.classList.add('completed');
        completedTasks++;
        updatePieChart();
        updateTaskStatus(card, taskData);
        markStreakToday();
        checkDeadlines();
        showToast('✅ Task completed!');
      } catch (error) {
        alert('Failed to mark complete: ' + error.message);
      }
    }
    applyScrollShrink();
  });

  deleteBtn.addEventListener('click', async () => {
    if (confirm('Delete this task?')) {
      try {
        await TaskAPI.delete(taskData._id);
        if (taskData.isCompleted) completedTasks--;
        totalTasks--;
        tasksMap.delete(taskData._id);
        updatePieChart();
        card.remove();
        applyScrollShrink();
        checkDeadlines();
        showToast('✅ Task deleted');
      } catch (error) {
        alert('Failed to delete task: ' + error.message);
      }
    }
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
    const taskId = card.dataset.taskId;
    const taskData = tasksMap.get(taskId);
    if (!taskData) return;

    const deadline = taskData.deadline;

    if (deadline === today) {
      card.classList.add('deadline-today');
      tasksContainer.prepend(card);
    } else {
      card.classList.remove('deadline-today');
    }

    if ((deadline <= today) && !taskData.isCompleted) {
      urgentCount++;
      const label = deadline === today ? '🔴 Due TODAY' : '⚠️ Overdue';
      dacList.innerHTML += `
        <div class="dac-item">
          <strong>${taskData.title}</strong> — ${label} (${deadline})
        </div>`;
    }

    updateTaskStatus(card, taskData);
  });

  alertCard.style.display = urgentCount > 0 ? 'block' : 'none';
}

function applyScrollShrink() {
  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const sh = window.innerHeight;
    let scale = 1 - (rect.top / sh) * 0.15;
    if (scale > 1) scale = 1;
    if (scale < 0.85) scale = 0.85;
    card.style.transform = `scale(${scale})`;
  });
}

function refreshUI() {
  checkDeadlines();
  applyScrollShrink();
}

document.querySelector('.right-column').addEventListener('scroll', applyScrollShrink);





let userProfile = JSON.parse(localStorage.getItem('ds_profile') || 'null') || {
  name: '', email: '', phone: ''
};

async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        userProfile = {
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
          phone: userData.phone || '+91 XXXXXXXXXX',
          emailNotifications: userData.emailNotifications !== false,
          smsNotifications: userData.smsNotifications !== false,
          whatsappNotifications: userData.whatsappNotifications !== false
        };
        localStorage.setItem('ds_profile', JSON.stringify(userProfile));
        renderProfile();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  } else {
    renderProfile();
  }
}

function renderProfile() {
  const name = userProfile.name || 'No Name';
  const email = userProfile.email || 'No Email';
  const phone = userProfile.phone || 'No Phone';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  document.getElementById('avatarInitials').textContent = initials;
  document.getElementById('pdAvatar').textContent = initials;
  document.getElementById('pdName').textContent = name;
  document.getElementById('pdEmail').textContent = email;
  document.getElementById('pdPhone').textContent = phone;
}
loadUserProfile();

const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
profileBtn.addEventListener('click', e => {
  e.stopPropagation();
  profileDropdown.classList.toggle('open');
});
document.addEventListener('click', () => profileDropdown.classList.remove('open'));
profileDropdown.addEventListener('click', e => e.stopPropagation());

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

function updateNavStats() {
  document.getElementById('nav-total').textContent = totalTasks;
  document.getElementById('nav-done').textContent = completedTasks;
  document.getElementById('nav-pending').textContent = totalTasks - completedTasks;
}

function markStreakToday() {
  const today = new Date().toDateString();
  const lastDay = localStorage.getItem('ds_streak_lastday');
  let count = parseInt(localStorage.getItem('ds_streak_count') || '0');

  if (lastDay !== today) {
    count++;
    localStorage.setItem('ds_streak_lastday', today);
    localStorage.setItem('ds_streak_count', count);
  }

  if (document.getElementById('streakCount')) {
    document.getElementById('streakCount').textContent = count;
  }
}

function checkStreakOnLoad() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastDay = localStorage.getItem('ds_streak_lastday');
  let count = parseInt(localStorage.getItem('ds_streak_count') || '0');

  if (lastDay && lastDay !== today && lastDay !== yesterday) {
    count = 0;
    localStorage.setItem('ds_streak_count', 0);
  }

  if (document.getElementById('streakCount')) {
    document.getElementById('streakCount').textContent = count;
  }
}

function closeHelp() {
  if (document.getElementById('helpOverlay')) {
    document.getElementById('helpOverlay').classList.remove('open');
  }
}

if (document.getElementById('helpOverlay')) {
  document.getElementById('helpOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeHelp();
  });
}

function openEditProfile() {
  profileDropdown.classList.remove('open');
  if (document.getElementById('editName')) {
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editEmail').value = userProfile.email;
    document.getElementById('editPhone').value = userProfile.phone;
    
    document.getElementById('emailNotifications').checked = userProfile.emailNotifications !== false;
    document.getElementById('smsNotifications').checked = userProfile.smsNotifications !== false;
    document.getElementById('whatsappNotifications').checked = userProfile.whatsappNotifications !== false;
    
    document.getElementById('editOverlay').classList.add('open');
  }
}

function closeEditProfile() {
  if (document.getElementById('editOverlay')) {
    document.getElementById('editOverlay').classList.remove('open');
  }
}

function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  
  const emailNotifications = document.getElementById('emailNotifications').checked;
  const smsNotifications = document.getElementById('smsNotifications').checked;
  const whatsappNotifications = document.getElementById('whatsappNotifications').checked;
  
  if (!name || !email) { showToast('⚠️ Name and email are required.'); return; }
  
  userProfile = { 
    name, 
    email, 
    phone,
    emailNotifications,
    smsNotifications,
    whatsappNotifications
  };
  localStorage.setItem('ds_profile', JSON.stringify(userProfile));
  
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:5000/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        emailNotifications,
        smsNotifications,
        whatsappNotifications
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        showToast('✅ Profile updated!');
      } else {
        showToast('❌ Failed to update profile');
      }
    })
    .catch(err => {
      console.error('Profile update error:', err);
      showToast('❌ Server error');
    });
  } else {
    showToast('✅ Profile updated locally!');
  }
  
  renderProfile();
  closeEditProfile();
}

if (document.getElementById('editOverlay')) {
  document.getElementById('editOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeEditProfile();
  });
}

function exportTasks() {
  profileDropdown.classList.remove('open');
  const cards = document.querySelectorAll('.task-card');
  if (!cards.length) { showToast('No tasks to export.'); return; }
  let csv = 'Task,Deadline,Status\n';
  cards.forEach(card => {
    const taskId = card.dataset.taskId;
    const taskData = tasksMap.get(taskId);
    if (taskData) {
      const status = taskData.isCompleted ? 'Completed' : 'Pending';
      csv += `"${taskData.title}","${taskData.deadline}","${status}"\n`;
    }
  });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: 'deadlineshield_tasks.csv'
  });
  a.click();
  showToast('📥 Tasks exported!');
}

function logOut() {
  showToast('👋 Logging out…');
  setTimeout(() => window.location.href = 'landing_page.html', 1400);
}

function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }
}

async function loadTasks() {
  try {
    const active = document.activeElement;
    if (active && active.closest && active.closest('.task-form')) {
      return;
    }


    const openForms = Array.from(tasksContainer.querySelectorAll('.task-form'));
    const preserved = openForms.map(form => {
      const values = {
        taskName: form.querySelector('#taskName')?.value || '',
        taskDesc: form.querySelector('#taskDesc')?.value || '',
        taskDeadline: form.querySelector('#taskDeadline')?.value || '',
        taskEmail: form.querySelector('#taskEmail')?.value || '',
        taskPhone: form.querySelector('#taskPhone')?.value || '',
        selectedNotifyType: form.querySelector('.option-circle.selected[data-id="email"]') ? 'email'
          : (form.querySelector('.option-circle.selected[data-id="whatsapp"]') ? 'whatsapp' : null),
        uploadProofSelected: !!form.querySelector('.option-circle.selected[data-id="upload"]')
      };
      return { form, values };
    });

    const result = await TaskAPI.getAll();
    const tasks = result.data || result;

    tasksContainer.innerHTML = '';
    completedTasks = 0;
    totalTasks = 0;
    tasksMap.clear();

    if (Array.isArray(tasks)) {
      tasks.forEach(task => addTaskCard(task));
    }


    preserved.forEach(({ form, values }) => {
      tasksContainer.prepend(form);

      const setVal = (sel, v) => {
        const el = form.querySelector(sel);
        if (el) el.value = v;
      };
      setVal('#taskName', values.taskName);
      setVal('#taskDesc', values.taskDesc);
      setVal('#taskDeadline', values.taskDeadline);
      setVal('#taskEmail', values.taskEmail);
      setVal('#taskPhone', values.taskPhone);


      const emailCircle = form.querySelector('.option-circle[data-id="email"]');
      const whatsappCircle = form.querySelector('.option-circle[data-id="whatsapp"]');
      const uploadCircle = form.querySelector('.option-circle[data-id="upload"]');
      if (emailCircle) emailCircle.classList.toggle('selected', values.selectedNotifyType === 'email');
      if (whatsappCircle) whatsappCircle.classList.toggle('selected', values.selectedNotifyType === 'whatsapp');
      if (uploadCircle) uploadCircle.classList.toggle('selected', values.uploadProofSelected);

      const emailLabel = form.querySelector('#emailLabel') || document.getElementById('emailLabel');
      const phoneLabel = form.querySelector('#phoneLabel') || document.getElementById('phoneLabel');
      if (emailLabel) emailLabel.style.display = values.selectedNotifyType === 'email' ? 'block' : 'none';
      if (phoneLabel) phoneLabel.style.display = values.selectedNotifyType === 'whatsapp' ? 'block' : 'none';
    });

    refreshUI();
  } catch (error) {
    console.error('Failed to load tasks:', error.message);
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'text-align:center; color:#999; padding:40px;';
    placeholder.textContent = '⚠️ Unable to connect to server. Make sure backend is running on http://localhost:5000';
    tasksContainer.appendChild(placeholder);
  }
}

window.addEventListener('load', () => {
  loadTasks();
  markStreakToday();

  setInterval(() => {
    loadTasks();
  }, 30000);
});
