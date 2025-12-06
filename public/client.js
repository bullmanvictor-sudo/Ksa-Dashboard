const socket = io();

// Slug → Name mapping
const usersNames = {
  "384927": "Selmy",
  "590213": "Basmalah",
  "718405": "Eman",
  "062491": "Maya",
  "246801": "Rana",
  "975310": "Yara",
  "130579": "Youssef",
  "483020": "newbie"
};

// Format seconds to hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// =================== DASHBOARD ===================
const dashboardBody = document.getElementById("dashboard-body");
socket.on("status-update", data => {
  // Update dashboard if it exists
  if (dashboardBody) {
    dashboardBody.innerHTML = "";
    for (const slug in data) {
      const user = data[slug];
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.innerText = usersNames[slug] || slug;

      const statusTd = document.createElement("td");
      statusTd.innerHTML = user.active ? '<span class="active">Active</span>' : '<span class="inactive">Inactive</span>';

      const lastActiveTd = document.createElement("td");
      lastActiveTd.innerText = user.active ? new Date(user.lastActive).toLocaleTimeString() : lastActiveTd.innerText || "-";

      const totalTimeTd = document.createElement("td");
      totalTimeTd.innerText = formatTime(user.activeSeconds || 0);

      const dailyLoginsTd = document.createElement("td");
      dailyLoginsTd.innerText = user.dailyLogins || 0;

      tr.appendChild(nameTd);
      tr.appendChild(statusTd);
      tr.appendChild(lastActiveTd);
      tr.appendChild(totalTimeTd);
      tr.appendChild(dailyLoginsTd);

      dashboardBody.appendChild(tr);
    }
  }

  // Update user page other active users
  const slugInput = document.getElementById("slug");
  const activeCount = document.getElementById("active-count");
  if (slugInput && activeCount) {
    const mySlug = slugInput.value;
    let activeUsers = 0;
    for (const slug in data) if (data[slug].active) activeUsers++;
    if (mySlug && data[mySlug]?.active) activeUsers--;
    activeCount.innerText = `Other active users: ${activeUsers}`;
  }
});

// =================== USER LOGIN ===================
const loginForm = document.getElementById("login-form");
const toggleBtn = document.getElementById("toggle-btn");
const loginResult = document.getElementById("login-result");
const slugInput = document.getElementById("slug");
const passwordInput = document.getElementById("password");

function login() {
  const slug = slugInput.value.trim();
  const password = passwordInput.value;
  if (!slug || !password) return;
  socket.emit("login-user", { slug, password });
}

socket.on("login-result", data => {
  if (!loginResult) return;
  if (data.success) {
    loginResult.innerText = `Welcome ${data.name}`;
    if (loginForm) loginForm.style.display = "none";
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.innerText = data.status?.active ? "Active" : "Inactive";
      toggleBtn.style.backgroundColor = data.status?.active ? "green" : "red";
    }
  } else {
    loginResult.innerText = `Login failed: ${data.msg}`;
  }
});

// =================== TOGGLE ACTIVE ===================
function toggleActive() {
  if (!toggleBtn || !slugInput) return;
  const newState = toggleBtn.innerText === "Inactive";
  socket.emit("toggle-status", { slug: slugInput.value, state: newState });

  toggleBtn.innerText = newState ? "Active" : "Inactive";
  toggleBtn.style.backgroundColor = newState ? "green" : "red";
}

// =================== HEARTBEAT ===================
setInterval(() => {
  if (slugInput && slugInput.value) socket.emit("heartbeat", slugInput.value);
}, 1000);
