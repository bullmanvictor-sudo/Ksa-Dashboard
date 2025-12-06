const socket = io();
const path = window.location.pathname;

// Format seconds to H M S
function fmtSeconds(s) {
  if (!s && s !== 0) return "—";
  s = Number(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return (h ? h + "h " : "") + (m ? m + "m " : "") + sec + "s";
}

function fmtTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

// USER PAGE
if (path.startsWith("/u/")) {
  const slug = path.split("/")[2];

  const loginBtn = document.getElementById("loginBtn");
  const pass = document.getElementById("pass");
  const panel = document.getElementById("panel");
  const toggleBtn = document.getElementById("toggleBtn");
  const statusText = document.getElementById("statusText");
  const username = document.getElementById("username");
  const activeTimeSpan = document.getElementById("activeTime");
  const lastActiveSpan = document.getElementById("lastActive");

  let isActive = false;

  loginBtn.onclick = () => {
    socket.emit("login-user", { slug, password: pass.value });
  };

  socket.on("login-result", data => {
    if (!data.success) {
      alert(data.msg);
      return;
    }
    username.textContent = data.name;
    document.getElementById("loginPanel").style.display = "none";
    panel.style.display = "block";
  });

  toggleBtn.onclick = () => {
    const newState = statusText.textContent === "Inactive";
    socket.emit("toggle-status", { slug, state: newState });
    isActive = newState;
    statusText.textContent = newState ? "Active" : "Inactive";
    toggleBtn.textContent = newState ? "Go Inactive" : "Go Active";
  };

  setInterval(() => {
    socket.emit("heartbeat", slug);
  }, 1000);

  socket.on("status-update", data => {
    const u = data[slug];
    if (!u) return;
    statusText.textContent = u.active ? "Active" : "Inactive";
    toggleBtn.textContent = u.active ? "Go Inactive" : "Go Active";
    activeTimeSpan.textContent = fmtSeconds(u.activeSeconds);
    lastActiveSpan.textContent = u.lastActive ? fmtTime(u.lastActive) : "—";
  });
}

// DASHBOARD PAGE
if (path === "/dashboard") {
  const usersDiv = document.getElementById("users");
