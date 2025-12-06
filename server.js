import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// =================== USERS CONFIG ===================
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

// =================== IN-MEMORY STATUS DATA ===================
const statusData = {};
Object.keys(users).forEach(slug => {
  statusData[slug] = {
    active: false,
    lastActive: null,
    lastUpdate: Date.now(),
    activeSeconds: 0,
    dailyLogins: 0
  };
});

// =================== ROUTES ===================
app.use(express.static("public"));

// Dashboard
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/dashboard.html");
});
app.get("/dashboard", (req, res) => {
  res.sendFile(process.cwd() + "/public/dashboard.html");
});

// User page
app.get("/u/:slug", (req, res) => {
  res.sendFile(process.cwd() + "/public/user.html");
});

// =================== SOCKET.IO ===================
io.on("connection", socket => {
  // Send current status data immediately
  socket.emit("status-update", statusData);

  // Handle login
  socket.on("login-user", ({ slug, password }) => {
    if (!users[slug]) return socket.emit("login-result", { success: false, msg: "Invalid URL" });
    if (users[slug].password !== password) return socket.emit("login-result", { success: false, msg: "Wrong password" });

    statusData[slug].dailyLogins++;
    statusData[slug].lastUpdate = Date.now();
    socket.emit("login-result", { success: true, name: users[slug].name, status: statusData[slug] });

    io.emit("status-update", statusData);
  });

  // Handle toggle status
  socket.on("toggle-status", ({ slug, state }) => {
    if (!statusData[slug]) return;
    statusData[slug].active = state;
    statusData[slug].lastUpdate = Date.now();
    if (state) statusData[slug].lastActive = Date.now();
    io.emit("status-update", statusData);
  });

  // Heartbeat for active time
  socket.on("heartbeat", slug => {
    if (!statusData[slug]) return;
    if (statusData[slug].active) {
      statusData[slug].activeSeconds += 1;
      statusData[slug].lastActive = Date.now();
      io.emit("status-update", statusData);
    }
  });
});

// =================== SERVER PORT ===================
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
