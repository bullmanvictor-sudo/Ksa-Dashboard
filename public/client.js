const socket = io();

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// ================= DASHBOARD =================
const dashboardBody = document.getElementById("dashboard-body");
socket.on("status-update", data => {
  if (dashboardBody) {
    dashboardBody.innerHTML = "";
    for (const username in data) {
      const user = data[username];
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.innerText = username;

      const statusTd = document.createElement("td");
      statusTd.innerHTML = user.active ? '<span class="active">Active</span>' : '<span class="inactive">Inactive</span>';

      const lastActiveTd = document.createElement("td");
      lastActiveTd.innerText = user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : "-";

      const totalTimeTd = document.createElement("td");
      totalTimeTd.innerText = formatTime(user.activeSeconds);

      const dailyLoginsTd = document.createElement("td");
      dailyLoginsTd.innerText = user.dailyLogins;

      tr.append(nameTd, statusTd, lastActiveTd, totalTimeTd, dailyLoginsTd);
      dashboardBody.appendChild(tr);
    }
  }

  // Update other active count on user page
  const usernameInput = document.getElementById("username");
  const activeCount = document.getElementById("active-count");
  if (usernameInput && activeCount) {
    let count = 0;
    for (const u in data) if (data[u].active) count++;
    if (usernameInput.value && data[usernameInput.value]?.active) count--;
    activeCount.innerText = `Other active users: ${count}`;
  }
});

// ================= USER LOGIN =================
const loginForm = document.getElementById("login-form");
const toggleBtn = document.getElementById("toggle-btn");
const loginResult = document.getElementById("login-result");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return;
  socket.emit("login-user", { username, password });
}

socket.on("login-result", data => {
  if (!loginResult) return;
  if (data.success) {
    loginResult.innerText = `Welcome ${data.username}`;
    if (loginForm) loginForm.style.display = "none";
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.innerText = data.status.active ? "Active" : "Inactive";
      toggleBtn.style.backgroundColor = data.status.active ? "green" : "red";
    }
  } else {
    loginResult.innerText = `Login failed: ${data.msg}`;
  }
});

// ================= TOGGLE ACTIVE =================
function toggleActive() {
  if (!toggleBtn || !usernameInput) return;
  const newState = toggleBtn.innerText === "Inactive";
  socket.emit("toggle-status", { username: usernameInput.value, state: newState });
  toggleBtn.innerText = newState ? "Active" : "Inactive";
  toggleBtn.style.backgroundColor = newState ? "green" : "red";
}

// ================= HEARTBEAT =================
setInterval(() => {
  if (usernameInput && usernameInput.value) socket.emit("heartbeat", usernameInput.value);
}, 1000);
