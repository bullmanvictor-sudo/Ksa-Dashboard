import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));

// ---------------- USERS CONFIG ----------------
const users = {
  "384927": { name: "Selmy", password: "P$8rVq2xL!a" },
  "590213": { name: "Basmalah", password: "u9F&3bK#tQ1" },
  "718405": { name: "Eman", password: "Zp7@vR5mS2y" },
  "062491": { name: "Maya", password: "xE4$k9N!pT8" },
  "246801": { name: "Rana", password: "M#6tQ2zY7uV" },
  "975310": { name: "Yara", password: "s8W&1pL#cF4" },
  "130579": { name: "Youssef", password: "B2!rN7qH$k9" },
  "483020": { name: "newbie", password: "g6Z#x3T&pL0" }
};

// ---------------- IN-MEMORY STATUS ----------------
const statusData = {};
Object.keys(users).forEach(id => {
  statusData[id] = {
    name: users[id].name,
    active: false,
    lastActive: null,
    lastUpdate: null,
    activeSeconds: 0,
    dailyLogins: 0
  };
});

// ---------------- ROUTES ----------------
app.get("/u/:id", (req, res) => res.sendFile(process.cwd() + "/public/user.html"));
app.get("/dashboard", (req, res) => res.sendFile(process.cwd() + "/public/dashboard.html"));

// ---------------- SOCKET.IO ----------------
io.on("connection", socket => {
  socket.emit("status-update", statusData);

  // LOGIN
  socket.on("login-user", ({ id, password }) => {
    if (!users[id]) return socket.emit("login-result", { success: false, msg: "Invalid user ID" });
    if (users[id].password !== password) return socket.emit("login-result", { success: false, msg: "Wrong password" });

    statusData[id].dailyLogins++;
    statusData[id].lastUpdate = Date.now();
    socket.emit("login-result", { success: true, name: users[id].name });
    io.emit("status-update", statusData);
  });

  // TOGGLE ACTIVE/INACTIVE
  socket.on("toggle-status", ({ id, state }) => {
    if (!statusData[id]) return;
    statusData[id].active = state;
    statusData[id].lastUpdate = Date.now();
    if (state) statusData[id].lastActive = Date.now();
    io.emit("status-update", statusData);
  });

  // HEARTBEAT every 5 seconds
  socket.on("heartbeat", id => {
    if (!statusData[id]) return;
    if (statusData[id].active) statusData[id].activeSeconds += 5;
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => console.log("Server running on port", PORT));
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});

