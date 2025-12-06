const socket = io();

socket.on("status-update", data => {
  if (document.getElementById("dashboard-users")) {
    const container = document.getElementById("dashboard-users");
    container.innerHTML = "";
    for (const slug in data) {
      const user = data[slug];
      const status = user.active ? "Active" : "Inactive";
      const color = user.active ? "green" : "red";
      const last = user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : "Never";
      container.innerHTML += `<div style="color:${color}">${slug} (${status}) - Last Active: ${last}</div>`;
    }
  }
});

function loginUser(slug, password) {
  socket.emit("login-user", { slug, password });
}

function toggleStatus(slug, state) {
  socket.emit("toggle-status", { slug, state });
}

setInterval(() => {
  // send heartbeat if user page
  const slugInput = document.getElementById("slug");
  if (slugInput) {
    const slug = slugInput.value;
    socket.emit("heartbeat", slug);
  }
}, 1000);
