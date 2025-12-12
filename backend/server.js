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
app.use(express.json()); // untuk body JSON

// ===== STATIC FILES UNTUK UPLOAD =====
const avatarDir = path.join(__dirname, "uploads", "avatars");
const artworksDir = path.join(__dirname, "uploads", "artworks");

// catatan:
// - eventsDir: untuk endpoint upload poster single (/api/admin/events/upload-poster)
// - eventPosterDir: untuk poster event saat create/update event (/api/admin/events)
// - qrisDir: untuk qris
// - othersDir: untuk file lain (organizer_logo, dll)
const eventsDir = path.join(__dirname, "uploads", "events");
const eventPosterDir = path.join(__dirname, "uploads", "event_posters");
const qrisDir = path.join(__dirname, "uploads", "qris");
const othersDir = path.join(__dirname, "uploads", "others");

// pastikan semua folder ada
fs.mkdirSync(avatarDir, { recursive: true });
fs.mkdirSync(artworksDir, { recursive: true });
fs.mkdirSync(eventsDir, { recursive: true });
fs.mkdirSync(eventPosterDir, { recursive: true });
fs.mkdirSync(qrisDir, { recursive: true });
fs.mkdirSync(othersDir, { recursive: true });

// semua file di /uploads bisa diakses lewat http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===================================================================
// ========================= MULTER CONFIG ===========================
// ===================================================================

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

// ===== MULTER STORAGE UNTUK ARTWORK (GALLERY + FOR SALE) =====
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

// ===== MULTER STORAGE UNTUK POSTER EVENT (SINGLE UPLOAD ENDPOINT) =====
const eventPosterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, eventsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + "-" + uniqueSuffix + ext);
  },
});
const uploadEventPoster = multer({ storage: eventPosterStorage });

// ===== MULTER STORAGE UNTUK EVENT (POSTER + QRIS + OTHERS) =====
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "poster") {
      cb(null, eventPosterDir);
    } else if (file.fieldname === "qris") {
      cb(null, qrisDir);
    } else {
      cb(null, othersDir);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + "-" + uniqueSuffix + ext);
  },
});
const uploadEventAssets = multer({ storage: eventStorage });

// ===================================================================
// ========================= AUTH HELPERS ============================
// ===================================================================

function generateToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

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

async function adminMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "SELECT role, is_banned FROM public.users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.is_banned) {
      return res
        .status(403)
        .json({ message: "Your account has been banned by admin." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only endpoint." });
    }

    next();
  } catch (err) {
    console.error("adminMiddleware error:", err);
    res.status(500).json({ message: "Server error (admin check)" });
  }
}

// helper aman untuk parse number
const toNumberOrNull = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

// ===================================================================
// ========================= ROUTE TES ===============================
// ===================================================================

app.get("/", (req, res) => {
  res.json({ message: "HeArt API backend is running" });
});

// ===================================================================
// ========================= AUTH ====================================
// ===================================================================

app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
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
       RETURNING id, email, full_name, nickname, whatsapp_number,
                 avatar_url, gender, birth_date, address, bio,
                 role, is_banned,
                 created_at, updated_at`,
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

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
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

    if (user.is_banned) {
      return res
        .status(403)
        .json({ message: "Akun kamu telah diblokir oleh admin." });
    }

    const token = generateToken(user);

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      nickname: user.nickname,
      whatsapp_number: user.whatsapp_number,
      avatar_url: user.avatar_url,
      gender: user.gender,
      birth_date: user.birth_date,
      address: user.address,
      bio: user.bio,
      role: user.role,
      is_banned: user.is_banned,
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

app.put("/api/auth/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Password lama dan baru wajib diisi." });
  }

  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT id, password_hash FROM public.users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Password saat ini salah." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE public.users
       SET password_hash = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [newHash, userId]
    );

    return res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("Error change password:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// ========================= PROFILE =================================
// ===================================================================

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id,
              email,
              full_name,
              nickname,
              whatsapp_number,
              avatar_url,
              gender,
              birth_date,
              address,
              bio,
              created_at,
              updated_at
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

app.put("/api/profile", authMiddleware, async (req, res) => {
  const {
    full_name,
    nickname,
    whatsapp_number,
    gender,
    birth_date,
    address,
    bio,
  } = req.body;

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
           gender = $4,
           birth_date = $5,
           address = $6,
           bio = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING id,
                 email,
                 full_name,
                 nickname,
                 whatsapp_number,
                 avatar_url,
                 gender,
                 birth_date,
                 address,
                 bio,
                 created_at,
                 updated_at`,
      [
        full_name,
        nickname || null,
        whatsapp_number || null,
        gender || null,
        birth_date || null,
        address || null,
        bio || null,
        userId,
      ]
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

app.post(
  "/api/profile/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
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
         RETURNING id,
                   email,
                   full_name,
                   nickname,
                   whatsapp_number,
                   avatar_url,
                   gender,
                   birth_date,
                   address,
                   bio,
                   created_at,
                   updated_at`,
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
// ========================= ARTWORKS (UPLOAD) =======================
// ===================================================================

// upload artwork: mode "gallery" atau "for_sale"
app.post(
  "/api/artworks",
  authMiddleware,
  uploadArtwork.single("image"),
  async (req, res) => {
    try {
      const userId = Number(req.user.userId);

      const {
        title,
        description,
        style,
        mode,
        price,
        category,
        height_cm,
        width_cm,
        frame_details,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Judul karya wajib diisi." });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "File gambar karya wajib diunggah." });
      }

      const finalStyle = style && style.trim() ? style.trim() : "Others";
      const finalMode =
        mode && String(mode).trim() ? String(mode).trim() : "gallery";

      // validasi minimal kalau mode = for_sale
      if (finalMode === "for_sale") {
        const p = toNumberOrNull(price);
        if (!p || p <= 0) {
          return res
            .status(400)
            .json({ message: "Harga wajib diisi untuk mode for_sale." });
        }
      }

      const imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/artworks/${req.file.filename}`;

      const result = await pool.query(
        `
        INSERT INTO public.artworks
          (user_id, title, description, style, image_url,
           mode, price, category, height_cm, width_cm, frame_details)
        VALUES
          ($1, $2, $3, $4, $5,
           $6, $7, $8, $9, $10, $11)
        RETURNING
          id, user_id, title, description, style, image_url,
          mode, price, category, height_cm, width_cm, frame_details,
          status, created_at, updated_at
        `,
        [
          userId,
          title.trim(),
          description || null,
          finalStyle,
          imageUrl,
          finalMode,
          toNumberOrNull(price),
          category || null,
          toNumberOrNull(height_cm),
          toNumberOrNull(width_cm),
          frame_details || null,
        ]
      );

      const artwork = result.rows[0];

      return res.status(201).json({
        message:
          finalMode === "for_sale"
            ? "Karya berhasil di-upload untuk dijual."
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

// ===================================================================
// ========================= GALLERY (PUBLIC) ========================
// ===================================================================

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
        AND (a.mode IS NULL OR a.mode = 'gallery')
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
        mode,
        price,
        category,
        height_cm,
        width_cm,
        frame_details,
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

// alias
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
        mode,
        price,
        category,
        height_cm,
        width_cm,
        frame_details,
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

// ===================================================================
// ========================= FOR SALE (PUBLIC) =======================
// ===================================================================

// list for sale + filter opsional (dipakai FE)
app.get("/api/for-sale", async (req, res) => {
  try {
    const {
      style,
      priceMin,
      priceMax,
      heightMin,
      heightMax,
      widthMin,
      widthMax,
    } = req.query;

    let q = `
      SELECT
        a.id,
        a.title,
        a.description,
        a.style,
        a.image_url,
        a.price,
        a.category,
        a.height_cm,
        a.width_cm,
        a.frame_details,
        a.created_at,
        u.id AS artist_id,
        COALESCE(u.full_name, u.nickname, u.email) AS artist_name
      FROM public.artworks a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.status = 'active'
        AND a.mode = 'for_sale'
    `;
    const params = [];

    // style
    if (style && style !== "All") {
      params.push(style);
      q += ` AND a.style = $${params.length}`;
    }

    // range filters
    const addMinMax = (col, minVal, maxVal) => {
      const minN = toNumberOrNull(minVal);
      const maxN = toNumberOrNull(maxVal);

      if (minN !== null) {
        params.push(minN);
        q += ` AND ${col} >= $${params.length}`;
      }
      if (maxN !== null) {
        params.push(maxN);
        q += ` AND ${col} <= $${params.length}`;
      }
    };

    addMinMax("a.price", priceMin, priceMax);
    addMinMax("a.height_cm", heightMin, heightMax);
    addMinMax("a.width_cm", widthMin, widthMax);

    q += " ORDER BY a.created_at DESC";

    const result = await pool.query(q, params);

    res.json({ count: result.rows.length, artworks: result.rows });
  } catch (err) {
    console.error("Error get for-sale:", err);
    res.status(500).json({ message: "Server error saat mengambil for sale." });
  }
});

// ✅ NEW: list for sale milik user login (dipakai ProfileSettings tab Sell)
app.get("/api/my-for-sale", authMiddleware, async (req, res) => {
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
        mode,
        price,
        category,
        height_cm,
        width_cm,
        frame_details,
        status,
        created_at,
        updated_at
      FROM public.artworks
      WHERE user_id = $1
        AND status = 'active'
        AND mode = 'for_sale'
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      count: result.rows.length,
      artworks: result.rows,
    });
  } catch (err) {
    console.error("Error get my for-sale:", err);
    return res.status(500).json({
      message: "Server error saat mengambil karya for sale milik user.",
    });
  }
});

// ✅ detail for sale (ditambah nomor WA artist supaya bisa open WhatsApp)
app.get("/api/for-sale/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid." });

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.style,
        a.image_url,
        a.price,
        a.category,
        a.height_cm,
        a.width_cm,
        a.frame_details,
        a.created_at,
        u.id AS artist_id,
        u.full_name,
        u.nickname,
        u.avatar_url,
        u.address,
        u.bio,
        u.whatsapp_number AS artist_whatsapp
      FROM public.artworks a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.id = $1
        AND a.status = 'active'
        AND a.mode = 'for_sale'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Artwork for sale tidak ditemukan." });
    }

    res.json({ artwork: result.rows[0] });
  } catch (err) {
    console.error("Error get for-sale detail:", err);
    res
      .status(500)
      .json({ message: "Server error saat mengambil detail for sale." });
  }
});

// ✅ NEW: update for sale milik user login
app.put("/api/for-sale/:id", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const artworkId = Number(req.params.id);
    if (!artworkId) return res.status(400).json({ message: "ID tidak valid." });

    const {
      title,
      description,
      style,
      price,
      category,
      height_cm,
      width_cm,
      frame_details,
    } = req.body;

    // pastikan karya milik user & mode for_sale
    const check = await pool.query(
      `SELECT id FROM public.artworks
       WHERE id = $1 AND user_id = $2 AND mode = 'for_sale' AND status = 'active'`,
      [artworkId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "Karya for sale tidak ditemukan / bukan milikmu.",
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Judul karya wajib diisi." });
    }

    const p = toNumberOrNull(price);
    if (!p || p <= 0) {
      return res.status(400).json({ message: "Harga wajib diisi." });
    }

    const finalStyle = style && String(style).trim() ? String(style).trim() : "Others";

    const updated = await pool.query(
      `
      UPDATE public.artworks
      SET
        title = $1,
        description = $2,
        style = $3,
        price = $4,
        category = $5,
        height_cm = $6,
        width_cm = $7,
        frame_details = $8,
        updated_at = NOW()
      WHERE id = $9 AND user_id = $10 AND mode = 'for_sale'
      RETURNING
        id, user_id, title, description, style, image_url,
        mode, price, category, height_cm, width_cm, frame_details,
        status, created_at, updated_at
      `,
      [
        String(title).trim(),
        description || null,
        finalStyle,
        p,
        category || null,
        toNumberOrNull(height_cm),
        toNumberOrNull(width_cm),
        frame_details || null,
        artworkId,
        userId,
      ]
    );

    return res.json({
      message: "Karya for sale berhasil diupdate.",
      artwork: updated.rows[0],
    });
  } catch (err) {
    console.error("Error update for-sale:", err);
    return res.status(500).json({
      message: "Server error saat update karya for sale.",
    });
  }
});

// ✅ NEW: delete (soft delete) for sale milik user login
app.delete("/api/for-sale/:id", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const artworkId = Number(req.params.id);
    if (!artworkId) return res.status(400).json({ message: "ID tidak valid." });

    const check = await pool.query(
      `SELECT id FROM public.artworks
       WHERE id = $1 AND user_id = $2 AND mode = 'for_sale' AND status = 'active'`,
      [artworkId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "Karya for sale tidak ditemukan / bukan milikmu.",
      });
    }

    await pool.query(
      `
      UPDATE public.artworks
      SET status = 'deleted',
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND mode = 'for_sale'
      `,
      [artworkId, userId]
    );

    return res.json({ message: "Karya for sale berhasil dihapus (soft delete)." });
  } catch (err) {
    console.error("Error delete for-sale:", err);
    return res.status(500).json({
      message: "Server error saat menghapus karya for sale.",
    });
  }
});

// ===================================================================
// ========================= UPDATE / DELETE ARTWORK =================
// ===================================================================

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
      return res.status(403).json({
        message: "Kamu tidak punya akses untuk mengubah karya ini.",
      });
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
      RETURNING
        id, user_id, title, description, style, image_url,
        mode, price, category, height_cm, width_cm, frame_details,
        status, created_at, updated_at
      `,
      [title.trim(), description || null, finalStyle, artworkId]
    );

    return res.json({
      message: "Karya berhasil diperbarui.",
      artwork: result.rows[0],
    });
  } catch (err) {
    console.error("Error update artwork:", err);
    return res.status(500).json({ message: "Server error saat update karya." });
  }
});

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
      return res.status(403).json({
        message: "Kamu tidak punya akses untuk menghapus karya ini.",
      });
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

    let filePath;
    try {
      const fileUrl = new URL(artwork.image_url);
      const relativePath = fileUrl.pathname.replace(/^\/+/, "");
      filePath = path.join(__dirname, relativePath);
    } catch (e) {
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
// ========================= ARTISTS API =============================
// ===================================================================

app.get("/api/artists", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (u.id)
        u.id,
        u.email,
        COALESCE(u.full_name, u.nickname, u.email) AS name,
        u.full_name,
        u.nickname,
        u.avatar_url,
        u.gender,
        u.birth_date,
        u.address,
        u.bio
      FROM public.users u
      JOIN public.artworks a ON a.user_id = u.id
      WHERE a.status = 'active'
      ORDER BY u.id, a.created_at DESC
      `
    );

    return res.json({ artists: result.rows });
  } catch (err) {
    console.error("Error get artists:", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil daftar artist." });
  }
});

app.get("/api/artists/:id", async (req, res) => {
  try {
    const artistId = Number(req.params.id);
    if (!artistId) {
      return res.status(400).json({ message: "ID artist tidak valid." });
    }

    const artistResult = await pool.query(
      `
      SELECT 
        id,
        email,
        full_name,
        nickname,
        avatar_url,
        gender,
        birth_date,
        address,
        bio
      FROM public.users
      WHERE id = $1
      `,
      [artistId]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: "Artist tidak ditemukan." });
    }

    return res.json({ artist: artistResult.rows[0] });
  } catch (err) {
    console.error("Error get artist detail:", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil detail artist." });
  }
});

app.get("/api/artists/:id/artworks", async (req, res) => {
  try {
    const artistId = Number(req.params.id);
    const { source } = req.query;

    if (!artistId) {
      return res.status(400).json({ message: "ID artist tidak valid." });
    }

    if (source === "for_sale") {
      const r = await pool.query(
        `
        SELECT 
          id, title, description, style, image_url,
          mode, price, category, height_cm, width_cm, frame_details,
          status, created_at, updated_at
        FROM public.artworks
        WHERE user_id = $1
          AND status = 'active'
          AND mode = 'for_sale'
        ORDER BY created_at DESC
        `,
        [artistId]
      );
      return res.json({ artworks: r.rows });
    }

    const artworksResult = await pool.query(
  `
  SELECT 
    id, title, description, style, image_url,
    mode, price, category, height_cm, width_cm, frame_details,
    status, created_at, updated_at
  FROM public.artworks
  WHERE user_id = $1
    AND status = 'active'
    AND (
      mode IS NULL
      OR mode = 'gallery'
      OR mode = 'for_sale'
    )
  ORDER BY created_at DESC
  `,
  [artistId]
);


    return res.json({ artworks: artworksResult.rows });
  } catch (err) {
    console.error("Error get artist artworks:", err);
    return res.status(500).json({
      message: "Server error saat mengambil karya artist ini.",
    });
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

// ===================================================================
// ========================= ADMIN: ARTWORKS =========================
// ===================================================================

app.get(
  "/api/admin/artworks",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.style,
        a.image_url,
        a.mode,
        a.price,
        a.category,
        a.height_cm,
        a.width_cm,
        a.frame_details,
        a.status,
        a.created_at,
        a.updated_at,
        u.id AS artist_id,
        u.full_name,
        u.nickname,
        u.email
      FROM public.artworks a
      JOIN public.users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      `
      );

      res.json({ artworks: result.rows });
    } catch (err) {
      console.error("Admin get artworks error:", err);
      res.status(500).json({
        message: "Server error saat mengambil data karya (admin).",
      });
    }
  }
);

app.delete(
  "/api/admin/artworks/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const artworkId = req.params.id;

      const check = await pool.query(
        "SELECT id FROM public.artworks WHERE id = $1",
        [artworkId]
      );

      if (check.rows.length === 0) {
        return res.status(404).json({ message: "Karya tidak ditemukan." });
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

      return res.json({ message: "Karya berhasil dihapus oleh admin." });
    } catch (err) {
      console.error("Admin delete artwork error:", err);
      res.status(500).json({
        message: "Server error saat menghapus karya (admin).",
      });
    }
  }
);

// ===================================================================
// ========================= ADMIN: FOR SALE =========================
// ===================================================================

// ✅ ADMIN: LIST FOR SALE
app.get(
  "/api/admin/for-sale",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.style,
          a.image_url,
          a.mode,
          a.price,
          a.category,
          a.height_cm,
          a.width_cm,
          a.frame_details,
          a.status,
          a.created_at,
          a.updated_at,
          u.id AS artist_id,
          u.full_name,
          u.nickname,
          u.email
        FROM public.artworks a
        JOIN public.users u ON u.id = a.user_id
        WHERE a.mode = 'for_sale'
        ORDER BY a.created_at DESC
        `
      );

      res.json({ artworks: result.rows });
    } catch (err) {
      console.error("Admin get for-sale error:", err);
      res.status(500).json({
        message: "Server error saat mengambil data for sale (admin).",
      });
    }
  }
);

// ✅ ADMIN: DELETE FOR SALE (soft delete)
app.delete(
  "/api/admin/for-sale/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const artworkId = req.params.id;

      const check = await pool.query(
        "SELECT id FROM public.artworks WHERE id = $1 AND mode = 'for_sale'",
        [artworkId]
      );

      if (check.rows.length === 0) {
        return res.status(404).json({ message: "For sale tidak ditemukan." });
      }

      await pool.query(
        `
        UPDATE public.artworks
        SET status = 'deleted',
            updated_at = NOW()
        WHERE id = $1 AND mode = 'for_sale'
        `,
        [artworkId]
      );

      return res.json({ message: "For sale berhasil dihapus oleh admin." });
    } catch (err) {
      console.error("Admin delete for-sale error:", err);
      res.status(500).json({
        message: "Server error saat menghapus for sale (admin).",
      });
    }
  }
);


// ===================================================================
// ========================= ADMIN: USERS ============================
// ===================================================================

app.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
      SELECT
        id,
        email,
        full_name,
        nickname,
        role,
        is_banned,
        created_at
      FROM public.users
      ORDER BY created_at DESC
      `
      );

      res.json({ users: result.rows });
    } catch (err) {
      console.error("Admin get users error:", err);
      res.status(500).json({
        message: "Server error saat mengambil data user (admin).",
      });
    }
  }
);

app.patch(
  "/api/admin/users/:id/ban",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const { is_banned } = req.body;

      await pool.query(
        `
        UPDATE public.users
        SET is_banned = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
        [Boolean(is_banned), targetUserId]
      );

      res.json({
        message: `User ${is_banned ? "dibanned" : "dibuka blokirnya"} oleh admin.`,
      });
    } catch (err) {
      console.error("Admin ban user error:", err);
      res.status(500).json({
        message: "Server error saat update ban user (admin).",
      });
    }
  }
);

// ===================================================================
// ========================= EVENTS (PUBLIC) =========================
// ===================================================================

app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        location,
        start_datetime,
        end_datetime,
        poster_url,
        about,
        created_at,
        updated_at
      FROM public.events
      ORDER BY start_datetime ASC
      `
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error("Public get events error:", err);
    res
      .status(500)
      .json({ message: "Server error saat mengambil daftar event." });
  }
});

// PUBLIC: DETAIL EVENT (+ tickets)
app.get("/api/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventResult = await pool.query(
      `
      SELECT
        id,
        title,
        location,
        start_datetime,
        end_datetime,
        poster_url,
        about,
        organizer_name,
        organizer_whatsapp,
        qris_image_url,
        organizer_logo_url,
        gallery_photos
      FROM public.events
      WHERE id = $1
      `,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    const ticketsResult = await pool.query(
      `
      SELECT
        id,
        ticket_type,
        price,
        quota,
        created_at
      FROM public.event_tickets
      WHERE event_id = $1
      ORDER BY price ASC
      `,
      [eventId]
    );

    const ev = eventResult.rows[0];

    let photos = [];
    if (Array.isArray(ev.gallery_photos)) {
      photos = ev.gallery_photos;
    } else if (typeof ev.gallery_photos === "string") {
      try {
        photos = JSON.parse(ev.gallery_photos);
      } catch {
        photos = [];
      }
    } else if (ev.gallery_photos && typeof ev.gallery_photos === "object") {
      photos = ev.gallery_photos;
    }

    res.json({
      event: { ...ev },
      tickets: ticketsResult.rows,
      photos: photos || [],
    });
  } catch (err) {
    console.error("Public get event detail error:", err);
    res
      .status(500)
      .json({ message: "Server error saat mengambil detail event." });
  }
});

// ===================================================================
// ========================= EVENTS (ADMIN) ==========================
// ===================================================================

// ADMIN: UPLOAD POSTER (opsional endpoint khusus)
app.post(
  "/api/admin/events/upload-poster",
  authMiddleware,
  adminMiddleware,
  uploadEventPoster.single("poster"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File poster tidak ditemukan." });
      }

      const posterUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/events/${req.file.filename}`;

      return res.json({
        message: "Poster berhasil diupload.",
        poster_url: posterUrl,
      });
    } catch (err) {
      console.error("Admin upload poster error:", err);
      res.status(500).json({
        message: "Server error saat upload poster event (admin).",
      });
    }
  }
);

// ADMIN: LIST EVENTS
app.get("/api/admin/events", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          location,
          start_datetime,
          end_datetime,
          poster_url,
          about,
          organizer_name,
          organizer_whatsapp,
          qris_image_url,
          organizer_logo_url,
          created_at,
          updated_at
        FROM public.events
        ORDER BY start_datetime DESC
      `
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error("Admin get events error:", err);
    res.status(500).json({ message: "Server error saat mengambil data event (admin)." });
  }
});

// ADMIN: CREATE EVENT
app.post(
  "/api/admin/events",
  authMiddleware,
  adminMiddleware,
  uploadEventAssets.fields([
    { name: "poster", maxCount: 1 },
    { name: "qris", maxCount: 1 },
    { name: "organizer_logo", maxCount: 1 },
    { name: "photos", maxCount: 4 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        location,
        start_datetime,
        end_datetime,
        organizer_name,
        organizer_whatsapp,
        about,
      } = req.body;

      if (!title || !location || !start_datetime) {
        return res.status(400).json({
          message: "title, location, dan start_datetime wajib diisi.",
        });
      }

      let tickets = [];
      if (req.body.tickets) {
        try {
          const parsed = JSON.parse(req.body.tickets);
          if (Array.isArray(parsed)) tickets = parsed;
        } catch (e) {
          console.error("Parse tickets error:", e);
          return res.status(400).json({
            message: "Format tickets tidak valid (harus JSON array).",
          });
        }
      }

      if (!tickets.length) {
        return res.status(400).json({ message: "Minimal harus ada 1 jenis tiket." });
      }

      let posterUrl = null;
      let qrisUrl = null;
      let organizerLogoUrl = null;

      if (req.files?.poster?.[0]) {
        const file = req.files.poster[0];
        posterUrl = `${req.protocol}://${req.get("host")}/uploads/event_posters/${file.filename}`;
      }

      if (req.files?.qris?.[0]) {
        const file = req.files.qris[0];
        qrisUrl = `${req.protocol}://${req.get("host")}/uploads/qris/${file.filename}`;
      }

      if (req.files?.organizer_logo?.[0]) {
        const file = req.files.organizer_logo[0];
        organizerLogoUrl = `${req.protocol}://${req.get("host")}/uploads/others/${file.filename}`;
      }

      const photoUrls = (req.files?.photos || []).map((f) => {
        return `${req.protocol}://${req.get("host")}/uploads/others/${f.filename}`;
      });

      const eventResult = await pool.query(
        `
        INSERT INTO public.events
          (title, location, start_datetime, end_datetime,
           poster_url, about,
           organizer_name, organizer_whatsapp,
           qris_image_url, organizer_logo_url,
           gallery_photos)
        VALUES ($1, $2, $3, $4,
                $5, $6,
                $7, $8,
                $9, $10,
                $11)
        RETURNING *
        `,
        [
          title,
          location,
          start_datetime,
          end_datetime || null,
          posterUrl,
          about || null,
          organizer_name || null,
          organizer_whatsapp || null,
          qrisUrl,
          organizerLogoUrl,
          JSON.stringify(photoUrls),
        ]
      );

      const event = eventResult.rows[0];

      for (const t of tickets) {
        if (!t.type || !t.price) continue;
        await pool.query(
          `
          INSERT INTO public.event_tickets (event_id, ticket_type, price, quota)
          VALUES ($1, $2, $3, $4)
          `,
          [event.id, t.type, t.price, t.quota || null]
        );
      }

      return res.status(201).json({
        message: "Event berhasil dibuat.",
        event,
      });
    } catch (err) {
      console.error("Admin create event error:", err);
      return res.status(500).json({
        message: "Server error saat membuat event (admin).",
      });
    }
  }
);

// ADMIN: UPDATE EVENT
app.put(
  "/api/admin/events/:id",
  authMiddleware,
  adminMiddleware,
  uploadEventAssets.fields([
    { name: "poster", maxCount: 1 },
    { name: "qris", maxCount: 1 },
    { name: "organizer_logo", maxCount: 1 },
    { name: "photos", maxCount: 4 },
  ]),
  async (req, res) => {
    try {
      const eventId = req.params.id;

      const {
        title,
        location,
        start_datetime,
        end_datetime,
        organizer_name,
        organizer_whatsapp,
        about,
      } = req.body;

      let tickets = null;
      if (req.body.tickets) {
        try {
          const parsed = JSON.parse(req.body.tickets);
          if (!Array.isArray(parsed)) {
            return res.status(400).json({
              message: "Format tickets tidak valid (harus JSON array).",
            });
          }
          tickets = parsed;
        } catch (e) {
          console.error("Parse tickets error:", e);
          return res.status(400).json({
            message: "Format tickets tidak valid (harus JSON array).",
          });
        }
      }

      const prevRes = await pool.query(
        `SELECT poster_url, qris_image_url, organizer_logo_url, gallery_photos
         FROM public.events
         WHERE id = $1`,
        [eventId]
      );

      if (prevRes.rows.length === 0) {
        return res.status(404).json({ message: "Event tidak ditemukan." });
      }

      let posterUrl = prevRes.rows[0].poster_url || null;
      let qrisUrl = prevRes.rows[0].qris_image_url || null;
      let organizerLogoUrl = prevRes.rows[0].organizer_logo_url || null;
      let galleryPhotos = prevRes.rows[0].gallery_photos || [];

      if (req.files?.poster?.[0]) {
        const file = req.files.poster[0];
        posterUrl = `${req.protocol}://${req.get("host")}/uploads/event_posters/${file.filename}`;
      }
      if (req.files?.qris?.[0]) {
        const file = req.files.qris[0];
        qrisUrl = `${req.protocol}://${req.get("host")}/uploads/qris/${file.filename}`;
      }
      if (req.files?.organizer_logo?.[0]) {
        const file = req.files.organizer_logo[0];
        organizerLogoUrl = `${req.protocol}://${req.get("host")}/uploads/others/${file.filename}`;
      }

      if (req.files?.photos?.length) {
        const photoUrls = req.files.photos.map((f) => {
          return `${req.protocol}://${req.get("host")}/uploads/others/${f.filename}`;
        });
        galleryPhotos = photoUrls;
      }

      const updatedRes = await pool.query(
        `
        UPDATE public.events
        SET
          title = COALESCE($1, title),
          location = COALESCE($2, location),
          start_datetime = COALESCE($3, start_datetime),
          end_datetime = $4,
          poster_url = $5,
          qris_image_url = $6,
          organizer_name = COALESCE($7, organizer_name),
          organizer_whatsapp = COALESCE($8, organizer_whatsapp),
          organizer_logo_url = $9,
          about = COALESCE($10, about),
          gallery_photos = $11,
          updated_at = NOW()
        WHERE id = $12
        RETURNING *
        `,
        [
          title || null,
          location || null,
          start_datetime || null,
          end_datetime || null,
          posterUrl,
          qrisUrl,
          organizer_name || null,
          organizer_whatsapp || null,
          organizerLogoUrl,
          about || null,
          JSON.stringify(galleryPhotos),
          eventId,
        ]
      );

      const event = updatedRes.rows[0];

      if (tickets) {
        await pool.query(`DELETE FROM public.event_tickets WHERE event_id = $1`, [
          eventId,
        ]);

        for (const t of tickets) {
          if (!t.type || !t.price) continue;
          await pool.query(
            `
            INSERT INTO public.event_tickets (event_id, ticket_type, price, quota)
            VALUES ($1, $2, $3, $4)
            `,
            [eventId, t.type, t.price, t.quota || null]
          );
        }
      }

      const ticketsRes = await pool.query(
        `
        SELECT id, ticket_type, price, quota, created_at
        FROM public.event_tickets
        WHERE event_id = $1
        ORDER BY price ASC
        `,
        [eventId]
      );

      return res.json({
        message: "Event berhasil diupdate.",
        event,
        tickets: ticketsRes.rows,
      });
    } catch (err) {
      console.error("Admin update event error:", err);
      return res.status(500).json({
        message: "Server error saat update event (admin).",
      });
    }
  }
);

// ADMIN: LIST PEMBELIAN TIKET
app.get(
  "/api/admin/ticket-orders",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT 
          o.id,
          o.event_id,
          e.title AS event_title,
          t.ticket_type,
          o.customer_name,
          o.customer_email,
          o.quantity,
          o.payment_method,
          o.payment_status,
          o.total_price,
          o.created_at
        FROM public.event_orders o
        JOIN public.events e ON e.id = o.event_id
        JOIN public.event_tickets t ON t.id = o.ticket_id
        ORDER BY o.created_at DESC
      `
      );

      res.json({ orders: result.rows });
    } catch (err) {
      console.error("Admin get ticket orders error:", err);
      res.status(500).json({
        message: "Server error saat mengambil data pembelian tiket (admin).",
      });
    }
  }
);

// ===== JALANKAN SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
