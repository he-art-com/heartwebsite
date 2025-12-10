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
const avatarDir = path.join(__dirname, "uploads", "avatars");
const artworksDir = path.join(__dirname, "uploads", "artworks");

fs.mkdirSync(avatarDir, { recursive: true });
fs.mkdirSync(artworksDir, { recursive: true });

// semua file di /uploads bisa diakses lewat http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MULTER STORAGE UNTUK AVATAR =====
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + "-" + uniqueSuffix + ext);
  },
});

const uploadAvatar = multer({ storage: avatarStorage });

// ===== MULTER STORAGE UNTUK ARTWORK GALLERY =====
const artworkStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, artworksDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + "-" + uniqueSuffix + ext);
  },
});

const uploadArtwork = multer({ storage: artworkStorage });

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

// ===================================================================
// ========================= AUTH ====================================
// ===================================================================

// ===== REGISTER (POST /api/auth/register) =====
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email dan password wajib diisi" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

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

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = generateToken(user);

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

// ===================================================================
// ========================= PROFILE =================================
// ===================================================================

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

      const avatarUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/avatars/${req.file.filename}`;

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

// ===================================================================
// ========================= GALLERY ARTWORKS ========================
// ===================================================================

/**
 * TABEL artworks (yang dipakai di sini):
 * id SERIAL PRIMARY KEY,
 * user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
 * title VARCHAR(255) NOT NULL,
 * description TEXT,
 * style VARCHAR(50),
 * image_url TEXT NOT NULL,
 * status VARCHAR(20) NOT NULL DEFAULT 'active',
 * created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 * updated_at TIMESTAMPTZ DEFAULT NOW()
 */

// ===== UPLOAD KARYA GALLERY (POST /api/artworks) =====
app.post(
  "/api/artworks",
  authMiddleware,
  uploadArtwork.single("image"), // form field "image"
  async (req, res) => {
    try {
      const userId = Number(req.user.userId);
      const { title, description, style, mode } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Judul karya wajib diisi." });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "File gambar karya wajib diunggah." });
      }

      const finalStyle = style && style.trim() ? style.trim() : "Others";

      const imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/artworks/${req.file.filename}`;

      const result = await pool.query(
        `INSERT INTO public.artworks (user_id, title, description, style, image_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, title, description, style, image_url, status, created_at, updated_at`,
        [userId, title.trim(), description || null, finalStyle, imageUrl]
      );

      const artwork = result.rows[0];

      return res.status(201).json({
        message:
          mode === "for_sale"
            ? "Karya berhasil disimpan (mode for_sale akan di-handle di tabel lain nanti)."
            : "Karya berhasil di-upload ke Gallery.",
        artwork,
      });
    } catch (err) {
      console.error("Error upload artwork:", err);
      return res
        .status(500)
        .json({ message: "Server error saat upload karya." });
    }
  }
);

// ===== GET SEMUA ARTWORKS GALLERY (GET /api/artworks?style=Realistic) =====
app.get("/api/artworks", async (req, res) => {
  try {
    const { style } = req.query;

    let baseQuery = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.style,
        a.image_url,
        a.created_at,
        a.user_id,
        u.nickname,
        u.full_name
      FROM public.artworks a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.status = 'active'
    `;
    const params = [];

    if (style && style !== "All styles") {
      params.push(style);
      baseQuery += ` AND a.style = $${params.length}`;
    }

    baseQuery += " ORDER BY a.created_at DESC";

    const result = await pool.query(baseQuery, params);

    return res.json({
      count: result.rows.length,
      artworks: result.rows,
    });
  } catch (err) {
    console.error("Error get artworks:", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil karya." });
  }
});

// ===== GET ARTWORKS MILIK USER (GET /api/my-artworks) =====
app.get("/api/my-artworks", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const result = await pool.query(
      `
      SELECT 
        id,
        title,
        description,
        style,
        image_url,
        status,
        created_at,
        updated_at
      FROM public.artworks
      WHERE user_id = $1
        AND status = 'active'
      ORDER BY created_at DESC
    `,
      [userId]
    );

    return res.json({
      count: result.rows.length,
      artworks: result.rows,
    });
  } catch (err) {
    console.error("Error get my artworks:", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil karya user." });
  }
});

// (opsional) alias: GET /api/artworks/me
app.get("/api/artworks/me", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const result = await pool.query(
      `
      SELECT 
        id,
        title,
        description,
        style,
        image_url,
        status,
        created_at,
        updated_at
      FROM public.artworks
      WHERE user_id = $1
        AND status = 'active'
      ORDER BY created_at DESC
    `,
      [userId]
    );

    return res.json({
      count: result.rows.length,
      artworks: result.rows,
    });
  } catch (err) {
    console.error("Error get my artworks (alias):", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil karya user." });
  }
});

// ===== UPDATE ARTWORK GALLERY (PUT /api/artworks/:id) =====
app.put("/api/artworks/:id", authMiddleware, async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = Number(req.user.userId);
    const { title, description, style } = req.body;

    const check = await pool.query(
      "SELECT user_id FROM public.artworks WHERE id = $1",
      [artworkId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Karya tidak ditemukan." });
    }

    const ownerId = Number(check.rows[0].user_id);

    if (ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Kamu tidak punya akses untuk mengubah karya ini." });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Judul karya wajib diisi." });
    }

    const finalStyle = style && style.trim() ? style.trim() : "Others";

    const result = await pool.query(
      `
      UPDATE public.artworks
      SET title = $1,
          description = $2,
          style = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, user_id, title, description, style, image_url, status, created_at, updated_at
    `,
      [title.trim(), description || null, finalStyle, artworkId]
    );

    return res.json({
      message: "Karya berhasil diperbarui.",
      artwork: result.rows[0],
    });
  } catch (err) {
    console.error("Error update artwork:", err);
    return res
      .status(500)
      .json({ message: "Server error saat update karya." });
  }
});

// ===== DELETE (SOFT DELETE) ARTWORK GALLERY (DELETE /api/artworks/:id) =====
app.delete("/api/artworks/:id", authMiddleware, async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = Number(req.user.userId);

    const check = await pool.query(
      "SELECT user_id FROM public.artworks WHERE id = $1",
      [artworkId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Karya tidak ditemukan." });
    }

    const ownerId = Number(check.rows[0].user_id);

    if (ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Kamu tidak punya akses untuk menghapus karya ini." });
    }

    await pool.query(
      `
      UPDATE public.artworks
      SET status = 'deleted',
          updated_at = NOW()
      WHERE id = $1
    `,
      [artworkId]
    );

    return res.json({ message: "Karya berhasil dihapus (soft delete)." });
  } catch (err) {
    console.error("Error delete artwork:", err);
    return res
      .status(500)
      .json({ message: "Server error saat menghapus karya." });
  }
});
// ===== DOWNLOAD FILE ARTWORK (GET /api/artworks/:id/download) =====
app.get("/api/artworks/:id/download", async (req, res) => {
  try {
    const artworkId = req.params.id;

    const result = await pool.query(
      `
      SELECT image_url, title
      FROM public.artworks
      WHERE id = $1 AND status = 'active'
    `,
      [artworkId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Karya tidak ditemukan." });
    }

    const artwork = result.rows[0];

    if (!artwork.image_url) {
      return res
        .status(400)
        .json({ message: "Karya ini tidak memiliki image_url." });
    }

    // Ubah URL (misal: http://localhost:5000/uploads/artworks/xxx.png)
    // menjadi path file di server
    let filePath;
    try {
      const fileUrl = new URL(artwork.image_url);
      const relativePath = fileUrl.pathname.replace(/^\/+/, ""); // "uploads/..."
      filePath = path.join(__dirname, relativePath);
    } catch (e) {
      // kalau ternyata image_url sudah relatif (mis: "uploads/artworks/xxx.png")
      filePath = path.join(__dirname, artwork.image_url);
    }

    const safeTitle =
      (artwork.title || "artwork").replace(/[^\w\d-_]+/g, "_") || "artwork";
    const fileName = safeTitle + path.extname(filePath);

    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error download artwork:", err);
        if (!res.headersSent) {
          return res
            .status(500)
            .json({ message: "Gagal mendownload file karya." });
        }
      }
    });
  } catch (err) {
    console.error("Error route download:", err);
    return res
      .status(500)
      .json({ message: "Server error saat download karya." });
  }
});


// ===================================================================
// ========================= DEBUG / UTIL ============================
// ===================================================================

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
