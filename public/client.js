const socket = io();

// Map slugs to names
const usersNames = {
  "384927": "Selmy",
  "590213": "Basmalah",
  "718405": "Eman",
  "062491": "Maya",
  "246801": "Rana",
  "975310": "Yara",
  "130579": "Youssef",
  "483020": "Newbie"
};

// Format seconds as hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// Dashboard rendering
socket.on("status-update", data => {
  const container = document.getElementById("dashboard-users");
  if (!container) return;
  container.innerHTML = "";

  for (const slug in data) {
    const user = data[slug];
    const status = user.active ? "Active" : "Inactive";
    const color = user.active ? "green" : "red";
    const last = user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : "Never";
    const totalTime = formatTime(user.activeSeconds);
    const sessions = user.activeSessions || 0;
    const name = usersNames[slug] || slug;

    container.innerHTML += `<div style="color:${color}">
      ${name} (${status}) - Last Active: ${last} - Total Time Today: ${totalTime} - Active Sessions: ${sessions}
    </div>`;
  }
});

// User page functions
function login() {
  const slug = document.getElementById("slug").value;
  const password = document.getElementById("password").value;
  socket.emit("login-user", { slug, password });
}

socket.on("login-result", data => {
  const loginResult = document.getElementById("login-result");
  const toggleBtn = document.getElementById("toggle-btn");
  const activeBtn = document.getElementById("active-btn");
  if (!loginResult || !toggleBtn || !activeBtn) return;

  if (data.success) {
    loginResult.innerText = `Welcome ${data.name}`;
    toggleBtn.disabled = false;
    activeBtn.disabled = false;
  } else {
    loginResult.innerText = `Login failed: ${data.msg}`;
  }
});

function toggleActive(state) {
  const slug = document.getElementById("slug").value;
  socket.emit("toggle-status", { slug, state });
}

// Heartbeat
setInterval(() => {
  const slugInput = document.getElementById("slug");
  if (slugInput) socket.emit("heartbeat", slugInput.value);
}, 1000);
