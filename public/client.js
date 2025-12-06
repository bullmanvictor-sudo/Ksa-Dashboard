const socket = io();

// ---------------- HELPERS ----------------
function secondsToHMS(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// ---------------- DASHBOARD LOGIC ----------------
if (document.getElementById("dashboard-table")) {
  const tableBody = document.getElementById("dashboard-body");
  const totalActive = document.getElementById("total-active");

  socket.on("status-update", data => {
    tableBody.innerHTML = "";
    let activeCount = 0;

    for (const id in data) {
      const user = data[id];
      if (user.active) activeCount++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.name}</td>
        <td style="color:${user.active ? "green" : "red"}">${user.active ? "Active" : "Inactive"}</td>
        <td>${user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : "-"}</td>
        <td>${secondsToHMS(user.activeSeconds)}</td>
        <td>${user.dailyLogins}</td>
      `;
      tableBody.appendChild(tr);
    }

    totalActive.innerText = activeCount;
  });
}

// ---------------- USER LOGIC ----------------
if (document.getElementById("user-page")) {
  const slugInput = document.getElementById("slug");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const toggleBtn = document.getElementById("toggle-btn");
  const loginForm = document.getElementById("login-form");
  const activeCountDiv = document.getElementById("active-count");
  const welcomeDiv = document.getElementById("welcome");

  // Extract ID from URL
  const pathParts = window.location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  slugInput.value = id;

  // LOGIN
  loginBtn.addEventListener("click", () => {
    socket.emit("login-user", { id, password: passwordInput.value });
  });

  socket.on("login-result", data => {
    if (data.success) {
      loginForm.style.display = "none";
      welcomeDiv.innerText = `Welcome ${data.name}`;
      toggleBtn.disabled = false;
      toggleBtn.style.backgroundColor = data.active ? "green" : "red";
      toggleBtn.innerText = data.active ? "Active" : "Inactive";
    } else {
      welcomeDiv.innerText = `Login failed: ${data.msg}`;
    }
  });

  // TOGGLE ACTIVE/INACTIVE
  toggleBtn.addEventListener("click", () => {
    const newState = toggleBtn.innerText === "Inactive";
    socket.emit("toggle-status", { id, state: newState });
    toggleBtn.style.backgroundColor = newState ? "green" : "red";
    toggleBtn.innerText = newState ? "Active" : "Inactive";
  });

  // UPDATE OTHER ACTIVE USERS COUNT
  socket.on("status-update", data => {
    let activeCount = 0;
    for (const key in data) {
      if (key !== id && data[key].active) activeCount++;
    }
    activeCountDiv.innerText = `Other active users: ${activeCount}`;
  });

  // HEARTBEAT every 5 seconds
  setInterval(() => {
    socket.emit("heartbeat", id);
  }, 5000);
}
