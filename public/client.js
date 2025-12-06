const socket = io();

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function timeAgo(timestamp) {
  if (!timestamp) return "-";
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ================= DASHBOARD =================
const dashboardBody = document.getElementById("dashboard-body");
socket.on("status-update", data => {
  if (dashboardBody) {
    dashboardBody.innerHTML = "";

    let maxTime = 0;
    for (const username in data) if (data[username].activeSeconds > maxTime) maxTime = data[username].activeSeconds;
    if (maxTime === 0) maxTime = 1;

    for (const username in data) {
      const user = data[username];
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.innerText = username;

      const statusTd = document.createElement("td");
      statusTd.innerHTML = `<span class="status-badge ${user.active ? "status-active" : "status-inactive"}">
        ${user.active ? "Active" : "Inactive"}</span>`;

      const lastActiveTd = document.createElement("td");
      lastActiveTd.innerText = timeAgo(user.lastActive);

      const totalTimeTd = document.createElement("td");
      const container = document.createElement("div");
      container.className = "time-bar-container";
      const bar = document.createElement("div");
      bar.className = "time-bar";
      bar.style.width = `${Math.min(100, (user.activeSeconds / maxTime) * 100)}%`;
      bar.innerText = formatTime(user.activeSeconds);
      container.appendChild(bar);
      totalTimeTd.appendChild(container);

      const dailyLoginsTd = document.createElement("td");
      dailyLoginsTd.innerText = user.dailyLogins;

      tr.append(nameTd, statusTd, lastActiveTd, totalTimeTd, dailyLoginsTd);
      dashboardBody.appendChild(tr);
    }
  }

  // Update user page active count
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
