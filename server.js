// ============================================
// server.js — AuraVault Backend
// Created by: Aishwarya M C
// ============================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "db.json");

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve HTML files

// ── HELPER: Read database ──
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [
        {
          id: 1,
          first: "Aishwarya",
          last: "M C",
          email: "aishwarya.mc@gmail.com",
          role: "admin",
          status: "online",
          dept: "Development",
          bio: "Full stack developer and creator of AuraVault.",
          color: "#c4607a",
          score: 98,
          joined: "2024-01-15",
        },
        {
          id: 2,
          first: "Priya",
          last: "Sharma",
          email: "priya.sharma@example.com",
          role: "editor",
          status: "online",
          dept: "Design",
          bio: "UI/UX designer creating beautiful experiences.",
          color: "#c49a4a",
          score: 85,
          joined: "2024-02-20",
        },
        {
          id: 3,
          first: "Rahul",
          last: "Verma",
          email: "rahul.verma@example.com",
          role: "viewer",
          status: "away",
          dept: "Marketing",
          bio: "Digital marketing specialist.",
          color: "#6b8c7a",
          score: 72,
          joined: "2024-03-10",
        },
      ],
      nextId: 4,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

// ── HELPER: Write database ──
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// API ROUTES
// ============================================

// GET all users
app.get("/api/users", (req, res) => {
  const db = readDB();
  res.json({ success: true, users: db.users, total: db.users.length });
});

// GET single user by ID
app.get("/api/users/:id", (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === parseInt(req.params.id));
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

// POST create new user
app.post("/api/users", (req, res) => {
  const db = readDB();
  const { first, last, email, role, status, dept, bio, color } = req.body;

  // Basic validation
  if (!first || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });
  }

  // Check duplicate email
  const exists = db.users.find((u) => u.email === email);
  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  const newUser = {
    id: db.nextId++,
    first: first.trim(),
    last: (last || "").trim(),
    email: email.trim(),
    role: role || "user",
    status: status || "offline",
    dept: dept || "",
    bio: bio || "",
    color: color || "#c4607a",
    score: Math.floor(Math.random() * 30 + 65),
    joined: new Date().toISOString().split("T")[0],
  };

  db.users.push(newUser);
  writeDB(db);

  res
    .status(201)
    .json({
      success: true,
      user: newUser,
      message: "User created successfully",
    });
});

// PUT update user
app.put("/api/users/:id", (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { first, last, email, role, status, dept, bio, color } = req.body;
  db.users[idx] = {
    ...db.users[idx],
    first: first || db.users[idx].first,
    last: last !== undefined ? last : db.users[idx].last,
    email: email || db.users[idx].email,
    role: role || db.users[idx].role,
    status: status || db.users[idx].status,
    dept: dept !== undefined ? dept : db.users[idx].dept,
    bio: bio !== undefined ? bio : db.users[idx].bio,
    color: color || db.users[idx].color,
  };

  writeDB(db);
  res.json({
    success: true,
    user: db.users[idx],
    message: "User updated successfully",
  });
});

// DELETE user
app.delete("/api/users/:id", (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const deleted = db.users.splice(idx, 1)[0];
  writeDB(db);

  res.json({
    success: true,
    message: `User ${deleted.first} deleted successfully`,
  });
});

// GET stats
app.get("/api/stats", (req, res) => {
  const db = readDB();
  const users = db.users;
  res.json({
    success: true,
    stats: {
      total: users.length,
      online: users.filter((u) => u.status === "online").length,
      admins: users.filter((u) => u.role === "admin").length,
      editors: users.filter((u) => u.role === "editor").length,
      viewers: users.filter((u) => u.role === "viewer").length,
    },
  });
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log("");
  console.log("  ✦ AuraVault Server Started!");
  console.log("  ✦ Created by: Aishwarya M C");
  console.log(`  ✦ Open browser: http://localhost:${PORT}`);
  console.log("");
});
