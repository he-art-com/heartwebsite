// src/pages/AdminDashboard.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE_URL = "http://localhost:5000";

// ==================== HELPERS ====================

const getAuthJsonHeaders = () => {
  const token = localStorage.getItem("heart_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// ✅ NEW: aman untuk parse response JSON (kalau server balikin HTML, kita kasih error yang jelas)
async function readJsonResponse(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  const text = await res.text(); // biasanya berisi <!DOCTYPE html>...
  throw new Error(
    `Server mengembalikan non-JSON (status ${res.status}). Response awal: ${text.slice(
      0,
      180
    )}`
  );
}

const toDateInputValue = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const toTimeInputValue = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
};

const formatCurrency = (value) => {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

// split "Main, Detail"
const splitLocation = (location) => {
  const raw = (location || "").trim();
  if (!raw) return { main: "", detail: "" };
  const idx = raw.indexOf(",");
  if (idx === -1) return { main: raw, detail: "" };
  return {
    main: raw.slice(0, idx).trim(),
    detail: raw.slice(idx + 1).trim(),
  };
};

// gabung location main + detail jadi 1 string
const joinLocation = (main, detail) => {
  const m = (main || "").trim();
  const d = (detail || "").trim();
  if (!m && !d) return "";
  if (m && d) return `${m}, ${d}`;
  return m || d;
};

// ==================== MAIN COMPONENT ====================

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ✅ tambah tab for_sale
  const [activeTab, setActiveTab] = useState("users");

  // ===== USERS =====
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // ===== ARTWORKS (GALLERY) =====
  const [artworks, setArtworks] = useState([]);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [artworksError, setArtworksError] = useState("");
  const [artworkSearch, setArtworkSearch] = useState("");

  // ===== FOR SALE (NEW) =====
  const [forSaleList, setForSaleList] = useState([]);
  const [forSaleLoading, setForSaleLoading] = useState(false);
  const [forSaleError, setForSaleError] = useState("");
  const [forSaleSearch, setForSaleSearch] = useState("");

  // ===== EVENTS =====
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const [editingEventId, setEditingEventId] = useState(null);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState("");

  // ===== FORM EVENT BARU / EDIT =====
  const [newEvent, setNewEvent] = useState({
    title: "",
    location_main: "",
    location_detail: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    organizer_name: "",
    organizer_whatsapp: "",
    about: "",
  });

  // file upload utama
  const [posterFile, setPosterFile] = useState(null);
  const [qrisFile, setQrisFile] = useState(null);
  const [organizerLogoFile, setOrganizerLogoFile] = useState(null);

  // preview image utama
  const [posterPreview, setPosterPreview] = useState("");
  const [qrisPreview, setQrisPreview] = useState("");
  const [organizerLogoPreview, setOrganizerLogoPreview] = useState("");

  // ===== FOTO TAMBAHAN EVENT (MAX 4) =====
  const [eventPhotoFiles, setEventPhotoFiles] = useState([]); // File[]
  const [eventPhotoPreviews, setEventPhotoPreviews] = useState([]); // string[]

  const onPickEventPhotos = (filesLike) => {
    const picked = Array.from(filesLike || []);
    if (picked.length === 0) return;

    const merged = [...eventPhotoFiles, ...picked].slice(0, 4);

    eventPhotoPreviews.forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });

    setEventPhotoFiles(merged);
    setEventPhotoPreviews(merged.map((f) => URL.createObjectURL(f)));
  };

  const removeEventPhotoAt = (idx) => {
    const nextFiles = eventPhotoFiles.filter((_, i) => i !== idx);

    eventPhotoPreviews.forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });

    setEventPhotoFiles(nextFiles);
    setEventPhotoPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
  };

  // multi tickets
  const [ticketRows, setTicketRows] = useState([{ type: "", price: "", quota: "" }]);

  const [globalError, setGlobalError] = useState("");

  // ==================== LOAD DATA ====================

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: getAuthJsonHeaders(),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal memuat users.");
      setUsers(data.users || []);
    } catch (err) {
      console.error("loadUsers error:", err);
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ✅ gallery only
  const loadArtworks = useCallback(async () => {
    try {
      setArtworksLoading(true);
      setArtworksError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/artworks`, {
        headers: getAuthJsonHeaders(),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal memuat artworks.");

      const list = (data.artworks || []).filter((a) => {
        if (!a.mode) return true;
        return String(a.mode).toLowerCase() !== "for_sale";
      });

      setArtworks(list);
    } catch (err) {
      console.error("loadArtworks error:", err);
      setArtworksError(err.message);
    } finally {
      setArtworksLoading(false);
    }
  }, []);

  // ✅ NEW: load for sale list
  const loadForSale = useCallback(async () => {
    try {
      setForSaleLoading(true);
      setForSaleError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/for-sale`, {
        headers: getAuthJsonHeaders(),
      });

      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal memuat for sale.");

      setForSaleList(data.artworks || data.items || []);
    } catch (err) {
      console.error("loadForSale error:", err);
      setForSaleError(err.message);
    } finally {
      setForSaleLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      setEventsError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: getAuthJsonHeaders(),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal memuat events.");
      setEvents(data.events || []);
    } catch (err) {
      console.error("loadEvents error:", err);
      setEventsError(err.message);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    setGlobalError("");
    if (activeTab === "users") loadUsers();
    else if (activeTab === "artworks") loadArtworks();
    else if (activeTab === "for_sale") loadForSale();
    else if (activeTab === "events") loadEvents();
  }, [activeTab, loadUsers, loadArtworks, loadForSale, loadEvents]);

  // ==================== USERS ====================

  const toggleBanUser = async (user) => {
    try {
      setGlobalError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/ban`, {
        method: "PATCH",
        headers: getAuthJsonHeaders(),
        body: JSON.stringify({ is_banned: !user.is_banned }),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal update status ban user.");
      await loadUsers();
    } catch (err) {
      console.error("toggleBanUser error:", err);
      setGlobalError(err.message);
    }
  };

  // ==================== ARTWORKS (GALLERY) ====================

  const deleteArtwork = async (art) => {
    if (!window.confirm(`Hapus karya "${art.title}"?`)) return;
    try {
      setGlobalError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/artworks/${art.id}`, {
        method: "DELETE",
        headers: getAuthJsonHeaders(),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal menghapus karya.");
      await loadArtworks();
    } catch (err) {
      console.error("deleteArtwork error:", err);
      setGlobalError(err.message);
    }
  };

  // ==================== FOR SALE (NEW) ====================

  const deleteForSale = async (item) => {
    const title = item.title || "item";
    if (!window.confirm(`Hapus for sale "${title}"?`)) return;

    try {
      setGlobalError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/for-sale/${item.id}`, {
        method: "DELETE",
        headers: getAuthJsonHeaders(),
      });

      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal menghapus for sale.");

      await loadForSale();
    } catch (err) {
      console.error("deleteForSale error:", err);
      setGlobalError(err.message);
    }
  };

  // ==================== TICKET FORM ====================

  const handleTicketChange = (index, field, value) => {
    setTicketRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addTicketRow = () => setTicketRows((prev) => [...prev, { type: "", price: "", quota: "" }]);
  const removeTicketRow = (index) => setTicketRows((prev) => prev.filter((_, i) => i !== index));

  // ==================== EVENTS ====================

  const resetEventForm = () => {
    setEditingEventId(null);
    setNewEvent({
      title: "",
      location_main: "",
      location_detail: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      organizer_name: "",
      organizer_whatsapp: "",
      about: "",
    });

    setPosterFile(null);
    setQrisFile(null);
    setOrganizerLogoFile(null);

    setPosterPreview("");
    setQrisPreview("");
    setOrganizerLogoPreview("");

    eventPhotoPreviews.forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    setEventPhotoFiles([]);
    setEventPhotoPreviews([]);

    setTicketRows([{ type: "", price: "", quota: "" }]);
  };

  const createOrUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      setGlobalError("");

      const locationCombined = joinLocation(newEvent.location_main, newEvent.location_detail);

      if (!newEvent.title || !locationCombined || !newEvent.start_date || !newEvent.start_time) {
        setGlobalError("Title, lokasi (main/detail), dan start date/time wajib diisi.");
        return;
      }

      if (!editingEventId) {
        if (!posterFile) return setGlobalError("Poster event wajib diupload.");
        if (!qrisFile) return setGlobalError("QRIS image wajib diupload.");
      }

      const ticketsPayload = ticketRows.filter((t) => t.type.trim() !== "" && t.price.trim() !== "");
      if (ticketsPayload.length === 0) {
        setGlobalError("Minimal harus ada 1 jenis tiket.");
        return;
      }

      const startIso = new Date(`${newEvent.start_date}T${newEvent.start_time}:00`).toISOString();

      let endIso = null;
      if (newEvent.end_date && newEvent.end_time) {
        endIso = new Date(`${newEvent.end_date}T${newEvent.end_time}:00`).toISOString();
      }

      const formData = new FormData();
      formData.append("title", newEvent.title);

      // kirim gabungan + terpisah
      formData.append("location", locationCombined);
      formData.append("location_main", (newEvent.location_main || "").trim());
      formData.append("location_detail", (newEvent.location_detail || "").trim());

      formData.append("start_datetime", startIso);
      if (endIso) formData.append("end_datetime", endIso);

      formData.append("about", newEvent.about || "");
      formData.append("organizer_name", newEvent.organizer_name || "");
      formData.append("organizer_whatsapp", newEvent.organizer_whatsapp || "");

      if (posterFile) formData.append("poster", posterFile);
      if (qrisFile) formData.append("qris", qrisFile);
      if (organizerLogoFile) formData.append("organizer_logo", organizerLogoFile);

      eventPhotoFiles.forEach((f) => formData.append("photos", f));
      formData.append("tickets", JSON.stringify(ticketsPayload));

      const token = localStorage.getItem("heart_token");
      const url = editingEventId
        ? `${API_BASE_URL}/api/admin/events/${editingEventId}`
        : `${API_BASE_URL}/api/admin/events`;
      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan event.");

      resetEventForm();
      await loadEvents();
    } catch (err) {
      console.error("createOrUpdateEvent error:", err);
      setGlobalError(err.message);
    }
  };

  const handleEditEvent = (ev) => {
    if (!ev) return;

    const locFromCombined = splitLocation(ev.location);
    const loc = {
      main: ev.location_main || locFromCombined.main || "",
      detail: ev.location_detail || locFromCombined.detail || "",
    };

    setEditingEventId(ev.id);
    setNewEvent({
      title: ev.title || "",
      location_main: loc.main || "",
      location_detail: loc.detail || "",
      start_date: toDateInputValue(ev.start_datetime),
      start_time: toTimeInputValue(ev.start_datetime),
      end_date: toDateInputValue(ev.end_datetime),
      end_time: toTimeInputValue(ev.end_datetime),
      organizer_name: ev.organizer_name || "",
      organizer_whatsapp: ev.organizer_whatsapp || "",
      about: ev.about || "",
    });

    setTicketRows(
      Array.isArray(ev.tickets) && ev.tickets.length > 0
        ? ev.tickets.map((t) => ({
            type: t.ticket_type,
            price: String(t.price),
            quota: t.quota != null ? String(t.quota) : "",
          }))
        : [{ type: "", price: "", quota: "" }]
    );

    setPosterFile(null);
    setQrisFile(null);
    setOrganizerLogoFile(null);

    setPosterPreview(ev.poster_url || "");
    setQrisPreview(ev.qris_image_url || "");
    setOrganizerLogoPreview(ev.organizer_logo_url || "");

    eventPhotoPreviews.forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    setEventPhotoFiles([]);
    setEventPhotoPreviews([]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Hapus event "${event.title}"?`)) return;

    try {
      setGlobalError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${event.id}`, {
        method: "DELETE",
        headers: getAuthJsonHeaders(),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal menghapus event.");

      await loadEvents();
      if (editingEventId === event.id) resetEventForm();
      if (selectedEventId === event.id) {
        setSelectedEventId(null);
        setEventDetail(null);
        setEventDetailError("");
      }
    } catch (err) {
      console.error("deleteEvent error:", err);
      setGlobalError(err.message);
    }
  };

  const handleShowEventDetail = async (ev) => {
    const id = ev.id;
    setSelectedEventId(id);
    setEventDetail(null);
    setEventDetailLoading(true);
    setEventDetailError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || "Gagal memuat detail event.");

      setEventDetail({
        ...data.event,
        tickets: data.tickets || [],
        photos: data.photos || data.photo_urls || [],
      });
    } catch (err) {
      console.error("handleShowEventDetail error:", err);
      setEventDetailError(err.message);
    } finally {
      setEventDetailLoading(false);
    }
  };

  // ==================== LOGOUT ====================

  const handleLogout = () => {
    localStorage.removeItem("heart_token");
    localStorage.removeItem("heart_user");
    navigate("/login");
  };

  // ==================== FILTERS ====================

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.nickname && u.nickname.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch]);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((a) => {
      if (!artworkSearch.trim()) return true;
      const q = artworkSearch.toLowerCase();
      const artistName = (a.nickname || a.full_name || a.email || "").toLowerCase();
      return (a.title && a.title.toLowerCase().includes(q)) || artistName.includes(q);
    });
  }, [artworks, artworkSearch]);

  const filteredForSale = useMemo(() => {
    return forSaleList.filter((a) => {
      if (!forSaleSearch.trim()) return true;
      const q = forSaleSearch.toLowerCase();
      const artistName = (a.nickname || a.full_name || a.email || a.artist_name || "").toLowerCase();
      const title = (a.title || "").toLowerCase();
      const category = (a.category || "").toLowerCase();
      return title.includes(q) || artistName.includes(q) || category.includes(q);
    });
  }, [forSaleList, forSaleSearch]);

  const baseEvent =
    selectedEventId != null ? events.find((e) => e.id === selectedEventId) || null : null;

  const detailData = eventDetail || baseEvent || null;

  // ==================== RENDER ====================

  return (
    <div className="admin-page container">
      <div className="admin-header-bar">
        <h1 className="admin-title">Admin Panel</h1>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {globalError && <p className="admin-global-error">Error: {globalError}</p>}

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "is-active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "artworks" ? "is-active" : ""}`}
          onClick={() => setActiveTab("artworks")}
        >
          Artworks (Gallery)
        </button>

        {/* ✅ TAB BARU */}
        <button
          className={`admin-tab-btn ${activeTab === "for_sale" ? "is-active" : ""}`}
          onClick={() => setActiveTab("for_sale")}
        >
          For Sale
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "events" ? "is-active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
      </div>

      {/* USERS */}
      {activeTab === "users" && (
        <section className="admin-section">
          <h2 className="admin-section-title">Manage Users</h2>

          <div className="admin-search-row">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by email / name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {usersLoading && <p>Loading users...</p>}
          {usersError && <p className="admin-error">{usersError}</p>}

          {!usersLoading && !usersError && filteredUsers.length === 0 && (
            <p className="admin-empty">Tidak ada user.</p>
          )}

          {!usersLoading && filteredUsers.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.full_name || u.nickname || "-"}</td>
                    <td>{u.role}</td>
                    <td>{u.is_banned ? "BANNED" : "Active"}</td>
                    <td>
                      {u.role === "admin" ? (
                        <span style={{ fontSize: 12, color: "#777" }}>
                          (admin tidak bisa diban)
                        </span>
                      ) : (
                        <button className="admin-small-btn" onClick={() => toggleBanUser(u)}>
                          {u.is_banned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ARTWORKS (GALLERY) */}
      {activeTab === "artworks" && (
        <section className="admin-section">
          <h2 className="admin-section-title">Manage Gallery Artworks</h2>

          <div className="admin-search-row">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by title / artist..."
              value={artworkSearch}
              onChange={(e) => setArtworkSearch(e.target.value)}
            />
          </div>

          {artworksLoading && <p>Loading artworks...</p>}
          {artworksError && <p className="admin-error">{artworksError}</p>}

          {!artworksLoading && !artworksError && filteredArtworks.length === 0 && (
            <p className="admin-empty">Tidak ada karya gallery.</p>
          )}

          {!artworksLoading && filteredArtworks.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtworks.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.image_url ? (
                        <img
                          src={a.image_url}
                          alt={a.title ? `Karya: ${a.title}` : "Karya"}
                          className="admin-artwork-thumb"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{a.id}</td>
                    <td>{a.title}</td>
                    <td>{a.nickname || a.full_name || a.email}</td>
                    <td>{a.status}</td>
                    <td>{formatDateTime(a.created_at)}</td>
                    <td>
                      {a.status === "deleted" ? (
                        <span style={{ fontSize: 12, color: "#777" }}>(sudah deleted)</span>
                      ) : (
                        <button
                          className="admin-small-btn admin-small-btn-danger"
                          onClick={() => deleteArtwork(a)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ✅ FOR SALE (NEW TAB) */}
      {activeTab === "for_sale" && (
        <section className="admin-section">
          <h2 className="admin-section-title">Manage For Sale</h2>

          <div className="admin-search-row">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by title / artist / category..."
              value={forSaleSearch}
              onChange={(e) => setForSaleSearch(e.target.value)}
            />
          </div>

          {forSaleLoading && <p>Loading for sale...</p>}
          {forSaleError && <p className="admin-error">{forSaleError}</p>}

          {!forSaleLoading && !forSaleError && filteredForSale.length === 0 && (
            <p className="admin-empty">Tidak ada karya for sale.</p>
          )}

          {!forSaleLoading && filteredForSale.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredForSale.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.image_url ? (
                        <img
                          src={a.image_url}
                          alt={a.title ? `For sale: ${a.title}` : "For sale"}
                          className="admin-artwork-thumb"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{a.id}</td>
                    <td>{a.title || "-"}</td>
                    <td>{a.nickname || a.full_name || a.email || a.artist_name || "-"}</td>
                    <td>{a.category || "-"}</td>
                    <td>{formatCurrency(a.price)}</td>
                    <td>{a.status || "active"}</td>
                    <td>{formatDateTime(a.created_at)}</td>
                    <td>
                      {String(a.status).toLowerCase() === "deleted" ? (
                        <span style={{ fontSize: 12, color: "#777" }}>(sudah deleted)</span>
                      ) : (
                        <button
                          className="admin-small-btn admin-small-btn-danger"
                          onClick={() => deleteForSale(a)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* EVENTS */}
      {activeTab === "events" && (
        <section className="admin-section">
          <h2 className="admin-section-title">Manage Events</h2>

          <form className="admin-event-form" onSubmit={createOrUpdateEvent}>
            <div className="admin-form-row">
              <label>
                Title
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </label>

              <label>
                Location (Main)
                <input
                  type="text"
                  value={newEvent.location_main}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, location_main: e.target.value }))
                  }
                  placeholder="Misal: Grand City Mall"
                  required
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                Location (Detail)
                <input
                  type="text"
                  value={newEvent.location_detail}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, location_detail: e.target.value }))
                  }
                  placeholder="Misal: Jl. Kusuma Bangsa No.1, Surabaya"
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                Start Date
                <input
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, start_date: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Start Time
                <input
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, start_time: e.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                End Date
                <input
                  type="date"
                  value={newEvent.end_date}
                  onChange={(e) => setNewEvent((p) => ({ ...p, end_date: e.target.value }))}
                />
              </label>
              <label>
                End Time
                <input
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent((p) => ({ ...p, end_time: e.target.value }))}
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                Organizer Name
                <input
                  type="text"
                  value={newEvent.organizer_name}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, organizer_name: e.target.value }))
                  }
                />
              </label>
              <label>
                Organizer WhatsApp
                <input
                  type="text"
                  value={newEvent.organizer_whatsapp}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, organizer_whatsapp: e.target.value }))
                  }
                  placeholder="62812xxxxxx"
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                Poster (image)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setPosterFile(file);
                    setPosterPreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt={newEvent.title ? `Poster ${newEvent.title}` : "Poster event"}
                    style={{
                      display: "block",
                      marginTop: 8,
                      maxWidth: 200,
                      height: "auto",
                    }}
                  />
                )}
              </label>

              <label>
                QRIS Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setQrisFile(file);
                    setQrisPreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                {qrisPreview && (
                  <img
                    src={qrisPreview}
                    alt={newEvent.title ? `QRIS ${newEvent.title}` : "QRIS"}
                    style={{
                      display: "block",
                      marginTop: 8,
                      maxWidth: 200,
                      height: "auto",
                    }}
                  />
                )}
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                Organizer Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setOrganizerLogoFile(file);
                    setOrganizerLogoPreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                {organizerLogoPreview && (
                  <img
                    src={organizerLogoPreview}
                    alt={
                      newEvent.organizer_name
                        ? `Logo ${newEvent.organizer_name}`
                        : "Logo organizer"
                    }
                    style={{
                      display: "block",
                      marginTop: 8,
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                    }}
                  />
                )}
              </label>
            </div>

            {/* FOTO TAMBAHAN (MAX 4) */}
            <div className="admin-form-row">
              <label style={{ width: "100%" }}>
                Event Photos (Max 4)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickEventPhotos(e.target.files)}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {eventPhotoPreviews.map((url, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <img
                        src={url}
                        alt={
                          newEvent.title
                            ? `Dokumentasi ${newEvent.title} #${idx + 1}`
                            : `Dokumentasi #${idx + 1}`
                        }
                        style={{
                          width: 120,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeEventPhotoAt(idx)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <small style={{ display: "block", marginTop: 6, color: "#777" }}>
                  Kamu bisa pilih beberapa file sekaligus. Total maksimal 4.
                </small>
              </label>
            </div>

            <div className="admin-form-row">
              <label>
                About Event
                <textarea
                  rows={3}
                  value={newEvent.about}
                  onChange={(e) => setNewEvent((p) => ({ ...p, about: e.target.value }))}
                />
              </label>
            </div>

            {/* MULTI TICKET TYPES */}
            <div className="admin-form-row" style={{ flexDirection: "column" }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Ticket Types</label>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Quota</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ticketRows.map((t, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={t.type}
                          onChange={(e) => handleTicketChange(idx, "type", e.target.value)}
                          placeholder="Reguler / VIP / VVIP..."
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) => handleTicketChange(idx, "price", e.target.value)}
                          placeholder="Harga"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={t.quota}
                          onChange={(e) => handleTicketChange(idx, "quota", e.target.value)}
                          placeholder="Quota (optional)"
                        />
                      </td>
                      <td>
                        {ticketRows.length > 1 && (
                          <button
                            type="button"
                            className="admin-small-btn admin-small-btn-danger"
                            onClick={() => removeTicketRow(idx)}
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                className="admin-small-btn"
                onClick={addTicketRow}
                style={{ marginTop: 8 }}
              >
                + Add Ticket Type
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
              <button type="submit" className="admin-submit-btn">
                {editingEventId ? "Update Event" : "Create Event"}
              </button>
              {editingEventId && (
                <button type="button" className="admin-small-btn" onClick={resetEventForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* LIST EVENTS */}
          <h3 className="admin-subtitle">Event List</h3>

          {eventsLoading && <p>Loading events...</p>}
          {eventsError && <p className="admin-error">{eventsError}</p>}

          {!eventsLoading && !eventsError && events.length === 0 && (
            <p className="admin-empty">Belum ada event.</p>
          )}

          {!eventsLoading && events.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td>{ev.id}</td>
                    <td>
                      {ev.poster_url && (
                        <img
                          src={ev.poster_url}
                          alt={ev.title ? `Poster ${ev.title}` : "Poster event"}
                          style={{ maxHeight: 60, width: "auto", borderRadius: 4 }}
                        />
                      )}
                    </td>
                    <td>{ev.title}</td>
                    <td>{ev.location}</td>
                    <td>{formatDateTime(ev.start_datetime)}</td>
                    <td>{formatDateTime(ev.end_datetime)}</td>
                    <td>
                      <button className="admin-small-btn" onClick={() => handleShowEventDetail(ev)}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PANEL DETAIL EVENT */}
          {selectedEventId && (
            <div className="admin-event-detail-panel">
              <h3 className="admin-subtitle">Detail Event</h3>

              {eventDetailLoading && <p>Loading event detail...</p>}
              {eventDetailError && <p className="admin-error">{eventDetailError}</p>}

              {detailData && !eventDetailLoading && !eventDetailError && (
                <div className="admin-event-detail-grid">
                  <div className="admin-event-detail-left">
                    <p>
                      <strong>Title:</strong> {detailData.title}
                    </p>

                    {(() => {
                      const locFromCombined = splitLocation(detailData.location);
                      const main = detailData.location_main || locFromCombined.main || "-";
                      const detail = detailData.location_detail || locFromCombined.detail || "-";

                      return (
                        <>
                          <p>
                            <strong>Location (Main):</strong> {main || "-"}
                          </p>
                          <p>
                            <strong>Location (Detail):</strong> {detail || "-"}
                          </p>
                          <p>
                            <strong>Location (Full):</strong> {detailData.location || "-"}
                          </p>
                        </>
                      );
                    })()}

                    <p>
                      <strong>Start:</strong> {formatDateTime(detailData.start_datetime)}
                    </p>
                    <p>
                      <strong>End:</strong> {formatDateTime(detailData.end_datetime)}
                    </p>

                    <p>
                      <strong>Organizer:</strong> {detailData.organizer_name || "-"}
                    </p>
                    <p>
                      <strong>Organizer WhatsApp:</strong> {detailData.organizer_whatsapp || "-"}
                    </p>
                    <p>
                      <strong>About:</strong> {detailData.about || "(belum ada deskripsi)"}
                    </p>

                    {Array.isArray(detailData.tickets) && detailData.tickets.length > 0 && (
                      <>
                        <p style={{ marginTop: 12, fontWeight: 600 }}>Tickets:</p>
                        <ul className="admin-event-ticket-list">
                          {detailData.tickets.map((t) => (
                            <li key={t.id}>
                              {t.ticket_type} — {formatCurrency(t.price)}{" "}
                              {t.quota != null ? `(Quota: ${t.quota})` : ""}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {Array.isArray(detailData.photos) && detailData.photos.length > 0 && (
                      <>
                        <p style={{ marginTop: 12, fontWeight: 600 }}>Event Photos:</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {detailData.photos.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={
                                detailData.title
                                  ? `Dokumentasi ${detailData.title} #${idx + 1}`
                                  : `Dokumentasi #${idx + 1}`
                              }
                              style={{
                                width: 140,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button className="admin-small-btn" onClick={() => handleEditEvent(detailData)}>
                        Edit Event
                      </button>
                      <button
                        className="admin-small-btn admin-small-btn-danger"
                        onClick={() => deleteEvent(detailData)}
                      >
                        Delete Event
                      </button>
                      <button
                        className="admin-small-btn"
                        onClick={() => {
                          setSelectedEventId(null);
                          setEventDetail(null);
                          setEventDetailError("");
                        }}
                      >
                        Close Detail
                      </button>
                    </div>
                  </div>

                  <div className="admin-event-detail-right">
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontWeight: 600 }}>Poster</p>
                      {detailData.poster_url ? (
                        <img
                          src={detailData.poster_url}
                          alt={detailData.title ? `Poster ${detailData.title}` : "Poster event"}
                          style={{ maxWidth: 220, borderRadius: 6 }}
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontWeight: 600 }}>QRIS</p>
                      {detailData.qris_image_url ? (
                        <img
                          src={detailData.qris_image_url}
                          alt={detailData.title ? `QRIS ${detailData.title}` : "QRIS"}
                          style={{ maxWidth: 220, borderRadius: 6 }}
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </div>

                    <div>
                      <p style={{ fontWeight: 600 }}>Organizer Logo</p>
                      {detailData.organizer_logo_url ? (
                        <img
                          src={detailData.organizer_logo_url}
                          alt={
                            detailData.organizer_name
                              ? `Logo ${detailData.organizer_name}`
                              : "Logo organizer"
                          }
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
