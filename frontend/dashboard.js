<<<<<<< HEAD
// HTML Escape function to prevent XSS attacks
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Restored dashboard.js with minimal left-side positioning change

// Original task creation with only positioning change
function addTaskCard() {
  const tasksContainer = document.querySelector(".tasks-container");
  const formCard = document.createElement("div");
  formCard.className = "task-form";
  formCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: var(--text);">Add New Task</h2>
      <button class="close-btn" style="background:#ff4757; padding: 8px 12px; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">×</button>
    </div>
    <label style="display: block; margin-bottom: 15px;">
      <span style="display: block; margin-bottom: 5px; color: var(--text); font-weight: 500;">Task Name:</span>
      <input type="text" id="taskName" placeholder="Enter task name" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text);">
    </label>
    <label style="display: block; margin-bottom: 15px;">
      <span style="display: block; margin-bottom: 5px; color: var(--text); font-weight: 500;">Description:</span>
      <textarea id="taskDesc" placeholder="Enter task description (optional)" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); min-height: 80px; resize: vertical;"></textarea>
    </label>
    <label style="display: block; margin-bottom: 15px;">
      <span style="display: block; margin-bottom: 5px; color: var(--text); font-weight: 500;">Deadline:</span>
      <input type="date" id="taskDeadline" placeholder="YYYY-MM-DD" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text);">
    </label>
    <div style="margin-bottom: 15px;">
      <span style="display: block; margin-bottom: 10px; color: var(--text); font-weight: 500;">Get reminders through:</span>
      <div style="display: flex; gap: 20px; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="taskEmailCheckbox" style="cursor: pointer; width: 18px; height: 18px;">
          <label for="taskEmailCheckbox" style="cursor: pointer; color: var(--text); user-select: none;">Email</label>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="taskSmsCheckbox" style="cursor: pointer; width: 18px; height: 18px;">
          <label for="taskSmsCheckbox" style="cursor: pointer; color: var(--text); user-select: none;">SMS</label>
        </div>
      </div>
    </div>
    <div id="taskEmailContainer" style="display: none; margin-bottom: 15px; background: rgba(0,255,255,0.05); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
      <label style="display: block; margin-bottom: 5px;">
        <span style="display: block; margin-bottom: 5px; color: var(--text); font-weight: 500;">Email:</span>
        <input type="email" id="taskEmail" placeholder="your@email.com" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text);">
      </label>
    </div>
    <div id="taskSmsContainer" style="display: none; margin-bottom: 15px; background: rgba(0,255,255,0.05); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
      <label style="display: block; margin-bottom: 5px;">
        <span style="display: block; margin-bottom: 5px; color: var(--text); font-weight: 500;">Phone Number:</span>
        <input type="tel" id="taskPhone" placeholder="+1234567890" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text);">
      </label>
    </div>
    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button class="save-btn" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Save</button>
      <button class="cancel-btn" style="flex: 1; padding: 12px; background:#ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel</button>
    </div>
  `;

  // Position as modal dialog
  formCard.style.position = "fixed";
  formCard.style.top = "50%";
  formCard.style.left = "50%";
  formCard.style.transform = "translateX(-50%) translateY(-50%)";
  formCard.style.zIndex = "1000";
  formCard.style.background = "var(--bg2)";
  formCard.style.padding = "25px";
  formCard.style.borderRadius = "12px";
  formCard.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
  formCard.style.width = "380px";
  formCard.style.maxHeight = "80vh";
  formCard.style.overflow = "auto";

  document.body.appendChild(formCard);

  // Add backdrop
  const backdrop = document.createElement("div");
  backdrop.style.position = "fixed";
  backdrop.style.top = "0";
  backdrop.style.left = "0";
  backdrop.style.width = "100%";
  backdrop.style.height = "100%";
  backdrop.style.background = "rgba(0,0,0,0.5)";
  backdrop.style.zIndex = "999";
  backdrop.onclick = () => {
    formCard.remove();
    backdrop.remove();
  };
  document.body.appendChild(backdrop);

  // Pre-fill from stored user data
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.email) {
      const ei = formCard.querySelector("#taskEmail");
      if (ei) ei.value = storedUser.email;
    }
    if (storedUser.phone) {
      const pi = formCard.querySelector("#taskPhone");
      if (pi) pi.value = storedUser.phone;
    }
  } catch (_) {}

  // Checkbox change listeners for showing/hiding containers
  const emailCheckbox = formCard.querySelector("#taskEmailCheckbox");
  const smsCheckbox = formCard.querySelector("#taskSmsCheckbox");
  const emailContainer = formCard.querySelector("#taskEmailContainer");
  const smsContainer = formCard.querySelector("#taskSmsContainer");

  emailCheckbox.addEventListener("change", () => {
    emailContainer.style.display = emailCheckbox.checked ? "block" : "none";
    if (!emailCheckbox.checked) {
      formCard.querySelector("#taskEmail").value = "";
    }
  });

  smsCheckbox.addEventListener("change", () => {
    smsContainer.style.display = smsCheckbox.checked ? "block" : "none";
    if (!smsCheckbox.checked) {
      formCard.querySelector("#taskPhone").value = "";
    }
  });

  // Save button click handler
  formCard.querySelector(".save-btn").addEventListener("click", async () => {
    console.log("💾 Save button clicked");
    const name = formCard.querySelector("#taskName").value.trim();
    const desc = formCard.querySelector("#taskDesc").value.trim();
    const deadline = formCard.querySelector("#taskDeadline").value.trim();
    const email = formCard.querySelector("#taskEmail").value.trim();
    const phone = formCard.querySelector("#taskPhone").value.trim();

    // Check which checkboxes are selected
    const emailChecked = emailCheckbox.checked;
    const smsChecked = smsCheckbox.checked;

    console.log("Form values:", { name, desc, deadline, email, phone, emailChecked, smsChecked });

    if (!name || !deadline) {
      showToast("⚠️ Please fill in task name and deadline");
      return;
    }

    if (emailChecked && !email) {
      showToast("⚠️ Please enter email address");
      return;
    }

    if (smsChecked && !phone) {
      showToast("⚠️ Please enter phone number");
      return;
    }

    if (!emailChecked && !smsChecked) {
      showToast("⚠️ Please select at least one notification method");
      return;
    }

    try {
      let notifyType = "email";
      if (emailChecked && smsChecked) notifyType = "both";
      else if (smsChecked) notifyType = "sms";
      else if (emailChecked) notifyType = "email";

      console.log("📤 Sending request:", { notifyType, title: name, deadline, email, phone });
      
      const response = await authFetch("/api/tasks/add", {
        method: "POST",
        body: JSON.stringify({
          title: name,
          description: desc,
          deadline: deadline,
          notifyType: notifyType,
          email: emailChecked ? email : null,
          phone: smsChecked ? phone : null,
        }),
      });

      console.log("📥 Response received:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Task creation response error:", response.status, errorText);
        showToast("❌ Server error: " + response.status + " " + response.statusText);
        return;
      }

      const responseText = await response.text();
      if (!responseText) {
        console.error("Empty response from task creation endpoint");
        showToast("❌ Empty response from server");
        return;
      }

      let newTask;
      try {
        newTask = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response:", responseText);
        showToast("❌ Invalid server response format");
        return;
      }

      if (newTask.success || newTask.data) {
        showToast("✅ Task created successfully!");
        formCard.remove();
        backdrop.remove();
        refreshUI();
        showAddAnotherTaskButton();
      } else {
        showToast("❌ " + (newTask.message || "Failed to create task"));
      }
    } catch (error) {
      console.error("❌ Task creation error:", error);
      showToast("❌ Failed to create task: " + error.message);
    }
  });

  formCard.querySelector(".cancel-btn").addEventListener("click", () => {
    formCard.remove();
    backdrop.remove();
  });

  // Add close button functionality
  formCard.querySelector(".close-btn").addEventListener("click", () => {
    formCard.remove();
    backdrop.remove();
  });
}

async function refreshUI() {
  const container = document.querySelector(".tasks-container");
  if (!container) return;
  try {
    const response = await authFetch("/api/tasks");
    if (!response.ok) {
      let msg = `Failed to load tasks (HTTP ${response.status})`;
      try {
        const errText = await response.text();
        if (errText) msg += `: ${errText}`;
      } catch {}
      console.error(msg);
      container.innerHTML = `<div class="tasks-empty-state"><p>${msg}</p></div>`;
      return;
    }
    const responseText = await response.text();
    if (!responseText) {
      container.innerHTML = '<div class="tasks-empty-state"><p>No tasks</p></div>';
      return;
    }
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      container.innerHTML = '<div class="tasks-empty-state"><p>Error loading tasks (invalid server response)</p></div>';
      return;
    }
    if (data.success && Array.isArray(data.data)) {
      container.innerHTML = "";
      if (data.data.length === 0) {
        container.innerHTML = `<div class="tasks-empty-state">
          <div style="font-size:3rem;opacity:0.4;margin-bottom:12px;">📋</div>
          <p style="font-weight:600;color:var(--text);margin:0 0 6px;">No tasks yet</p>
          <p style="font-size:0.83rem;color:var(--muted);margin:0;">Click <strong style="color:var(--accent);">+ Add Task</strong> above to get started.</p>
        </div>`;
        const c = document.getElementById("addAnotherContainer");
        if (c) c.innerHTML = "";
        updateDeadlineAlerts([]);
        updateStreak([]);
        updatePieChart([]);
        renderHistory([]);
        updateProfessionalSection([]);
        return;
      }
      data.data.forEach((task) => renderTaskCard(task, container));
      updateDeadlineAlerts(data.data);
      updateStreak(data.data);
      updatePieChart(data.data);
      renderHistory(data.data);
      if (data.data.length > 0) {
        showAddAnotherTaskButton();
      } else {
        const c = document.getElementById("addAnotherContainer");
        if (c) c.innerHTML = "";
      }
      updateProfessionalSection(data.data);
    }
  } catch (error) {
    let msg = `Failed to load tasks: ${error && error.message ? error.message : error}`;
    container.innerHTML = `<div class="tasks-empty-state"><p>${msg}</p></div>`;
    console.error(msg);
  }
}

function renderTaskCard(task, container) {
  const card = document.createElement("div");
  card.className = "task-card" + (task.isCompleted ? " completed" : "");
  const today = new Date().toISOString().split("T")[0];
  if (!task.isCompleted && task.deadline <= today) {
    card.classList.add("deadline-today");
  }
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  if (
    !task.isCompleted &&
    task.deadline > today &&
    task.deadline <= threeDaysFromNow
  ) {
    card.classList.add("deadline-soon");
  }
  if (task.isCompleted) {
    card.classList.add("task-done");
  }
  card.innerHTML = `
    <div class="left-circle ${task.isCompleted ? "completed" : ""}" style="${task.isCompleted ? "" : "cursor:pointer"}"></div>
    <div class="task-info">
      <strong style="color:var(--text)">${task.title}</strong>
      ${task.description ? `<p style="font-size:13px;color:var(--muted);margin:4px 0 0">${task.description}</p>` : ""}
      <p style="font-size:12px;color:var(--muted);margin:4px 0 0">📅 ${task.deadline}${task.notifyType ? `<span style="margin-left:8px;background:rgba(0,255,255,0.08);border:1px solid var(--border);border-radius:6px;padding:1px 6px;font-size:0.65rem;color:var(--accent);">🔔 ${task.notifyType}</span>` : ""}</p>
    </div>
    <button class="deleteBtn">Delete</button>
  `;

  const circle = card.querySelector(".left-circle");
  if (!task.isCompleted) {
    circle.addEventListener("click", async () => {
      try {
        const res = await authFetch("/api/tasks/complete/" + task._id, {
          method: "PATCH",
        });
        const d = await res.json();
        if (d.success) {
          showToast("🎉 Task completed!");
          await refreshUI();
          setTimeout(() => {
            const historyBody = document.getElementById("historyPanelBody");
            if (historyBody && historyBody.classList.contains("collapsed")) {
              toggleHistoryPanel();
            }
            const historyPanel = document.getElementById("taskHistoryPanel");
            if (historyPanel) {
              historyPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
          }, 200);
        } else {
          showToast("❌ " + (d.message || "Failed to mark complete"));
        }
      } catch {
        showToast("❌ Failed to mark task complete");
      }
    });
  }

  card.querySelector(".deleteBtn").addEventListener("click", async () => {
    try {
      const res = await authFetch("/api/tasks/delete/" + task._id, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.success) {
        refreshUI();
        showToast("🗑️ Task deleted!");
      } else {
        showToast("❌ " + (d.message || "Failed to delete task"));
      }
    } catch {
      showToast("❌ Failed to delete task");
    }
  });

  container.appendChild(card);
}

function updateDeadlineAlerts(tasks) {
  const card = document.getElementById("deadlineAlertCard");
  const list = document.getElementById("dacList");
  if (!card || !list) return;
  const today = new Date().toISOString().split("T")[0];
  const due = tasks.filter((t) => !t.isCompleted && t.deadline <= today);
  if (due.length > 0) {
    card.style.display = "block";
    list.innerHTML = due
      .map(
        (t) =>
          `<div class="dac-item"><strong>${t.title}</strong> — Due: ${t.deadline}</div>`,
      )
      .join("");
  } else {
    card.style.display = "none";
  }
}

function updateStreak(tasks) {
  const el = document.getElementById("streakCount");
  if (!el) return;
  const completedDates = new Set(
    tasks
      .filter((t) => t.isCompleted && t.completedAt)
      .map((t) => String(t.completedAt).substring(0, 10)),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  el.textContent = streak;
}

function showAddAnotherTaskButton() {
  const container = document.getElementById("addAnotherContainer");
  if (!container || container.querySelector(".add-another-btn")) return;
  const btn = document.createElement("button");
  btn.className = "add-another-btn";
  btn.textContent = "➕ Add Another Task";
  btn.addEventListener("click", () => {
    btn.remove();
    addTaskCard();
  });
  container.appendChild(btn);
}

function toggleHistoryPanel() {
  const body = document.getElementById("historyPanelBody");
  const btn = document.getElementById("historyToggleBtn");
  if (!body) return;
  const collapsed = body.classList.toggle("collapsed");
  if (btn) btn.classList.toggle("collapsed", collapsed);
}

function renderHistory(tasks) {
  const list = document.getElementById("personalHistoryList");
  if (!list) return;
  if (!tasks || tasks.length === 0) {
    list.innerHTML =
      '<p style="color:var(--muted);text-align:center;padding:16px 0;font-size:0.85rem;">No task history yet</p>';
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  const sorted = [...tasks].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  list.innerHTML = sorted
    .map((t) => {
      const isOverdue = !t.isCompleted && t.deadline < today;
      const statusClass = t.isCompleted
        ? "status-completed"
        : isOverdue
          ? "status-overdue"
          : "status-pending";
      const statusLabel = t.isCompleted
        ? "Completed"
        : isOverdue
          ? "Overdue"
          : "Pending";
      const completedNote =
        t.isCompleted && t.completedAt
          ? ` · ✅ Done: ${String(t.completedAt).substring(0, 10)}`
          : "";
      return `<div class="history-item">
        <div class="history-item-info">
          <div class="history-item-title">${t.title}</div>
          <div class="history-item-meta">📅 ${t.deadline}${t.notifyType ? ` · <span style="color:var(--accent);font-size:0.68rem;">🔔 ${t.notifyType}</span>` : ""}${completedNote}</div>
        </div>
        <span class="history-item-status ${statusClass}">${statusLabel}</span>
      </div>`;
    })
    .join("");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = "Bearer " + token;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  const _token = localStorage.getItem("token");
  if (!_token) {
    window.location.href = "landing_page.html";
    return;
  }
  const addTaskBtn = document.querySelector(".add-task-btn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", addTaskCard);
  }

  // Initialize pie chart
  initializePieChart();

  // Initialize light mode toggle
  initializeLightMode();

  // Initialize help button
  initializeHelpButton();

  // Initialize profile dropdown
  initializeProfileDropdown();

  // Load user profile data
  loadUserProfile();

  // Load tasks
  refreshUI();

  // Store userRole from user data
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.role) localStorage.setItem("userRole", storedUser.role);
    if (storedUser.role === "other") {
      const profBtn = document.getElementById("professionalMode");
      if (profBtn) profBtn.style.display = "none";
    }
  } catch (_) {}
});

// Profile dropdown functionality
function initializeProfileDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", toggleProfileDropdown);

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !profileBtn.contains(e.target) &&
        !profileDropdown.contains(e.target)
      ) {
        profileDropdown.style.display = "none";
      }
    });
  }
}

function toggleProfileDropdown() {
  const profileDropdown = document.getElementById("profileDropdown");
  if (profileDropdown) {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  }
}

function loadUserProfile() {
  const token = localStorage.getItem("token");
  fetch("/api/auth/me", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Profile data loaded:", data);
      renderProfile(data);
    })
    .catch((error) => {
      console.error("Failed to load profile:", error);
      // Fallback to localStorage if API fails
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        renderProfile(JSON.parse(savedUser));
      }
    });
}

function renderProfile(userData) {
  console.log("Rendering profile with data:", userData); // Debug log

  const profileName = document.getElementById("pdName");
  const profileEmail = document.getElementById("pdEmail");
  const profilePhone = document.getElementById("pdPhone");
  const profileAvatar = document.getElementById("profileAvatar");
  const avatarInitials = document.getElementById("avatarInitials");
  const pdAvatar = document.getElementById("pdAvatar");

  if (profileName) profileName.textContent = userData.name || "No Name";
  if (profileEmail) profileEmail.textContent = userData.email || "No Email";
  if (profilePhone) profilePhone.textContent = userData.phone || "No Phone";

  // Show first letters of name and surname
  let initials = "U";
  if (userData && userData.name) {
    const nameParts = userData.name.split(" ");
    const nameInitials = nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
    initials = nameInitials.slice(0, 2); // Show max 2 initials
    console.log("Calculated initials:", initials); // Debug log
  }

  // Update all avatar elements
  if (profileAvatar) {
    profileAvatar.textContent = initials;
    console.log("Updated profileAvatar to:", initials);
  }
  if (avatarInitials) {
    avatarInitials.textContent = initials;
    console.log("Updated avatarInitials to:", initials);
  }
  if (pdAvatar) {
    pdAvatar.textContent = initials;
    console.log("Updated pdAvatar to:", initials);
  }

  // Save to localStorage as fallback
  localStorage.setItem("userData", JSON.stringify(userData));
}

// Light mode functionality
function initializeLightMode() {
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleLightMode);
  }

  // Load saved theme preference and apply it
  const savedTheme = localStorage.getItem("lightMode");
  if (savedTheme === "true") {
    document.body.classList.add("light");
    updateThemeButton(true);
  } else {
    document.body.classList.remove("light");
    updateThemeButton(false);
  }
}

function updateThemeButton(isLightMode) {
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");
  if (themeIcon && themeText) {
    if (isLightMode) {
      themeIcon.textContent = "🌙";
      themeText.textContent = "Dark Mode";
    } else {
      themeIcon.textContent = "☀️";
      themeText.textContent = "Light Mode";
    }
  }
}

function toggleLightMode() {
  const isLightMode = document.body.classList.contains("light");

  if (isLightMode) {
    // Switch to dark mode
    document.body.classList.remove("light");
    localStorage.setItem("lightMode", "false");
    updateThemeButton(false);
  } else {
    // Switch to light mode
    document.body.classList.add("light");
    localStorage.setItem("lightMode", "true");
    updateThemeButton(true);
  }
}

// Profile dropdown option functions
function openEditProfile() {
  const editOverlay = document.getElementById("editOverlay");
  if (editOverlay) {
    editOverlay.style.display = "flex";
  }
}

function closeEditProfile() {
  const editOverlay = document.getElementById("editOverlay");
  if (editOverlay) {
    editOverlay.style.display = "none";
  }
}

function openSettings() {
  const settingsOverlay = document.getElementById("settingsOverlay");
  if (settingsOverlay) {
    settingsOverlay.style.display = "flex";
  }
}

function closeSettings() {
  const settingsOverlay = document.getElementById("settingsOverlay");
  if (settingsOverlay) {
    settingsOverlay.style.display = "none";
  }
}

function saveProfile() {
  // Save profile changes
  const name = document.getElementById("editName")?.value;
  const email = document.getElementById("editEmail")?.value;
  const phone = document.getElementById("editPhone")?.value;

  // API call to save profile
  const token = localStorage.getItem("token");
  fetch("/api/auth/update-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name, email, phone }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success || data.user) {
        showToast("✅ Profile updated successfully!");
        loadUserProfile();
        closeEditProfile();
      } else {
        showToast("❌ " + (data.message || "Failed to update profile"));
      }
    })
    .catch((error) => {
      showToast("Failed to update profile");
    });
}

function saveSettings() {
  // Save settings
  const settings = {
    reminderTime: document.getElementById("reminderTime")?.value,
    completionSound: document.getElementById("completionSound")?.checked,
    defaultTheme: document.getElementById("defaultTheme")?.value,
    compactView: document.getElementById("compactView")?.checked,
    autoDelete: document.getElementById("autoDelete")?.value,
    defaultPriority: document.getElementById("defaultPriority")?.value,
    sessionTimeout: document.getElementById("sessionTimeout")?.value,
    twoFactorAuth: document.getElementById("twoFactorAuth")?.checked,
  };

  // API call to save settings
  fetch("/api/user/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Settings saved successfully!");
        closeSettings();
      }
    })
    .catch((error) => {
      showToast("Failed to save settings");
    });
}

function resetSettings() {
  if (confirm("Reset all settings to default?")) {
    fetch("/api/user/settings", { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showToast("Settings reset to default");
          closeSettings();
        }
      });
  }
}

async function exportTasks() {
  try {
    const response = await authFetch("/api/tasks");
    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      showToast("❌ Failed to export tasks");
      return;
    }
    const rows = [
      ["Title", "Description", "Deadline", "Status", "Notification Type"],
      ...data.data.map((t) => [
        t.title,
        t.description || "",
        t.deadline,
        t.isCompleted ? "Completed" : "Pending",
        t.notifyType || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("✅ Tasks exported successfully!");
  } catch (error) {
    showToast("❌ Failed to export tasks");
  }
}

function logOut() {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.clear();
    window.location.href = "landing_page.html";
  }
}
function initializeHelpButton() {
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
    helpBtn.addEventListener("click", openHelp);
  }
}

function openHelp() {
  const helpOverlay = document.getElementById("helpOverlay");
  if (helpOverlay) {
    helpOverlay.style.display = "flex";
=======





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
>>>>>>> origin/feature/new-pages-and-database-cleanup
  }
}

function closeHelp() {
<<<<<<< HEAD
  const helpOverlay = document.getElementById("helpOverlay");
  if (helpOverlay) {
    helpOverlay.style.display = "none";
  }
}

// Pie chart functionality
// ── Pie / Donut chart helpers ─────────────────────────
function drawPieChart(canvasId, textId, tasks) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const textEl = document.getElementById(textId);
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2 - 6;
  const innerR = outerR * 0.52;

  ctx.clearRect(0, 0, w, h);

  const total = tasks ? tasks.length : 0;
  const completedCount = tasks ? tasks.filter((t) => t.isCompleted).length : 0;
  const pendingCount = total - completedCount;

  if (total === 0) {
    // Empty-state ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI, true);
    ctx.fillStyle = "rgba(128,128,128,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(128,128,128,0.28)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Center label
    ctx.fillStyle = "rgba(160,160,160,0.85)";
    ctx.font = `bold ${Math.round(outerR * 0.22)}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No tasks", cx, cy - Math.round(outerR * 0.14));
    ctx.font = `${Math.round(outerR * 0.19)}px Poppins, sans-serif`;
    ctx.fillText("added yet", cx, cy + Math.round(outerR * 0.18));
    if (textEl) textEl.textContent = "0% of tasks completed";
    return;
  }

  const startAngle = -Math.PI / 2;
  const completedAngle = (completedCount / total) * 2 * Math.PI;
  const pendingAngle = (pendingCount / total) * 2 * Math.PI;

  if (completedCount > 0) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, startAngle + completedAngle);
    ctx.closePath();
    ctx.fillStyle = "#00ff88";
    ctx.fill();
  }
  if (pendingCount > 0) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(
      cx,
      cy,
      outerR,
      startAngle + completedAngle,
      startAngle + completedAngle + pendingAngle,
    );
    ctx.closePath();
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
  }

  // Donut hole — detect dark/light mode
  const isDark = !document.body.classList.contains("light");
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = isDark ? "#1a1a1a" : "#e2e2e2";
  ctx.fill();

  // Percentage in centre
  const pct = Math.round((completedCount / total) * 100);
  ctx.fillStyle = isDark ? "#ffffff" : "#111111";
  ctx.font = `bold ${Math.round(outerR * 0.28)}px Orbitron, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pct + "%", cx, cy);

  if (textEl) textEl.textContent = `${pct}% of tasks completed`;
}

function initializePieChart() {
  drawPieChart("completionChart", "completionText", []);
}

function updatePieChart(tasks) {
  drawPieChart("completionChart", "completionText", tasks || []);
}

function updateProfessionalSection(tasks) {
  if (!Array.isArray(tasks)) return;
  const today = new Date().toISOString().split("T")[0];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => !t.isCompleted && t.deadline < today,
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Student view — stat cards
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl("assignedCount", total);
  setEl("completedCount", completed);
  setEl("pendingCount", pending);

  // Faculty view — analytics
  setEl("completionRate", completionRate + "%");
  setEl("overdueCount", overdue);
  setEl("totalStudents", total); // proxy: total tasks shown as workload

  // Admin view — analytics
  setEl("activeTasks", total);

  // Professional pie chart (student view)
  drawPieChart("profPieChart", "profPieText", tasks);

  // Admin history list
  const historyList = document.getElementById("historyList");
  if (historyList) {
    if (tasks.length === 0) {
      historyList.innerHTML =
        '<p style="color:var(--muted);text-align:center;padding:16px;font-size:0.85rem;">No activity yet</p>';
    } else {
      const sorted = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12);
      historyList.innerHTML = sorted
        .map((t) => {
          const isOver = !t.isCompleted && t.deadline < today;
          const sc = t.isCompleted
            ? "status-completed"
            : isOver
              ? "status-overdue"
              : "status-assigned";
          const sl = t.isCompleted
            ? "Completed"
            : isOver
              ? "Overdue"
              : "Pending";
          const notifBadge = t.notifyType
            ? `<span style="background:rgba(0,255,255,0.09);border:1px solid var(--border);border-radius:8px;padding:1px 7px;font-size:0.68rem;color:var(--accent);margin-left:6px;">🔔 ${t.notifyType}</span>`
            : "";
          const doneNote =
            t.isCompleted && t.completedAt
              ? `<span style="color:#00ff88;margin-left:6px;font-size:0.68rem;">✅ ${String(t.completedAt).substring(0, 10)}</span>`
              : "";
          return `<div class="history-item">
            <div class="history-item-info">
              <div class="history-item-title">${t.title}</div>
              <div class="history-item-meta">📅 ${t.deadline}${notifBadge}${doneNote}</div>
            </div>
            <span class="history-item-status ${sc}">${sl}</span>
          </div>`;
        })
        .join("");
    }
  }
}

// ── Mode switching ────────────────────────────────────
function switchToPersonal() {
  document.getElementById("personalDashboard").style.display = "block";
  document.getElementById("professionalDashboard").style.display = "none";
  document.getElementById("personalMode").classList.add("active");
  document.getElementById("professionalMode").classList.remove("active");
}

function switchToProfessional() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || localStorage.getItem("userRole");
    
    // Prevent "other" users from accessing professional section
    if (userRole === "other") {
      showToast("❌ Professional section is not available for your designation");
      return;
    }
    
    document.getElementById("personalDashboard").style.display = "none";
    document.getElementById("professionalDashboard").style.display = "block";
    document.getElementById("personalMode").classList.remove("active");
    document.getElementById("professionalMode").classList.add("active");
    initProfessionalSection();
  } catch (e) {
    console.error("Error switching to professional:", e);
    showToast("❌ Error accessing professional section");
  }
}

function selectRole(role) {
  const views = {
    student: "studentView",
    faculty: "facultyView",
    admin: "adminView",
  };
  Object.values(views).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const target = document.getElementById(views[role]);
  if (target) target.style.display = "block";

  // Update active state on all role buttons across all role-selectors
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick") === `selectRole('${role}')`) {
      btn.classList.add("active");
    }
  });
}

function createAssignment() {
  const title = document.getElementById("assignmentTitle")?.value.trim();
  const desc = document.getElementById("assignmentDesc")?.value.trim();
  const deadline = document.getElementById("assignmentDeadline")?.value;
  const assignTo = document.getElementById("assignTo")?.value;
  const requireProof = document.getElementById("requireProof")?.checked;

  if (!title || !deadline) {
    showToast("⚠️ Please enter a title and deadline");
    return;
  }
  if (!assignTo) {
    showToast("⚠️ Please select who to assign to");
    return;
  }

  const token = localStorage.getItem("token");
  fetch("/api/assignments/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title,
      description: desc,
      deadline,
      assignTo,
      requireProof,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (
        data.assignment ||
        data.message === "Assignment created successfully"
      ) {
        showToast("✅ Assignment created successfully!");
        if (document.getElementById("assignmentTitle"))
          document.getElementById("assignmentTitle").value = "";
        if (document.getElementById("assignmentDesc"))
          document.getElementById("assignmentDesc").value = "";
        if (document.getElementById("assignmentDeadline"))
          document.getElementById("assignmentDeadline").value = "";
      } else {
        showToast("❌ " + (data.message || "Failed to create assignment"));
      }
    })
    .catch(() => showToast("❌ Failed to create assignment"));
}

// ═══════════════════════════════════════════════════════
// PROFESSIONAL SECTION — Role tabs, login, dashboards
// ═══════════════════════════════════════════════════════

function switchProfTab(role) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    // Strict role-based access: only allow access to user's OWN role tab
    if (userRole !== role) {
      showToast(`❌ You can only access ${userRole} content`);
      return;
    }

    if (!token) {
      showToast("❌ Authentication required");
      return;
    }

    // Hide all tabs and panels first
    ["student", "faculty", "admin"].forEach((r) => {
      const tab = document.getElementById("profTab-" + r);
      const panel = document.getElementById("profPanel-" + r);
      if (tab) tab.classList.remove("active");
      if (panel) panel.style.display = "none";
    });

    // Show only the requested role's tab and panel
    const activeTab = document.getElementById("profTab-" + role);
    const activePanel = document.getElementById("profPanel-" + role);
    if (activeTab) activeTab.classList.add("active");
    if (activePanel) activePanel.style.display = "block";

    // Load appropriate dashboard
    if (role === "student") loadStudentDashboard(token);
    else if (role === "faculty") loadFacultyDashboard(token);
    else if (role === "admin") loadAdminDashboard(token);
  } catch (e) {
    console.error("switchProfTab error:", e);
    showToast("❌ Error accessing tab");
  }
}

async function professionalLogin(role) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    const userRole = user.role || localStorage.getItem("userRole");

    // Check if user is logged in
    if (!token || !user._id) {
      showToast("❌ Please log in first from the main dashboard");
      return;
    }

    // Check if user's role matches the panel they're trying to access
    if (userRole !== role) {
      const prefixMap = { student: "stu", faculty: "fac", admin: "adm" };
      const errDiv = document.getElementById(prefixMap[role] + "-login-error");
      if (errDiv) {
        errDiv.textContent = `❌ Your account is registered as "${userRole || "other"}". Please use the ${userRole || "correct"} panel.`;
      }
      return;
    }

    // Show dashboard using main auth
    showProfDashboard(role, user, token);
  } catch (e) {
    console.error("Professional login error:", e);
    showToast("❌ Error accessing professional section");
  }
}

function professionalLogout(role) {
  // Don't remove main auth tokens - just hide professional dashboard
  const loginView = document.getElementById("profLogin-" + role);
  const dashView = document.getElementById("profDash-" + role);
  if (loginView) loginView.style.display = "flex";
  if (dashView) dashView.style.display = "none";
  showToast("Signed out of " + role + " panel.");
}

function showProfDashboard(role, user, token) {
  const panel = document.getElementById("profPanel-" + role);
  const loginView = document.getElementById("profLogin-" + role);
  const dashView = document.getElementById("profDash-" + role);
  
  // Ensure parent panel is visible
  if (panel) panel.style.display = "block";
  if (loginView) loginView.style.display = "none";
  if (dashView) dashView.style.display = "block";

  const prefixMap = { student: "stu", faculty: "fac", admin: "adm" };
  const p = prefixMap[role];
  const nameEl = document.getElementById(p + "-name");
  const avatarEl = document.getElementById(p + "-avatar");
  if (nameEl) nameEl.textContent = user.name || role;
  if (avatarEl)
    avatarEl.textContent = (user.name || role).charAt(0).toUpperCase();

  if (role === "student") loadStudentDashboard(token);
  else if (role === "faculty") loadFacultyDashboard(token);
  else if (role === "admin") loadAdminDashboard(token);
}

function profAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

// ── Student Dashboard ─────────────────────────────────
async function loadStudentDashboard(token) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) {
      console.error("Student user ID not found");
      return;
    }

    const res = await fetch("/api/professional/my-assignments", {
      headers: profAuthHeaders(token),
    });

    if (!res.ok) {
      console.error("Failed to fetch student assignments:", res.status);
      return;
    }

    const responseText = await res.text();
    if (!responseText) {
      console.error("Empty response from assignments endpoint");
      return;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error in loadStudentDashboard:", parseError);
      return;
    }

    if (!data.success) return;

    const assignments = data.data || [];
    const today = new Date().toISOString().split("T")[0];
    
    // Count student's completions accurately
    const studentCompletions = assignments.filter((a) =>
      (a.completions || []).some(
        (c) => c.userId.toString() === user._id.toString() && c.status === "completed"
      )
    );
    const compCount = studentCompletions.length;
    const pendCount = assignments.length - compCount;

    const setEl = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setEl("stu-c-assigned", assignments.length);
    setEl("stu-c-completed", compCount);
    setEl("stu-c-pending", pendCount);
    setEl("stu-task-badge", assignments.length + " tasks");

    const list = document.getElementById("stu-task-list");
    if (!list) return;
    if (assignments.length === 0) {
      list.innerHTML =
        '<div class="prof-empty-state">No assignments yet.<br>Your faculty will assign tasks here.</div>';
      return;
    }

    list.innerHTML = assignments
      .map((a) => {
        // Find this student's completion record
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const myCompletion = (a.completions || []).find(
          (c) => c.userId.toString() === user._id.toString()
        );
        const isCompleted = myCompletion && myCompletion.status === "completed";
        const isOverdue = !isCompleted && a.deadline < today;
        const statusClass = isCompleted
          ? "prof-status-done"
          : isOverdue
            ? "prof-status-overdue"
            : "prof-status-pending";
        const statusLabel = isCompleted
          ? "✅ Completed"
          : isOverdue
            ? "🔴 Overdue"
            : "⏳ Pending";
        const assignedBy =
          a.assignedBy && a.assignedBy.name ? a.assignedBy.name : "Faculty";
        return `<div class="prof-task-item ${isCompleted ? "prof-task-done" : ""}">
          <div class="prof-task-info">
            <div class="prof-task-title">${escapeHtml(a.title)}</div>
            <div class="prof-task-meta">📅 ${a.deadline} · 👨‍🏫 ${escapeHtml(assignedBy)} · 🔔 ${a.notifyType || "email"}</div>
            ${a.description ? `<div class="prof-task-desc">${escapeHtml(a.description)}</div>` : ""}
          </div>
          <div class="prof-task-actions">
            <span class="prof-status-badge ${statusClass}">${statusLabel}</span>
            ${!isCompleted ? `<button class="prof-complete-btn" onclick="stuMarkComplete('${a._id}')">Mark Complete</button>` : ""}
          </div>
        </div>`;
      })
      .join("");
  } catch (e) {
    console.error("loadStudentDashboard error:", e);
  }
}

async function stuMarkComplete(assignmentId) {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await fetch(
      "/api/professional/assignments/" + assignmentId + "/complete",
      { method: "PATCH", headers: profAuthHeaders(token) },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Mark complete error:", res.status, errorText);
      showToast("❌ Server error: " + res.status);
      return;
    }

    const responseText = await res.text();
    if (!responseText) {
      showToast("❌ Empty response from server");
      return;
    }

    let d;
    try {
      d = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      showToast("❌ Invalid server response");
      return;
    }

    if (d.success) {
      showToast("🎉 Assignment marked complete!");
      loadStudentDashboard(token);
    } else {
      showToast("❌ " + (d.message || "Failed"));
    }
  } catch (e) {
    console.error("Mark complete error:", e);
    showToast("❌ Network error: " + e.message);
  }
}

// ── Faculty Dashboard ─────────────────────────────────
async function loadFacultyDashboard(token) {
  try {
    const [studentsRes, assignmentsRes] = await Promise.all([
      fetch("/api/professional/students", { headers: profAuthHeaders(token) }),
      fetch("/api/professional/created-assignments", {
        headers: profAuthHeaders(token),
      }),
    ]);

    if (!studentsRes.ok || !assignmentsRes.ok) {
      console.error("Failed to fetch faculty data:", studentsRes.status, assignmentsRes.status);
      return;
    }

    const studentsText = await studentsRes.text();
    const assignmentsText = await assignmentsRes.text();

    if (!studentsText || !assignmentsText) {
      console.error("Empty response from faculty endpoints");
      return;
    }

    let studentsData, assignmentsData;
    try {
      studentsData = JSON.parse(studentsText);
      assignmentsData = JSON.parse(assignmentsText);
    } catch (parseError) {
      console.error("JSON parse error in loadFacultyDashboard:", parseError);
      return;
    }

    const students = studentsData.data || [];
    const assignments = assignmentsData.data || [];

    const today = new Date().toISOString().split("T")[0];
    let totalCompletions = 0;
    let totalPending = 0;
    assignments.forEach((a) => {
      (a.completions || []).forEach((c) => {
        if (c.status === "completed") totalCompletions++;
        else totalPending++;
      });
    });

    const setEl = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setEl("fac-c-created", assignments.length);
    setEl("fac-c-completed", totalCompletions);
    setEl("fac-c-pending", totalPending);
    setEl("fac-student-badge", students.length + " students");
    setEl("fac-assign-badge", assignments.length + " assignments");

    // Populate student assignment dropdown
    const facAssignTo = document.getElementById("fac-assign-to");
    if (facAssignTo) {
      facAssignTo.innerHTML = '<option value="all">All Students</option>';
      students.forEach(s => {
        const option = document.createElement("option");
        option.value = s._id;
        option.textContent = s.name || "Unknown Student";
        facAssignTo.appendChild(option);
      });
    }

    // Student list
    const stuList = document.getElementById("fac-student-list");
    if (stuList) {
      if (students.length === 0) {
        stuList.innerHTML =
          '<div class="prof-empty-state">No students registered yet.</div>';
      } else {
        stuList.innerHTML = students
          .map((s) => {
            const myAssignments = assignments.filter((a) =>
              (a.assignedTo || []).some(
                (id) => id.toString() === s._id.toString(),
              ),
            );
            const done = myAssignments.filter((a) =>
              (a.completions || []).some(
                (c) =>
                  c.userId &&
                  c.userId.toString() === s._id.toString() &&
                  c.status === "completed",
              ),
            ).length;
            return `<div class="prof-task-item">
              <div class="prof-task-info">
                <div class="prof-task-title">${escapeHtml(s.name)}</div>
                <div class="prof-task-meta">📧 ${escapeHtml(s.email || "")}${s.phone ? " · 📱 " + escapeHtml(s.phone) : ""}</div>
              </div>
              <div class="prof-task-actions">
                <span class="prof-status-badge prof-status-done">${done}/${myAssignments.length} done</span>
              </div>
            </div>`;
          })
          .join("");
      }
    }

    // Assignment history
    const asnList = document.getElementById("fac-assignment-list");
    if (asnList) {
      if (assignments.length === 0) {
        asnList.innerHTML =
          '<div class="prof-empty-state">No assignments created yet.</div>';
      } else {
        asnList.innerHTML = assignments
          .map((a) => {
            const comp = (a.completions || []).filter(
              (c) => c.status === "completed",
            ).length;
            const total = (a.completions || []).length;
            const isOverdue = a.deadline < today;
            return `<div class="prof-task-item">
              <div class="prof-task-info">
                <div class="prof-task-title">${a.title}</div>
                <div class="prof-task-meta">📅 ${a.deadline} · 👥 ${total} assigned · 🔔 ${a.notifyType}</div>
              </div>
              <div class="prof-task-actions">
                <span class="prof-status-badge ${comp === total && total > 0 ? "prof-status-done" : isOverdue ? "prof-status-overdue" : "prof-status-pending"}">${comp}/${total} completed</span>
              </div>
            </div>`;
          })
          .join("");
      }
    }
  } catch (e) {
    console.error("loadFacultyDashboard error:", e);
  }
}

async function facultyCreateAssignment() {
  const token = localStorage.getItem("token");
  if (!token) return;
  const title = document.getElementById("fac-task-title")?.value.trim();
  const desc = document.getElementById("fac-task-desc")?.value.trim();
  const deadline = document.getElementById("fac-task-deadline")?.value;
  const assignTo = document.getElementById("fac-assign-to")?.value;

  // Get checkbox values instead of select
  const emailChecked = document.getElementById("fac-notify-email")?.checked;
  const smsChecked = document.getElementById("fac-notify-sms")?.checked;

  if (!title || !deadline) {
    showToast("⚠️ Title and deadline are required");
    return;
  }

  if (!emailChecked && !smsChecked) {
    showToast("⚠️ Please select at least one notification method");
    return;
  }

  try {
    let notifyType = "email";
    if (emailChecked && smsChecked) notifyType = "both";
    else if (smsChecked) notifyType = "sms";
    else if (emailChecked) notifyType = "email";

    const res = await fetch("/api/professional/assignments", {
      method: "POST",
      headers: profAuthHeaders(token),
      body: JSON.stringify({
        title,
        description: desc,
        deadline,
        assignTo,
        notifyType,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Faculty assignment creation error:", res.status, errorText);
      showToast("❌ Server error: " + res.status);
      return;
    }

    const responseText = await res.text();
    if (!responseText) {
      showToast("❌ Empty response from server");
      return;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error in assignment creation:", parseError);
      showToast("❌ Invalid server response format");
      return;
    }

    if (data.success) {
      showToast(
        "✅ Assignment created! Notified " +
          data.assignedCount +
          " student(s).",
      );
      document.getElementById("fac-task-title").value = "";
      document.getElementById("fac-task-desc").value = "";
      document.getElementById("fac-task-deadline").value = "";
      loadFacultyDashboard(token);
    } else {
      showToast("❌ " + (data.message || "Failed to create"));
    }
  } catch (e) {
    console.error("Faculty assignment error:", e);
    showToast("❌ Network error: " + e.message);
  }
}

// ── Admin Dashboard ───────────────────────────────────
// Faculty name generator for admin dashboard
function generateRandomFacultyNames(count) {
  const firstNames = ["Dr. James", "Dr. Sarah", "Dr. Michael", "Dr. Emma", "Dr. Robert", "Dr. Lisa", "Dr. William", "Dr. Jennifer", "Dr. David", "Dr. Maria"];
  const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

  const generated = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    generated.push(first + " " + last);
  }
  return generated;
}

async function loadAdminDashboard(token) {
  try {
    const [facultyRes, assignmentsRes] = await Promise.all([
      fetch("/api/professional/faculty", { headers: profAuthHeaders(token) }),
      fetch("/api/professional/created-assignments", {
        headers: profAuthHeaders(token),
      }),
    ]);

    if (!facultyRes.ok || !assignmentsRes.ok) {
      console.error("Failed to fetch admin data:", facultyRes.status, assignmentsRes.status);
      return;
    }

    const facultyText = await facultyRes.text();
    const assignmentsText = await assignmentsRes.text();

    if (!facultyText || !assignmentsText) {
      console.error("Empty response from admin endpoints");
      return;
    }

    let facultyData, assignmentsData;
    try {
      facultyData = JSON.parse(facultyText);
      assignmentsData = JSON.parse(assignmentsText);
    } catch (parseError) {
      console.error("JSON parse error in loadAdminDashboard:", parseError);
      return;
    }

    const faculty = facultyData.data || [];
    const assignments = assignmentsData.data || [];

    // If no faculty registered, generate random names for illustration
    let displayFaculty = faculty;
    if (faculty.length === 0) {
      const randomNames = generateRandomFacultyNames(3);
      displayFaculty = randomNames.map((name, i) => ({
        _id: "auto-" + i,
        name: name,
        email: name.toLowerCase().replace(/\s+/g, ".") + "@school.edu",
        phone: null,
      }));
    }

    const today = new Date().toISOString().split("T")[0];

    let totalComp = 0,
      totalPend = 0;
    assignments.forEach((a) => {
      (a.completions || []).forEach((c) => {
        if (c.status === "completed") totalComp++;
        else totalPend++;
      });
    });

    const setEl = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setEl("adm-c-total", assignments.length);
    setEl("adm-c-completed", totalComp);
    setEl("adm-c-pending", totalPend);
    setEl("adm-faculty-badge", displayFaculty.length + " faculty");
    setEl("adm-assign-badge", assignments.length + " assignments");

    // Populate faculty assignment dropdown
    const admAssignTo = document.getElementById("adm-assign-to");
    if (admAssignTo) {
      admAssignTo.innerHTML = '<option value="all">All Faculty</option>';
      displayFaculty.forEach(f => {
        const option = document.createElement("option");
        option.value = f._id;
        option.textContent = f.name || "Unknown Faculty";
        admAssignTo.appendChild(option);
      });
    }

    const facList = document.getElementById("adm-faculty-list");
    if (facList) {
      if (displayFaculty.length === 0) {
        facList.innerHTML =
          '<div class="prof-empty-state">No faculty registered yet.</div>';
      } else {
        facList.innerHTML = displayFaculty
          .map((f) => {
            const myAssignments = assignments.filter((a) =>
              (a.assignedTo || []).some(
                (id) => id.toString() === f._id.toString(),
              ),
            );
            const done = myAssignments.filter((a) =>
              (a.completions || []).some(
                (c) =>
                  c.userId &&
                  c.userId.toString() === f._id.toString() &&
                  c.status === "completed",
              ),
            ).length;
            return `<div class="prof-task-item">
            <div class="prof-task-info">
              <div class="prof-task-title">${escapeHtml(f.name)}</div>
              <div class="prof-task-meta">📧 ${escapeHtml(f.email || "")}</div>
            </div>
            <div class="prof-task-actions">
              <span class="prof-status-badge prof-status-done">${done}/${myAssignments.length} done</span>
            </div>
          </div>`;
          })
          .join("");
      }
    }

    const asnList = document.getElementById("adm-assignment-list");
    if (asnList) {
      if (assignments.length === 0) {
        asnList.innerHTML =
          '<div class="prof-empty-state">No assignments yet.</div>';
      } else {
        asnList.innerHTML = assignments
          .map((a) => {
            const comp = (a.completions || []).filter(
              (c) => c.status === "completed",
            ).length;
            const total = (a.completions || []).length;
            return `<div class="prof-task-item">
            <div class="prof-task-info">
              <div class="prof-task-title">${a.title}</div>
              <div class="prof-task-meta">📅 ${a.deadline} · 👥 ${total} assigned</div>
            </div>
            <div class="prof-task-actions">
              <span class="prof-status-badge ${comp === total && total > 0 ? "prof-status-done" : "prof-status-pending"}">${comp}/${total} done</span>
            </div>
          </div>`;
          })
          .join("");
      }
    }
  } catch (e) {
    console.error("loadAdminDashboard error:", e);
  }
}

async function adminCreateAssignment() {
  const token = localStorage.getItem("token");
  if (!token) return;
  const title = document.getElementById("adm-task-title")?.value.trim();
  const desc = document.getElementById("adm-task-desc")?.value.trim();
  const deadline = document.getElementById("adm-task-deadline")?.value;
  const assignTo = document.getElementById("adm-assign-to")?.value;

  // Get checkbox values instead of select
  const emailChecked = document.getElementById("adm-notify-email")?.checked;
  const smsChecked = document.getElementById("adm-notify-sms")?.checked;

  if (!title || !deadline) {
    showToast("⚠️ Title and deadline are required");
    return;
  }

  if (!emailChecked && !smsChecked) {
    showToast("⚠️ Please select at least one notification method");
    return;
  }

  try {
    let notifyType = "email";
    if (emailChecked && smsChecked) notifyType = "both";
    else if (smsChecked) notifyType = "sms";
    else if (emailChecked) notifyType = "email";

    const res = await fetch("/api/professional/assignments", {
      method: "POST",
      headers: profAuthHeaders(token),
      body: JSON.stringify({
        title,
        description: desc,
        deadline,
        assignTo,
        notifyType,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Admin assignment creation error:", res.status, errorText);
      showToast("❌ Server error: " + res.status);
      return;
    }

    const responseText = await res.text();
    if (!responseText) {
      showToast("❌ Empty response from server");
      return;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error in assignment creation:", parseError);
      showToast("❌ Invalid server response format");
      return;
    }

    if (data.success) {
      showToast(
        "✅ Task assigned! Notified " +
          data.assignedCount +
          " faculty member(s).",
      );
      document.getElementById("adm-task-title").value = "";
      document.getElementById("adm-task-desc").value = "";
      document.getElementById("adm-task-deadline").value = "";
      loadAdminDashboard(token);
    } else {
      showToast("❌ " + (data.message || "Failed"));
    }
  } catch (e) {
    console.error("Admin assignment error:", e);
    showToast("❌ Network error: " + e.message);
  }
}

// ── On Professional tab open — Initialize with main auth ────────
function initProfessionalSection() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    const userRole = user.role || localStorage.getItem("userRole");

    // Require authentication
    if (!token || !user || !user._id) {
      console.log("Professional section requires authentication");
      return;
    }

    // Block access for "other" users BEFORE showing anything
    if (userRole === "other") {
      showToast("❌ Professional section is not available for your designation");
      // Force back to personal dashboard
      document.getElementById("personalDashboard").style.display = "block";
      document.getElementById("professionalDashboard").style.display = "none";
      document.getElementById("personalMode").classList.add("active");
      document.getElementById("professionalMode").classList.remove("active");
      return;
    }

    // Validate user role is one of the three professional roles
    if (!["student", "faculty", "admin"].includes(userRole)) {
      console.warn("Invalid professional role:", userRole);
      return;
    }

    // Hide all tabs and panels FIRST
    ["student", "faculty", "admin"].forEach((role) => {
      const tab = document.getElementById("profTab-" + role);
      const panel = document.getElementById("profPanel-" + role);
      if (tab) {
        tab.style.display = "none";
        tab.classList.remove("active");
      }
      if (panel) {
        panel.style.display = "none";
        // Also hide all views inside
        const dashView = document.getElementById("profDash-" + role);
        const loginView = document.getElementById("profLogin-" + role);
        if (dashView) dashView.style.display = "none";
        if (loginView) loginView.style.display = "none";
      }
    });

    // Show ONLY the user's role's tab and panel
    const userTab = document.getElementById("profTab-" + userRole);
    const userPanel = document.getElementById("profPanel-" + userRole);
    
    if (userTab) {
      userTab.style.display = "inline-flex";
      userTab.classList.add("active");
    }
    if (userPanel) {
      userPanel.style.display = "block";
      // Make sure the dashboard view is shown, not login view
      const dashView = document.getElementById("profDash-" + userRole);
      const loginView = document.getElementById("profLogin-" + userRole);
      if (dashView) dashView.style.display = "block";
      if (loginView) loginView.style.display = "none";
    }

    // Auto-show dashboard for user's role
    setTimeout(() => {
      showProfDashboard(userRole, user, token);
    }, 100);
  } catch (e) {
    console.error("Error initializing professional section:", e);
    showToast("❌ Error initializing professional section");
  }
}
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
