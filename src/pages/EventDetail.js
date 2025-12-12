// src/pages/EventDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./EventDetail.css";

// ICON LOKASI (pastikan file ada di src/assets/Vector.png)
import LocationIcon from "../assets/Vector.png";

const API_BASE_URL = "http://localhost:5000";

// helper: format range tanggal
const formatDateRange = (start, end) => {
  if (!start && !end) return "-";

  try {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    if (s && e) {
      const opt = { day: "2-digit", month: "long", year: "numeric" };
      const sText = s.toLocaleDateString("id-ID", opt);
      const eText = e.toLocaleDateString("id-ID", opt);
      if (sText === eText) return sText;
      return `${sText} - ${eText}`;
    }

    const only = (s || e).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return only;
  } catch {
    return start || end || "-";
  }
};

// helper: format range waktu
const formatTimeRange = (start, end) => {
  if (!start && !end) return "-";

  try {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    const opt = { hour: "2-digit", minute: "2-digit" };

    if (s && e) {
      const sText = s.toLocaleTimeString("id-ID", opt);
      const eText = e.toLocaleTimeString("id-ID", opt);
      return `${sText} - ${eText} WIB`;
    }

    const only = (s || e).toLocaleTimeString("id-ID", opt);
    return `${only} WIB`;
  } catch {
    return "-";
  }
};

const formatRupiah = (num) => {
  const n = Number(num || 0);
  return "Rp " + n.toLocaleString("id-ID");
};

// split "Main, Detail" dari string gabungan
const splitLocation = (location) => {
  const raw = (location || "").trim();
  if (!raw) return { main: "-", detail: "-" };
  const idx = raw.indexOf(",");
  if (idx === -1) return { main: raw, detail: "-" };
  return {
    main: raw.slice(0, idx).trim() || "-",
    detail: raw.slice(idx + 1).trim() || "-",
  };
};

const EventDetail = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Gagal mengambil detail event.");

        const backend = data.event || {};
        const backendTickets = data.tickets || [];

        // cari harga minimum "start from"
        let minPrice = null;
        if (backendTickets.length > 0) {
          minPrice = backendTickets.reduce((acc, t) => {
            const priceNum = Number(t.price);
            if (Number.isNaN(priceNum)) return acc;
            if (acc == null) return priceNum;
            return priceNum < acc ? priceNum : acc;
          }, null);
        }

        // ✅ lokasi: PRIORITAS field terpisah (kalau backend punya)
        // fallback ke split dari backend.location
        const locFromCombined = splitLocation(backend.location);
        const locMain = (backend.location_main || locFromCombined.main || "-").trim() || "-";
        const locDetail = (backend.location_detail || locFromCombined.detail || "-").trim() || "-";

        // gallery photos max 4
        const galleryArray = Array.isArray(backend.gallery_photos)
          ? backend.gallery_photos.slice(0, 4)
          : [];

        const mapped = {
          id: backend.id,
          title: backend.title,
          price: minPrice != null ? formatRupiah(minPrice) : "Rp 0",
          description:
            backend.about ||
            "Deskripsi event belum diisi. Hubungi penyelenggara untuk informasi lebih lanjut.",
          organizer: backend.organizer_name || "HeArt",
          organizerImg: backend.organizer_logo_url || "/images/default-organizer.png",
          date: formatDateRange(backend.start_datetime, backend.end_datetime),
          time: formatTimeRange(backend.start_datetime, backend.end_datetime),

          locationMain: locMain,
          locationDetail: locDetail,

          poster: backend.poster_url || "/images/9.png",
          gallery: galleryArray,
        };

        setEvent(mapped);
        setTickets(backendTickets);
      } catch (err) {
        console.error("fetchEvent error:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-container">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-container">
          <div className="breadcrumb-container">
            <Link to="/event">Events</Link> / <span>Detail</span>
          </div>
          <p style={{ color: "#d11a2a", fontSize: 13 }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="detail-page-wrapper">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <Link to="/event">Events</Link> / <span>Detail</span>
      </div>

      <div className="detail-container">
        {/* BAGIAN ATAS */}
        <div className="detail-top-section">
          {/* Poster */}
          <div className="detail-poster-col">
            <img src={event.poster} alt="Poster" className="main-poster" />
          </div>

          {/* Info Tengah */}
          <div className="detail-info-col">
            <h1 className="main-title">{event.title}</h1>

            <div className="price-rating-box">
              <div className="price-block">
                <span className="label-small">Start From</span>
                <h2 className="price-text">{event.price}</h2>
              </div>
            </div>

            {/* List jenis tiket (opsional) */}
            {tickets.length > 0 && (
              <div className="ticket-types-chip-row">
                {tickets.map((t) => (
                  <span key={t.id} className="ticket-chip">
                    {t.ticket_type} – {formatRupiah(t.price)}
                    {t.quota != null ? ` • Quota: ${t.quota}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Kanan */}
          <div className="detail-sidebar-col">
            {/* Date */}
            <div className="info-card">
              <h3>Date and Time</h3>
              <div className="info-content">
                <p className="highlight-text">{event.date}</p>
                <p className="sub-text">{event.time}</p>
              </div>
            </div>

            {/* Location */}
            <div className="info-card">
              <h3>Location</h3>
              <div className="info-content location-flex">
                <div className="loc-icon-wrapper">
                  <img src={LocationIcon} alt="Location" className="loc-icon" />
                </div>
                <div>
                  <p className="highlight-text">{event.locationMain}</p>
                  <p className="sub-text">{event.locationDetail}</p>
                </div>
              </div>
            </div>

            {/* Button View Ticket */}
            <Link to={`/event/${id}/buy`} className="btn-view-ticket-link">
              <button className="btn-view-ticket">View Ticket</button>
            </Link>
          </div>
        </div>

        {/* MAPS DIHAPUS */}

        {/* PHOTOS (gallery dari DB) */}
        {event.gallery && event.gallery.length > 0 && (
          <div className="detail-section">
            <h3 className="section-heading">Photos</h3>
            <div className="photos-grid">
              {event.gallery.map((url, index) => (
                <img key={index} src={url} alt={`Gallery ${index + 1}`} className="gallery-img" />
              ))}
            </div>
          </div>
        )}

        {/* ABOUT EVENT + ORGANIZER */}
        <div className="detail-section last-section">
          <h3 className="section-heading">About Event</h3>
          <p className="about-text">{event.description}</p>

          <div className="organizer-profile">
            <img src={event.organizerImg} alt={event.organizer} className="org-avatar" />
            <span className="org-name">{event.organizer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
