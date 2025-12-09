// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// ===== MIDDLEWARE GLOBAL =====
app.use(cors());
app.use(express.json()); // supaya bisa baca body JSON

// ===== STATIC FILES UNTUK UPLOAD =====
const uploadDir = path.join(__dirname, "uploads", "avatars");
fs.mkdirSync(uploadDir, { recursive: true });

// file di folder /uploads bisa diakses via http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MULTER STORAGE UNTUK AVATAR =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + "-" + uniqueSuffix + ext);
  },
});

const uploadAvatar = multer({ storage });

// ===== HELPER: Buat JWT Token =====
function generateToken(user) {
  return jwt.sign(
    { userId: user.id }, // payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// ===== MIDDLEWARE: Auth (cek Bearer token) =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ===== ROUTE TES =====
app.get("/", (req, res) => {
  res.json({ message: "HeArt API backend is running" });
});

// ===== REGISTER (POST /api/auth/register) =====
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  // sekarang cuma wajib email + password
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email dan password wajib diisi" });
  }

  try {
    // Cek apakah email sudah ada
    const existingUser = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user baru, kolom lain biarkan NULL dulu
    const result = await pool.query(
      `INSERT INTO public.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, full_name, nickname, whatsapp_number, avatar_url, created_at, updated_at`,
      [email, password_hash]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registrasi berhasil",
      user,
      token,
    });
  } catch (err) {
    console.error("Error register:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== LOGIN (POST /api/auth/login) =====
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email dan password wajib diisi" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM public.users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const user = result.rows[0];

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = generateToken(user);

    // Jangan kirim password_hash
    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      nickname: user.nickname,
      whatsapp_number: user.whatsapp_number,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.json({
      message: "Login berhasil",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("Error login:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== GET PROFILE (GET /api/profile) =====
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, email, full_name, nickname, whatsapp_number, avatar_url, created_at, updated_at
       FROM public.users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error get profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== UPDATE PROFILE (PUT /api/profile) =====
app.put("/api/profile", authMiddleware, async (req, res) => {
  const { full_name, nickname, whatsapp_number } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: "full_name wajib diisi" });
  }

  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE public.users
       SET full_name = $1,
           nickname = $2,
           whatsapp_number = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, nickname, whatsapp_number, avatar_url, created_at, updated_at`,
      [full_name, nickname, whatsapp_number, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({
      message: "Profile berhasil diupdate",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error update profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== UPLOAD FOTO PROFIL (POST /api/profile/avatar) =====
app.post(
  "/api/profile/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"), // field name harus "avatar"
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "File avatar tidak ditemukan." });
      }

      const userId = req.user.userId;

      // URL tempat file bisa diakses
      const avatarUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/avatars/${req.file.filename}`;

      // Simpan URL di DB
      const result = await pool.query(
        `UPDATE public.users
         SET avatar_url = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, full_name, nickname, whatsapp_number, avatar_url, created_at, updated_at`,
        [avatarUrl, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan." });
      }

      return res.json({
        message: "Foto profil berhasil diupdate.",
        avatar_url: avatarUrl,
        user: result.rows[0],
      });
    } catch (err) {
      console.error("Error upload avatar:", err);
      return res
        .status(500)
        .json({ message: "Server error saat upload avatar." });
    }
  }
);

// ===== DEBUG: LIHAT TABEL DI DB =====
app.get("/debug/db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT current_database() as db, table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Debug DB error:", err);
    res.status(500).json({ message: "Debug DB error" });
  }
});

// ===== JALANKAN SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
