// src/pages/ProfileSettings.js
import React, { useEffect, useState, useCallback } from "react";
import "./ProfileSettings.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

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

  // ========= PROFILE STATE =========
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    whatsapp_number: "",
    gender: "",
    birth_date: "",
    address: "",
    bio: "",
    avatar_url: "",
  });

  const [activeTab, setActiveTab] = useState("info");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ========= AVATAR =========
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ========= PASSWORD =========
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ========= ARTWORK UPLOAD / SELL =========
  const [artworkForm, setArtworkForm] = useState({
    title: "",
    description: "",
    style: "Others",
    price: "",
    category: "",
    height_cm: "",
    width_cm: "",
  });
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [artworkMessage, setArtworkMessage] = useState("");
  const [artworkError, setArtworkError] = useState("");

  // ========= MY ARTWORKS (GALLERY) =========
  const [myArtworks, setMyArtworks] = useState([]);
  const [myArtworksLoading, setMyArtworksLoading] = useState(false);
  const [myArtworksError, setMyArtworksError] = useState("");

  const [editingArtworkId, setEditingArtworkId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    style: "Others",
  });

  // ========= MY FOR SALE =========
  const [myForSale, setMyForSale] = useState([]);
  const [myForSaleLoading, setMyForSaleLoading] = useState(false);
  const [myForSaleError, setMyForSaleError] = useState("");

  const [editingForSaleId, setEditingForSaleId] = useState(null);
  const [editForSaleForm, setEditForSaleForm] = useState({
    title: "",
    description: "",
    style: "Others",
    price: "",
    category: "",
    height_cm: "",
    width_cm: "",
  });

  // ========= FETCH PROFILE =========
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

        const birthDate =
          data.birth_date && typeof data.birth_date === "string"
            ? data.birth_date.split("T")[0]
            : "";

        const newProfile = {
          email: data.email || "",
          full_name: data.full_name || "",
          whatsapp_number: data.whatsapp_number || "",
          gender: data.gender || "",
          birth_date: birthDate,
          address: data.address || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        };

        setProfile(newProfile);
        setAvatarFile(null);
        setAvatarPreview(null);

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

  // ========= FETCH MY ARTWORKS (GALLERY) =========
  const fetchMyArtworks = useCallback(async () => {
    if (!token) return;

    try {
      setMyArtworksLoading(true);
      setMyArtworksError("");

      const res = await fetch(`${API_BASE_URL}/api/my-artworks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setMyArtworksError(data.message || "Gagal mengambil daftar karya gallery.");
        return;
      }

      setMyArtworks(data.artworks || []);
    } catch (err) {
      console.error("Error fetch my artworks:", err);
      setMyArtworksError("Terjadi kesalahan saat mengambil data karya gallery.");
    } finally {
      setMyArtworksLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchMyArtworks();
  }, [token, fetchMyArtworks]);

  // ========= FETCH MY FOR SALE =========
  const fetchMyForSale = useCallback(async () => {
    if (!token) return;

    try {
      setMyForSaleLoading(true);
      setMyForSaleError("");

      const res = await fetch(`${API_BASE_URL}/api/my-for-sale`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setMyForSaleError(data.message || "Gagal mengambil daftar karya for sale.");
        return;
      }

      setMyForSale(data.artworks || []);
    } catch (err) {
      console.error("Error fetch my for sale:", err);
      setMyForSaleError("Terjadi kesalahan saat mengambil data karya for sale.");
    } finally {
      setMyForSaleLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchMyForSale();
  }, [token, fetchMyForSale]);

  // ========= HANDLER PROFILE FORM =========
  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleGenderClick = (value) => {
    setProfile((prev) => ({ ...prev, gender: value }));
    setProfileError("");
    setProfileMessage("");
  };

  // ========= AVATAR HANDLER =========
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError("");
    setProfileMessage("");
  };

  // ========= SAVE PROFILE =========
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.full_name.trim()) {
      setProfileError("Nama lengkap wajib diisi.");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      let latestAvatarUrl = profile.avatar_url;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const resAvatar = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const dataAvatar = await resAvatar.json();

        if (!resAvatar.ok) {
          setProfileError(dataAvatar.message || "Gagal upload foto profil.");
          return;
        }

        latestAvatarUrl = dataAvatar.avatar_url || latestAvatarUrl;
      }

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          whatsapp_number: profile.whatsapp_number,
          gender: profile.gender || null,
          birth_date: profile.birth_date || null,
          address: profile.address || "",
          bio: profile.bio || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.message || "Gagal memperbarui profil.");
        return;
      }

      const updatedBirthDate =
        data.user?.birth_date && typeof data.user.birth_date === "string"
          ? data.user.birth_date.split("T")[0]
          : profile.birth_date;

      const updatedProfile = {
        email: data.user?.email || profile.email,
        full_name: data.user?.full_name || "",
        whatsapp_number: data.user?.whatsapp_number || "",
        gender: data.user?.gender || profile.gender || "",
        birth_date: updatedBirthDate,
        address: data.user?.address || profile.address || "",
        bio: data.user?.bio || profile.bio || "",
        avatar_url: latestAvatarUrl,
      };

      setProfile(updatedProfile);
      setAvatarFile(null);
      setAvatarPreview(null);

      localStorage.setItem("heart_user", JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("heart_user_updated"));

      setProfileMessage("Profil berhasil diperbarui.");
    } catch (err) {
      console.error("Error update profile:", err);
      setProfileError("Terjadi kesalahan saat update profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ========= PASSWORD =========
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
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
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Error change password:", err);
      setPasswordError("Terjadi kesalahan saat mengubah password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ========= ARTWORK FORM HANDLERS =========
  const handleArtworkChange = (e) => {
    const { name, value } = e.target;
    setArtworkForm((prev) => ({ ...prev, [name]: value }));
    setArtworkError("");
    setArtworkMessage("");
  };

  const handleArtworkFileChange = (e) => {
    const file = e.target.files[0];
    setArtworkFile(file);
    setArtworkError("");
    setArtworkMessage("");

    if (file) setArtworkPreview(URL.createObjectURL(file));
    else setArtworkPreview(null);
  };

  // ========= UPLOAD ARTWORK (gallery / for_sale) =========
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

      const mode = activeTab === "upload" ? "gallery" : "for_sale";
      formData.append("mode", mode);

      if (mode === "for_sale") {
        formData.append("price", artworkForm.price || "");
        formData.append("category", artworkForm.category || "");
        formData.append("height_cm", artworkForm.height_cm || "");
        formData.append("width_cm", artworkForm.width_cm || "");
      }

      const res = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setArtworkError(data.message || "Gagal meng-upload karya.");
        return;
      }

      setArtworkMessage(
        mode === "gallery"
          ? "Karya berhasil di-upload ke Gallery."
          : "Karya berhasil di-upload untuk dijual (For Sale)."
      );

      setArtworkForm({
        title: "",
        description: "",
        style: "Others",
        price: "",
        category: "",
        height_cm: "",
        width_cm: "",
      });
      setArtworkFile(null);
      setArtworkPreview(null);

      if (mode === "gallery") fetchMyArtworks();
      if (mode === "for_sale") fetchMyForSale();
    } catch (err) {
      console.error("Error upload artwork:", err);
      setArtworkError("Terjadi kesalahan saat upload karya.");
    } finally {
      setArtworkLoading(false);
    }
  };

  // ========= EDIT/DELETE GALLERY =========
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
    setEditForm({ title: "", description: "", style: "Others" });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
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
        headers: { Authorization: `Bearer ${token}` },
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

  // ========= EDIT/DELETE FOR SALE =========
  const handleStartEditForSale = (art) => {
    setEditingForSaleId(art.id);
    setEditForSaleForm({
      title: art.title || "",
      description: art.description || "",
      style: art.style || "Others",
      price: art.price ?? "",
      category: art.category || "",
      height_cm: art.height_cm ?? "",
      width_cm: art.width_cm ?? "",
    });
  };

  const handleCancelEditForSale = () => {
    setEditingForSaleId(null);
    setEditForSaleForm({
      title: "",
      description: "",
      style: "Others",
      price: "",
      category: "",
      height_cm: "",
      width_cm: "",
    });
  };

  const handleEditForSaleChange = (e) => {
    const { name, value } = e.target;
    setEditForSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEditForSale = async (artworkId) => {
    if (!editForSaleForm.title.trim()) {
      alert("Judul karya wajib diisi.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/for-sale/${artworkId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForSaleForm.title,
          description: editForSaleForm.description,
          style: editForSaleForm.style,
          price: editForSaleForm.price === "" ? null : Number(editForSaleForm.price),
          category: editForSaleForm.category,
          height_cm: editForSaleForm.height_cm === "" ? null : Number(editForSaleForm.height_cm),
          width_cm: editForSaleForm.width_cm === "" ? null : Number(editForSaleForm.width_cm),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal update karya for sale.");
        return;
      }

      fetchMyForSale();
      handleCancelEditForSale();
    } catch (err) {
      console.error("Error update for sale:", err);
      alert("Terjadi kesalahan saat update karya for sale.");
    }
  };

  const handleDeleteForSale = async (artworkId) => {
    if (!window.confirm("Yakin ingin menghapus karya for sale ini?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/for-sale/${artworkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menghapus karya for sale.");
        return;
      }

      fetchMyForSale();
    } catch (err) {
      console.error("Error delete for sale:", err);
      alert("Terjadi kesalahan saat menghapus karya for sale.");
    }
  };

  // ========= LOGOUT & DELETE ACCOUNT =========
  const handleLogout = () => {
    localStorage.removeItem("heart_token");
    localStorage.removeItem("heart_user");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Gagal menghapus akun.");
        return;
      }

      localStorage.removeItem("heart_token");
      localStorage.removeItem("heart_user");
      navigate("/login");
    } catch (err) {
      console.error("Error delete account:", err);
      alert("Terjadi kesalahan saat menghapus akun.");
    }
  };

  // ========= RENDER =========
  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <button type="button" className="back-btn" onClick={() => navigate("/home")}>
          ← Back
        </button>
        <h1 className="profile-page-title">Account</h1>
      </div>
      <div className="account-header-divider" />

      <div className="account-layout">
        <aside className="account-sidebar">
          <button
            type="button"
            className={`account-nav-item ${activeTab === "info" ? "active" : ""}`.trim()}
            onClick={() => setActiveTab("info")}
          >
            Account Information
          </button>

          <button
            type="button"
            className={`account-nav-item ${activeTab === "profile" ? "active" : ""}`.trim()}
            onClick={() => setActiveTab("profile")}
          >
            Edit Profile
          </button>

          <button
            type="button"
            className={`account-nav-item ${activeTab === "upload" ? "active" : ""}`.trim()}
            onClick={() => setActiveTab("upload")}
          >
            Upload Karya (Gallery)
          </button>

          <button
            type="button"
            className={`account-nav-item ${activeTab === "sell" ? "active" : ""}`.trim()}
            onClick={() => setActiveTab("sell")}
          >
            Jual Karya (For Sale)
          </button>
        </aside>

        <main className="account-main">
          {/* ===== TAB INFO ===== */}
          {activeTab === "info" && (
            <section className="account-info-section">
              <div className="account-info-header-row">
                <div className="account-info-user">
                  <div className="account-info-avatar">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" />
                    ) : (
                      <span className="avatar-circle-placeholder">No Image</span>
                    )}
                  </div>
                  <div>
                    <h2 className="account-info-title">Account Information</h2>
                    <p className="account-info-subtitle">Your HeArt account information is here</p>
                  </div>
                </div>

                <button type="button" className="btn-outline-red" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div className="account-info-grid">
                <div>
                  <p className="account-info-item-label">Email Address</p>
                  <p className="account-info-item-value">{profile.email || "-"}</p>
                </div>

                <div>
                  <p className="account-info-item-label">Gender</p>
                  <p className="account-info-item-value">{profile.gender || "-"}</p>
                </div>

                <div>
                  <p className="account-info-item-label">Full Name</p>
                  <p className="account-info-item-value">{profile.full_name || "-"}</p>
                </div>

                <div>
                  <p className="account-info-item-label">Birth Date</p>
                  <p className="account-info-item-value">
                    {profile.birth_date
                      ? new Date(profile.birth_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="account-info-item-label">Phone Number (WhatsApp)</p>
                  <p className="account-info-item-value">{profile.whatsapp_number || "-"}</p>
                </div>

                <div>
                  <p className="account-info-item-label">Address</p>
                  <p className="account-info-item-value">{profile.address || "-"}</p>
                </div>

                <div>
                  <p className="account-info-item-label">Bio</p>
                  <p className="account-info-item-value">{profile.bio || "-"}</p>
                </div>
              </div>

              <div className="account-delete-section">
                <h3 className="account-delete-title">Delete Account</h3>
                <p className="account-delete-text">
                  If you no longer wish to use HeArt, you can permanently delete your account.
                </p>
                <button type="button" className="btn-delete-account" onClick={handleDeleteAccount}>
                  Delete My Account
                </button>
              </div>
            </section>
          )}

          {/* ===== TAB EDIT PROFILE ===== */}
          {activeTab === "profile" && (
            <section className="edit-profile-wrapper">
              <form className="edit-profile-form" onSubmit={handleSaveProfile}>
                <div className="edit-profile-header">
                  <div className="edit-profile-header-left">
                    <h2>Edit Profile</h2>
                    <p>Update your photos and personal details here.</p>
                  </div>

                  <div className="edit-profile-actions">
                    <button type="button" className="btn-ghost" onClick={() => window.location.reload()}>
                      Cancel
                    </button>

                    <button type="submit" className="btn-save-gradient" disabled={profileLoading}>
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="edit-profile-divider" />

                {profileError && <p className="form-error" style={{ marginBottom: 8 }}>{profileError}</p>}
                {profileMessage && <p className="form-success" style={{ marginBottom: 8 }}>{profileMessage}</p>}

                <div className="edit-photo-row">
                  <div>
                    <p className="edit-photo-left-title">Your Photo</p>
                    <p className="edit-photo-left-caption">This will be displayed on your profile</p>

                    <div className="edit-photo-avatar-preview">
                      <div className="avatar-circle-lg">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview avatar" />
                        ) : profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" />
                        ) : (
                          <span className="avatar-circle-placeholder">No Image</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="photo-upload-box">
                      <div className="photo-upload-icon">🖼️</div>
                      <div>
                        <span className="photo-upload-text-main">Click to upload</span>{" "}
                        <span className="photo-upload-text-sub">or drag and drop</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="photo-upload-input"
                        onChange={handlePhotoFileChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-profile-grid">
                  <div>
                    <label className="form-field-label">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-input"
                      placeholder="Input Your First Name"
                      value={profile.full_name}
                      onChange={handleProfileFieldChange}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Birth Date</label>
                    <div className="birthdate-wrapper">
                      <input
                        type="date"
                        name="birth_date"
                        className="form-input birthdate-input"
                        value={profile.birth_date || ""}
                        onChange={handleProfileFieldChange}
                      />
                      <span className="birthdate-icon">📅</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-field-label">Phone Number (WhatsApp)</label>
                    <input
                      type="text"
                      name="whatsapp_number"
                      className="form-input"
                      placeholder="Contoh: 08123456789"
                      value={profile.whatsapp_number}
                      onChange={handleProfileFieldChange}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      placeholder="Input Your Address"
                      value={profile.address}
                      onChange={handleProfileFieldChange}
                    />
                  </div>
                </div>

                <div className="edit-profile-grid-full">
                  <label className="form-field-label">Gender</label>
                  <div className="gender-options">
                    <button
                      type="button"
                      className={`gender-pill ${profile.gender === "Male" ? "active" : ""}`}
                      onClick={() => handleGenderClick("Male")}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      className={`gender-pill ${profile.gender === "Female" ? "active" : ""}`}
                      onClick={() => handleGenderClick("Female")}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="edit-profile-grid-full">
                  <label className="form-field-label">Bio</label>
                  <textarea
                    name="bio"
                    className="form-textarea"
                    rows={4}
                    placeholder="Tell others about yourself..."
                    value={profile.bio}
                    onChange={handleProfileFieldChange}
                  />
                  <p className="bio-helper-text">
                    Contoh: “Digital artist based in Jakarta, focusing on surreal illustration and visual storytelling.”
                  </p>
                </div>

                <div className="change-password-row">
                  {!showPasswordForm && (
                    <button type="button" className="btn-change-password" onClick={() => setShowPasswordForm(true)}>
                      Change Password
                    </button>
                  )}

                  {showPasswordForm && (
                    <div style={{ marginTop: 12, maxWidth: 420, display: "flex", flexDirection: "column", gap: 8 }}>
                      {passwordError && <p className="form-error">{passwordError}</p>}
                      {passwordMessage && <p className="form-success">{passwordMessage}</p>}

                      <form onSubmit={handlePasswordSubmit}>
                        <div style={{ marginBottom: 8 }}>
                          <label className="form-field-label">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            className="form-input"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <label className="form-field-label">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <label className="form-field-label">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmNewPassword"
                            className="form-input"
                            value={passwordForm.confirmNewPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="submit" className="btn-primary-black" disabled={passwordLoading}>
                            {passwordLoading ? "Changing..." : "Save New Password"}
                          </button>

                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                                confirmNewPassword: "",
                              });
                              setPasswordError("");
                              setPasswordMessage("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* ===== TAB UPLOAD (GALLERY) ===== */}
          {activeTab === "upload" && (
            <section className="profile-card">
              <h2>Upload Karya ke Gallery</h2>
              <p className="profile-card-subtitle">
                Unggah karya yang ingin kamu tampilkan untuk inspirasi di Gallery HeArt. Karya di sini bersifat free / non-komersial.
              </p>

              {artworkError && <p className="form-error">{artworkError}</p>}
              {artworkMessage && <p className="form-success">{artworkMessage}</p>}

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
                  <select name="style" value={artworkForm.style} onChange={handleArtworkChange}>
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>File Karya (Gambar)</label>
                  <input type="file" accept="image/*" onChange={handleArtworkFileChange} />
                </div>

                {artworkPreview && (
                  <div className="artwork-preview-wrapper">
                    <img src={artworkPreview} alt="Preview karya" className="artwork-preview-img" />
                  </div>
                )}

                <button type="submit" className="btn-primary-black" disabled={artworkLoading}>
                  {artworkLoading ? "Mengupload..." : "Upload ke Gallery"}
                </button>
              </form>

              <hr style={{ margin: "24px 0", borderColor: "#eee" }} />

              <h2>Karyaku di Gallery</h2>
              <p className="profile-card-subtitle">
                Daftar karya yang sudah kamu upload ke Gallery. Kamu bisa edit atau hapus.
              </p>

              {myArtworksError && <p className="form-error">{myArtworksError}</p>}
              {myArtworksLoading && <p>Memuat data karya...</p>}

              {!myArtworksLoading && myArtworks.length === 0 && (
                <p className="profile-card-subtitle">Kamu belum mengupload karya apa pun ke Gallery.</p>
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
                                <img src={art.image_url} alt={art.title} className="artwork-thumb-img" />
                              </div>
                            </td>

                            <td>
                              {isEditing ? (
                                <input type="text" name="title" value={editForm.title} onChange={handleEditFormChange} />
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
                                <span className="artwork-desc">{art.description || "-"}</span>
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <select name="style" value={editForm.style} onChange={handleEditFormChange}>
                                  {STYLE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                art.style || "-"
                              )}
                            </td>

                            <td>{new Date(art.created_at).toLocaleDateString("id-ID")}</td>

                            <td>
                              {isEditing ? (
                                <div className="table-actions">
                                  <button type="button" className="btn-small" onClick={() => handleSaveEdit(art.id)}>
                                    Simpan
                                  </button>
                                  <button type="button" className="btn-small" onClick={handleCancelEdit}>
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="table-actions">
                                  <button type="button" className="btn-small" onClick={() => handleStartEdit(art)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-small btn-small-danger"
                                    onClick={() => handleDeleteArtwork(art.id)}
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
          )}

          {/* ===== TAB SELL (FOR SALE) ===== */}
          {activeTab === "sell" && (
            <section className="profile-card">
              <h2>Jual Karya (For Sale)</h2>
              <p className="profile-card-subtitle">
                Upload karya untuk dijual. Tombol Make an Offer di detail akan mengarah ke WhatsApp kamu (nomor WA dari profil).
              </p>

              {artworkError && <p className="form-error">{artworkError}</p>}
              {artworkMessage && <p className="form-success">{artworkMessage}</p>}

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

                <div className="form-group">
                  <label>Style</label>
                  <select name="style" value={artworkForm.style} onChange={handleArtworkChange}>
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group-half">
                    <label>Harga (IDR)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Contoh: 2500000"
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

                <div className="form-row">
                  <div className="form-group-half">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      name="height_cm"
                      placeholder="Contoh: 60"
                      value={artworkForm.height_cm}
                      onChange={handleArtworkChange}
                    />
                  </div>

                  <div className="form-group-half">
                    <label>Width (cm)</label>
                    <input
                      type="number"
                      name="width_cm"
                      placeholder="Contoh: 90"
                      value={artworkForm.width_cm}
                      onChange={handleArtworkChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>File Karya (Gambar)</label>
                  <input type="file" accept="image/*" onChange={handleArtworkFileChange} />
                </div>

                {artworkPreview && (
                  <div className="artwork-preview-wrapper">
                    <img src={artworkPreview} alt="Preview karya" className="artwork-preview-img" />
                  </div>
                )}

                <button type="submit" className="btn-primary-black" disabled={artworkLoading}>
                  {artworkLoading ? "Mengupload..." : "Upload & Jual Karya"}
                </button>
              </form>

              <hr style={{ margin: "24px 0", borderColor: "#eee" }} />

              <h2>Karyaku di For Sale</h2>
              <p className="profile-card-subtitle">
                Ini daftar karya yang kamu jual. Bisa edit/hapus.
              </p>

              {myForSaleError && <p className="form-error">{myForSaleError}</p>}
              {myForSaleLoading && <p>Memuat data for sale...</p>}

              {!myForSaleLoading && myForSale.length === 0 && (
                <p className="profile-card-subtitle">Kamu belum mengupload karya untuk dijual.</p>
              )}

              {!myForSaleLoading && myForSale.length > 0 && (
                <div className="artwork-table-wrapper">
                  <table className="artwork-table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Judul</th>
                        <th>Harga</th>
                        <th>Ukuran</th>
                        <th>Style</th>
                        <th>Kategori</th>
                        <th>Dibuat</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {myForSale.map((art) => {
                        const isEditing = editingForSaleId === art.id;

                        return (
                          <tr key={art.id}>
                            <td>
                              <div className="artwork-thumb">
                                <img src={art.image_url} alt={art.title} className="artwork-thumb-img" />
                              </div>
                            </td>

                            <td style={{ minWidth: 180 }}>
                              {isEditing ? (
                                <>
                                  <input
                                    type="text"
                                    name="title"
                                    value={editForSaleForm.title}
                                    onChange={handleEditForSaleChange}
                                    style={{ marginBottom: 6, width: "100%" }}
                                  />
                                  <textarea
                                    name="description"
                                    rows={2}
                                    value={editForSaleForm.description}
                                    onChange={handleEditForSaleChange}
                                    style={{ width: "100%" }}
                                  />
                                </>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 600 }}>{art.title}</div>
                                  <div className="artwork-desc">{art.description || "-"}</div>
                                </>
                              )}
                            </td>

                            <td style={{ minWidth: 120 }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  name="price"
                                  value={editForSaleForm.price}
                                  onChange={handleEditForSaleChange}
                                />
                              ) : (
                                <span>{art.price ? `Rp ${Number(art.price).toLocaleString("id-ID")}` : "-"}</span>
                              )}
                            </td>

                            <td style={{ minWidth: 140 }}>
                              {isEditing ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <input
                                    type="number"
                                    name="height_cm"
                                    value={editForSaleForm.height_cm}
                                    onChange={handleEditForSaleChange}
                                    placeholder="H"
                                    style={{ width: 70 }}
                                  />
                                  <input
                                    type="number"
                                    name="width_cm"
                                    value={editForSaleForm.width_cm}
                                    onChange={handleEditForSaleChange}
                                    placeholder="W"
                                    style={{ width: 70 }}
                                  />
                                </div>
                              ) : (
                                <span>
                                  {(art.height_cm ?? "-")} x {(art.width_cm ?? "-")} cm
                                </span>
                              )}
                            </td>

                            <td style={{ minWidth: 120 }}>
                              {isEditing ? (
                                <select name="style" value={editForSaleForm.style} onChange={handleEditForSaleChange}>
                                  {STYLE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                art.style || "-"
                              )}
                            </td>

                            <td style={{ minWidth: 160 }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="category"
                                  value={editForSaleForm.category}
                                  onChange={handleEditForSaleChange}
                                />
                              ) : (
                                art.category || "-"
                              )}
                            </td>

                            <td>{new Date(art.created_at).toLocaleDateString("id-ID")}</td>

                            <td>
                              {isEditing ? (
                                <div className="table-actions">
                                  <button type="button" className="btn-small" onClick={() => handleSaveEditForSale(art.id)}>
                                    Simpan
                                  </button>
                                  <button type="button" className="btn-small" onClick={handleCancelEditForSale}>
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="table-actions">
                                  <button type="button" className="btn-small" onClick={() => handleStartEditForSale(art)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-small btn-small-danger"
                                    onClick={() => handleDeleteForSale(art.id)}
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
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
