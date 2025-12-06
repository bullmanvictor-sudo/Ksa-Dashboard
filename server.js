import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));

// ================= USERS =================
const users = {
  "selmy": { password: "P$8rVq2xL!a" },
  "basmalah": { password: "u9F&3bK#tQ1" },
  "eman": { password: "Zp7@vR5mS2y" },
  "maya": { password: "xE4$k9N!pT8" },
  "rana": { password: "M#6tQ2zY7uV" },
  "yara": { password: "s8W&1pL#cF4" },
  "youssef": { password: "B2!rN7qH$k9" },
  "newbie": { password: "g6Z#x3T&pL0" }
};

// ================= STATUS DATA =================
const statusData = {};
Object.keys(users).forEach(username => {
  statusData[username] = {
    active: false,
    lastActive: null,
    activeSeconds: 0,
    dailyLogins: 0
  };
});

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/dashboard.html");
});

app.get("/dashboard", (req, res) => {
  res.sendFile(process.cwd() + "/public/dashboard.html");
});

app.get("/u/:username", (req, res) => {
  const username = req.params.username;
  if (!users[username]) return res.status(404).send("User not found");
  res.sendFile(process.cwd() + "/public/user.html");
});

// ================= SOCKET.IO =================
io.on("connection", socket => {

  // Send current status on connection
  socket.emit("status-update", statusData);

  // Handle login
  socket.on("login-user", ({ username, password }) => {
    if (!users[username]) return socket.emit("login-result", { success: false, msg: "Invalid username" });
    if (users[username].password !== password) return socket.emit("login-result", { success: false, msg: "Wrong password" });

    // Login successful
    statusData[username].dailyLogins++;
    socket.emit("login-result", { success: true, username, status: statusData[username] });

    // Broadcast updated status
    io.emit("status-update", statusData);
  });

  // Toggle active/inactive
  socket.on("toggle-status", ({ username, state }) => {
    if (!statusData[username]) return;
    statusData[username].active = state;
    if (state) statusData[username].lastActive = Date.now();
    io.emit("status-update", statusData);
  });

  // Heartbeat for active time
  socket.on("heartbeat", username => {
    if (!statusData[username]) return;
    if (statusData[username].active) {
      statusData[username].activeSeconds++;
      statusData[username].lastActive = Date.now();
      io.emit("status-update", statusData);
    }
  });
});

// ================= SERVER PORT =================
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => console.log("Server running on port", PORT));
