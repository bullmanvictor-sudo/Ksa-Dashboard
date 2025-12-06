const socket = io();

// User slug → name mapping
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

// Format seconds as hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// =================== DASHBOARD ===================
socket.on("status-update", data => {
  // Dashboard rendering
  const dashboardContainer = document.getElementById("dashboard-users");
  if (dashboardContainer) {
    dashboardContainer.innerHTML = "";
    for (const slug in data) {
      const user = data[slug];
      const name = usersNames[slug] || slug;
      const status = user.active ? "Active" : "Inactive";
      const color = user.active ? "green" : "red";
      const lastActive = user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : "Never";
      const totalTime = formatTime(user.activeSeconds);
      const sessions = user.activeSessions || 0;

      dashboardContainer.innerHTML += `<div style="color:${color}; margin-bottom:5px;">
        ${name} (${status}) - Last Active: ${lastActive} - Total Time: ${totalTime} - Active Sessions: ${sessions}
      </div>`;
    }
  }

  // =================== USER PAGE ACTIVE USERS ===================
  const slugInput = document.getElementById("slug");
  const activeCountContainer = document.getElementById("active-count");
  if (slugInput && activeCountContainer) {
    const mySlug = slugInput.value;
    let activeUsers = 0;
    for (const slug in data) {
      if (data[slug].active) activeUsers++;
    }
    if (mySlug && data[mySlug]?.active) activeUsers--; // exclude self
    activeCountContainer.innerText = `Other active users: ${activeUsers}`;
  }
});

// =================== USER PAGE LOGIN ===================
function login() {
  const slug = document.getElementById("slug").value;
  const password = document.getElementById("password").value;
  socket.emit("login-user", { slug, password });
}

socket.on("login-result", data => {
  const loginResult = document.getElementById("login-result");
  const loginForm = document.getElementById("login-form");
  const toggleBtn = document.getElementById("toggle-btn");

  if (!loginResult || !loginForm || !toggleBtn) return;

  if (data.success) {
    loginResult.innerText = `Welcome ${data.name}`;
    loginForm.style.display = "none";        // Hide login form
    toggleBtn.disabled = false;              // Enable toggle button
    toggleBtn.style.backgroundColor = "red"; // Start as inactive
    toggleBtn.innerText = "Inactive";
  } else {
    loginResult.innerText = `Login failed: ${data.msg}`;
  }
});

// =================== USER PAGE TOGGLE ===================
function toggleActive() {
  const slugInput = document.getElementById("slug");
  const toggleBtn = document.getElementById("toggle-btn");
  if (!slugInput || !toggleBtn) return;

  const newState = toggleBtn.innerText === "Inactive";
  socket.emit("toggle-status", { slug: slugInput.value, state: newState });

  if (newState) {
    toggleBtn.innerText = "Active";
    toggleBtn.style.backgroundColor = "green";
  } else {
    toggleBtn.innerText = "Inactive";
    toggleBtn.style.backgroundColor = "red";
  }
}

// =================== HEARTBEAT ===================
setInterval(() => {
  const slugInput = document.getElementById("slug");
  if (slugInput && slugInput.value) {
    socket.emit("heartbeat", slugInput.value);
  }
}, 1000);
