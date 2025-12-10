// src/pages/ProfileSettings.js
import React, { useEffect, useState, useCallback } from "react";
import "./ProfileSettings.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000"; // samakan dengan backend-mu

// Style untuk gallery (nyambung ke Gallery.js filter)
const STYLE_OPTIONS = [
  "Realistic",
  "Surrealist",
  "Abstract",
  "Geometric",
  "Illustrative",
  "Others",
];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("heart_token");

  // ===== PROFILE STATE =====
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    nickname: "",
    whatsapp_number: "",
    avatar_url: "",
  });

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "upload" | "sell"

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ===== PASSWORD STATE =====
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ===== AVATAR STATE =====
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  // ===== ARTWORK FORM STATE (UPLOAD & SELL) =====
  const [artworkForm, setArtworkForm] = useState({
    title: "",
    description: "",
    style: "Others", // untuk gallery
    price: "",
    category: "",
  });
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState(null); // preview besar
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [artworkMessage, setArtworkMessage] = useState("");
  const [artworkError, setArtworkError] = useState("");

  // ===== MY ARTWORKS (TABLE) =====
  const [myArtworks, setMyArtworks] = useState([]);
  const [myArtworksLoading, setMyArtworksLoading] = useState(false);
  const [myArtworksError, setMyArtworksError] = useState("");

  // ===== EDIT STATE UNTUK TABEL =====
  const [editingArtworkId, setEditingArtworkId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    style: "Others",
  });

  // =========================================================
  // 1. FETCH PROFILE
  // =========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setProfileLoading(true);
        setProfileError("");
        setProfileMessage("");

        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setProfileError(data.message || "Gagal mengambil data profil.");
          return;
        }

        const newProfile = {
          email: data.email || "",
          full_name: data.full_name || "",
          nickname: data.nickname || "",
          whatsapp_number: data.whatsapp_number || "",
          avatar_url: data.avatar_url || "",
        };

        setProfile(newProfile);

        // simpan juga ke localStorage supaya Navbar bisa baca
        localStorage.setItem("heart_user", JSON.stringify(newProfile));
        window.dispatchEvent(new Event("heart_user_updated"));
      } catch (err) {
        console.error("Error fetch profile:", err);
        setProfileError("Terjadi kesalahan saat mengambil data profil.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // =========================================================
  // 2. FETCH MY ARTWORKS (dipakai tabel + refresh setelah CRUD)
  // =========================================================
  const fetchMyArtworks = useCallback(async () => {
    if (!token) return;

    try {
      setMyArtworksLoading(true);
      setMyArtworksError("");

      const res = await fetch(`${API_BASE_URL}/api/my-artworks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMyArtworksError(
          data.message || "Gagal mengambil daftar karya yang kamu upload."
        );
        return;
      }

      setMyArtworks(data.artworks || []);
    } catch (err) {
      console.error("Error fetch my artworks:", err);
      setMyArtworksError("Terjadi kesalahan saat mengambil data karya.");
    } finally {
      setMyArtworksLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // load daftar karya begitu page kebuka (kalau user sudah login)
    if (!token) return;
    fetchMyArtworks();
  }, [token, fetchMyArtworks]);

  // =========================================================
  // HANDLER: PROFILE FORM
  // =========================================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profile.full_name.trim()) {
      setProfileError("Nama lengkap wajib diisi.");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          nickname: profile.nickname,
          whatsapp_number: profile.whatsapp_number,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.message || "Gagal memperbarui profil.");
        return;
      }

      setProfileMessage("Profil berhasil diperbarui.");

      const updatedProfile = {
        email: profile.email,
        full_name: data.user.full_name || "",
        nickname: data.user.nickname || "",
        whatsapp_number: data.user.whatsapp_number || "",
        avatar_url: profile.avatar_url,
      };

      setProfile(updatedProfile);

      localStorage.setItem("heart_user", JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("heart_user_updated"));
    } catch (err) {
      console.error("Error update profile:", err);
      setProfileError("Terjadi kesalahan saat update profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================
  // HANDLER: PASSWORD FORM
  // =========================================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
    setPasswordMessage("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Semua field wajib diisi.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("Konfirmasi password baru tidak sama.");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordMessage("");

      // Endpoint ini belum kamu buat di backend, ini placeholder
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.message || "Gagal mengubah password.");
        return;
      }

      setPasswordMessage("Password berhasil diubah.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      console.error("Error change password:", err);
      setPasswordError("Terjadi kesalahan saat mengubah password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================================================
  // HANDLER: AVATAR
  // =========================================================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarError("");
    setAvatarMessage("");

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAvatarError("Pilih file foto profil terlebih dahulu.");
      return;
    }

    try {
      setAvatarLoading(true);
      setAvatarError("");
      setAvatarMessage("");

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAvatarError(data.message || "Gagal meng-upload foto profil.");
        return;
      }

      setAvatarMessage("Foto profil berhasil diupload.");

      const updatedProfile = {
        ...profile,
        avatar_url: data.avatar_url || profile.avatar_url,
      };

      setProfile(updatedProfile);

      localStorage.setItem("heart_user", JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("heart_user_updated"));
    } catch (err) {
      console.error("Error upload avatar:", err);
      setAvatarError("Terjadi kesalahan saat upload foto profil.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // =========================================================
  // HANDLER: ARTWORK FORM (UPLOAD & JUAL)
  // =========================================================
  const handleArtworkChange = (e) => {
    const { name, value } = e.target;
    setArtworkForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setArtworkError("");
    setArtworkMessage("");
  };

  const handleArtworkFileChange = (e) => {
    const file = e.target.files[0];
    setArtworkFile(file);
    setArtworkError("");
    setArtworkMessage("");

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setArtworkPreview(previewUrl);
    } else {
      setArtworkPreview(null);
    }
  };

  const handleArtworkSubmit = async (e) => {
    e.preventDefault();

    if (!artworkForm.title.trim()) {
      setArtworkError("Judul karya wajib diisi.");
      return;
    }

    if (!artworkFile) {
      setArtworkError("Pilih file gambar karya terlebih dahulu.");
      return;
    }

    try {
      setArtworkLoading(true);
      setArtworkError("");
      setArtworkMessage("");

      const formData = new FormData();
      formData.append("image", artworkFile);
      formData.append("title", artworkForm.title);
      formData.append("description", artworkForm.description);
      formData.append("style", artworkForm.style || "Others");

      // beda mode: upload gallery (free) vs jual karya
      const mode = activeTab === "upload" ? "gallery" : "for_sale";
      formData.append("mode", mode);

      if (mode === "for_sale") {
        formData.append("price", artworkForm.price || "");
        formData.append("category", artworkForm.category || "");
      }

      const res = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setArtworkError(data.message || "Gagal meng-upload karya.");
        return;
      }

      const actionLabel =
        mode === "gallery"
          ? "Karya berhasil di-upload ke Gallery."
          : "Karya berhasil di-upload (mode for_sale akan di-handle di tabel lain nanti).";

      setArtworkMessage(actionLabel);

      // reset form
      setArtworkForm({
        title: "",
        description: "",
        style: "Others",
        price: "",
        category: "",
      });
      setArtworkFile(null);
      setArtworkPreview(null);

      // refresh tabel karya user kalau mode gallery
      if (mode === "gallery") {
        fetchMyArtworks();
      }
    } catch (err) {
      console.error("Error upload artwork:", err);
      setArtworkError("Terjadi kesalahan saat upload karya.");
    } finally {
      setArtworkLoading(false);
    }
  };

  // =========================================================
  // HANDLER: TABEL CRUD MY ARTWORKS
  // =========================================================
  const handleStartEdit = (artwork) => {
    setEditingArtworkId(artwork.id);
    setEditForm({
      title: artwork.title || "",
      description: artwork.description || "",
      style: artwork.style || "Others",
    });
  };

  const handleCancelEdit = () => {
    setEditingArtworkId(null);
    setEditForm({
      title: "",
      description: "",
      style: "Others",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (artworkId) => {
    if (!editForm.title.trim()) {
      alert("Judul karya wajib diisi.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          style: editForm.style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengupdate karya.");
        return;
      }

      // refresh data
      fetchMyArtworks();
      handleCancelEdit();
    } catch (err) {
      console.error("Error update artwork:", err);
      alert("Terjadi kesalahan saat update karya.");
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm("Yakin ingin menghapus karya ini?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menghapus karya.");
        return;
      }

      fetchMyArtworks();
    } catch (err) {
      console.error("Error delete artwork:", err);
      alert("Terjadi kesalahan saat menghapus karya.");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="profile-page">
      {/* HEADER DENGAN BACK BUTTON */}
      <div className="profile-page-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/home")}
        >
          ← Back
        </button>
        <h1 className="profile-page-title">Profile Settings</h1>
      </div>

      {/* TAB MENU */}
      <div className="profile-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("profile")}
        >
          Edit Profile
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "upload" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("upload")}
        >
          Upload Karya (Gallery)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "sell" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("sell")}
        >
          Jual Karya (For Sale)
        </button>
      </div>

      {/* ===== TAB: EDIT PROFILE ===== */}
      {activeTab === "profile" && (
        <div className="profile-layout">
          <div className="profile-left">
            {/* ---- FOTO PROFIL ---- */}
            <section className="profile-section">
              <h2>Foto Profil</h2>
              <p className="section-subtitle">
                Tambahkan foto profil agar kolektor dan seniman lain mudah
                mengenali Anda.
              </p>

              <div className="avatar-row">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview avatar" />
                  ) : profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">No Image</div>
                  )}
                </div>

                <div className="avatar-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    className="btn primary"
                    onClick={handleAvatarUpload}
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? "Mengupload..." : "Upload Foto"}
                  </button>
                  {avatarError && (
                    <p className="form-error small">{avatarError}</p>
                  )}
                  {avatarMessage && (
                    <p className="form-success small">{avatarMessage}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ---- DATA PROFIL ---- */}
            <section className="profile-section">
              <h2>Informasi Akun</h2>

              {profileError && <p className="form-error">{profileError}</p>}
              {profileMessage && (
                <p className="form-success">{profileMessage}</p>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label>Email (tidak dapat diubah)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Masukkan nama lengkap"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    placeholder="Nama panggilan / nama seniman"
                    value={profile.nickname}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Nomor WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    placeholder="Contoh: 081234567890"
                    value={profile.whatsapp_number}
                    onChange={handleProfileChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </section>

            {/* ---- UBAH PASSWORD ---- */}
            <section className="profile-section">
              <h2>Ubah Password</h2>
              <p className="section-subtitle">
                Jaga keamanan akun dengan rutin mengganti kata sandi.
              </p>

              {passwordError && <p className="form-error">{passwordError}</p>}
              {passwordMessage && (
                <p className="form-success">{passwordMessage}</p>
              )}

              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label>Password Saat Ini</label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Masukkan password saat ini"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Masukkan password baru"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    placeholder="Ulangi password baru"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn secondary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Mengubah..." : "Ubah Password"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* ===== TAB: UPLOAD KARYA (GALLERY, FREE) ===== */}
      {activeTab === "upload" && (
        <div className="profile-layout single-column">
          <div className="profile-right">
            <section className="profile-section">
              <h2>Upload Karya ke Gallery</h2>
              <p className="section-subtitle">
                Unggah karya yang ingin kamu tampilkan untuk inspirasi di
                Gallery HeArt. Karya di sini bersifat free / non-komersial.
              </p>

              {artworkError && <p className="form-error">{artworkError}</p>}
              {artworkMessage && (
                <p className="form-success">{artworkMessage}</p>
              )}

              <form onSubmit={handleArtworkSubmit} className="profile-form">
                <div className="form-group">
                  <label>Judul Karya</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Contoh: Harmony of the Night"
                    value={artworkForm.title}
                    onChange={handleArtworkChange}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Ceritakan sedikit tentang karya ini..."
                    value={artworkForm.description}
                    onChange={handleArtworkChange}
                  />
                </div>

                <div className="form-group">
                  <label>Style</label>
                  <select
                    name="style"
                    value={artworkForm.style}
                    onChange={handleArtworkChange}
                  >
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>File Karya (Gambar)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkFileChange}
                  />
                </div>

                {/* PREVIEW BESAR */}
                {artworkPreview && (
                  <div className="artwork-preview-wrapper">
                    <p className="artwork-preview-label">Preview Karya:</p>
                    <div className="artwork-preview-box">
                      <img
                        src={artworkPreview}
                        alt="Preview karya"
                        className="artwork-preview-img"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn primary"
                  disabled={artworkLoading}
                >
                  {artworkLoading ? "Mengupload..." : "Upload ke Gallery"}
                </button>
              </form>
            </section>

            {/* ===== TABEL KARYAKU DI GALLERY ===== */}
            <section className="profile-section">
              <h2>Karyaku di Gallery</h2>
              <p className="section-subtitle">
                Daftar karya yang sudah kamu upload ke Gallery. Kamu bisa edit
                atau hapus (soft delete).
              </p>

              {myArtworksError && (
                <p className="form-error">{myArtworksError}</p>
              )}
              {myArtworksLoading && <p>Memuat data karya...</p>}

              {!myArtworksLoading && myArtworks.length === 0 && (
                <p className="section-subtitle">
                  Kamu belum mengupload karya apa pun ke Gallery.
                </p>
              )}

              {!myArtworksLoading && myArtworks.length > 0 && (
                <div className="artwork-table-wrapper">
                  <table className="artwork-table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Judul</th>
                        <th>Deskripsi</th>
                        <th>Style</th>
                        <th>Dibuat</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myArtworks.map((art) => {
                        const isEditing = editingArtworkId === art.id;
                        return (
                          <tr key={art.id}>
                            <td>
                              <div className="artwork-thumb">
                                <img
                                  src={art.image_url}
                                  alt={art.title}
                                  className="artwork-thumb-img"
                                />
                              </div>
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="title"
                                  value={editForm.title}
                                  onChange={handleEditFormChange}
                                />
                              ) : (
                                art.title
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <textarea
                                  name="description"
                                  rows={2}
                                  value={editForm.description}
                                  onChange={handleEditFormChange}
                                />
                              ) : (
                                <span className="artwork-desc">
                                  {art.description || "-"}
                                </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  name="style"
                                  value={editForm.style}
                                  onChange={handleEditFormChange}
                                >
                                  {STYLE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                art.style || "-"
                              )}
                            </td>
                            <td>
                              {new Date(art.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn small primary"
                                    onClick={() => handleSaveEdit(art.id)}
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    className="btn small secondary"
                                    onClick={handleCancelEdit}
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn small secondary"
                                    onClick={() => handleStartEdit(art)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn small danger"
                                    onClick={() =>
                                      handleDeleteArtwork(art.id)
                                    }
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ===== TAB: JUAL KARYA (FOR SALE) ===== */}
      {activeTab === "sell" && (
        <div className="profile-layout single-column">
          <div className="profile-right">
            <section className="profile-section">
              <h2>Jual Karya</h2>
              <p className="section-subtitle">
                Lengkapi detail karya yang ingin kamu jual di halaman For Sale.
                (Untuk saat ini, backend-nya baru menyimpan ke tabel artworks
                dengan mode &quot;for_sale&quot; sebagai placeholder.)
              </p>

              {artworkError && <p className="form-error">{artworkError}</p>}
              {artworkMessage && (
                <p className="form-success">{artworkMessage}</p>
              )}

              <form onSubmit={handleArtworkSubmit} className="profile-form">
                <div className="form-group">
                  <label>Judul Karya</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Contoh: Golden Reflections"
                    value={artworkForm.title}
                    onChange={handleArtworkChange}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Ceritakan sedikit tentang karya ini..."
                    value={artworkForm.description}
                    onChange={handleArtworkChange}
                  />
                </div>

                <div className="form-group form-row">
                  <div className="form-group-half">
                    <label>Harga (IDR)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Contoh: 250000"
                      value={artworkForm.price}
                      onChange={handleArtworkChange}
                    />
                  </div>
                  <div className="form-group-half">
                    <label>Kategori</label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Contoh: Digital Art, Illustration"
                      value={artworkForm.category}
                      onChange={handleArtworkChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>File Karya (Gambar)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkFileChange}
                  />
                </div>

                {/* PREVIEW BESAR */}
                {artworkPreview && (
                  <div className="artwork-preview-wrapper">
                    <p className="artwork-preview-label">Preview Karya:</p>
                    <div className="artwork-preview-box">
                      <img
                        src={artworkPreview}
                        alt="Preview karya"
                        className="artwork-preview-img"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn primary"
                  disabled={artworkLoading}
                >
                  {artworkLoading ? "Mengupload..." : "Upload & Jual Karya"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
