// src/pages/ProfileSettings.js
import React, { useEffect, useState } from "react";
import "./ProfileSettings.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000"; // samakan dengan backend-mu

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    nickname: "",
    whatsapp_number: "",
    avatar_url: "",
  });

  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const [artworkForm, setArtworkForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [artworkMessage, setArtworkMessage] = useState("");
  const [artworkError, setArtworkError] = useState("");

  const token = localStorage.getItem("heart_token");

  // === FETCH DATA PROFILE SAAT PAGE DIBUKA ===
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return; // kalau belum login

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
        // kasih tau Navbar kalau user berubah
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

  // === HANDLER PROFILE FORM ===
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

      // sinkron ke localStorage (buat Navbar)
      localStorage.setItem("heart_user", JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("heart_user_updated"));
    } catch (err) {
      console.error("Error update profile:", err);
      setProfileError("Terjadi kesalahan saat update profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  // === HANDLER PASSWORD FORM ===
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

      // NOTE: endpoint ini belum kamu buat di backend, ini hanya contoh.
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

  // === HANDLER AVATAR (FOTO PROFIL) ===
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

      // update juga di localStorage supaya Navbar bisa pakai avatar baru
      localStorage.setItem("heart_user", JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("heart_user_updated"));
    } catch (err) {
      console.error("Error upload avatar:", err);
      setAvatarError("Terjadi kesalahan saat upload foto profil.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // === HANDLER ARTWORK FORM ===
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
      formData.append("price", artworkForm.price);
      formData.append("category", artworkForm.category);

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

      setArtworkMessage("Karya berhasil di-upload untuk dijual.");
      setArtworkForm({
        title: "",
        description: "",
        price: "",
        category: "",
      });
      setArtworkFile(null);
    } catch (err) {
      console.error("Error upload artwork:", err);
      setArtworkError("Terjadi kesalahan saat upload karya.");
    } finally {
      setArtworkLoading(false);
    }
  };

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

      <div className="profile-layout">
        {/* ========== KIRI: PROFILE + PASSWORD ========== */}
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

        {/* ========== KANAN: UPLOAD KARYA ========== */}
        <div className="profile-right">
          <section className="profile-section">
            <h2>Upload & Jual Karya</h2>
            <p className="section-subtitle">
              Unggah karya terbaikmu dan jadikan tersedia untuk kolektor di
              HeArt.
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

              <button
                type="submit"
                className="btn primary"
                disabled={artworkLoading}
              >
                {artworkLoading ? "Mengupload..." : "Upload Karya"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
