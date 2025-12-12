// src/pages/Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Event.css";

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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_BASE_URL}/api/events`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat daftar event.");
        }

        setEvents(data.events || []);
      } catch (err) {
        console.error("fetchEvents error:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="events-page-wrapper">
      <div className="event-hero">
        <div className="hero-content">
          <h1>Our Annual Event</h1>
          <p>
            This Art Exhibition is an annual event that we hold to help artists,
            especially local artists, introduce their artworks to the public and
            as part of our efforts to bring our local talents to the world.
          </p>
        </div>
      </div>

      <div className="events-list-container">
        {loading && <p>Loading events...</p>}
        {errorMsg && <p className="event-error">{errorMsg}</p>}

        {!loading && !errorMsg && events.length === 0 && (
          <p style={{ fontSize: 14, color: "#777" }}>
            Belum ada event yang terdaftar.
          </p>
        )}

        {!loading &&
          !errorMsg &&
          events.map((ev) => {
            const dateText = formatDateRange(
              ev.start_datetime,
              ev.end_datetime
            );

            const poster = ev.poster_url || "/images/9.png";

            const description =
              ev.about ||
              "This event description has not been filled in yet. Please check the detail page for more information.";

            const shortDesc =
              description.length > 220
                ? description.slice(0, 217) + "..."
                : description;

            return (
              <div className="event-card" key={ev.id}>
                {/* KIRI: Poster + info singkat */}
                <div className="event-left-col">
                  <div className="event-poster-wrapper">
                    <Link to={`/event/${ev.id}`}>
                      <img
                        src={poster}
                        alt={ev.title}
                        className="event-poster"
                      />
                    </Link>
                  </div>
                  <div className="event-info-box">
                    <h2>{ev.title}</h2>
                    <div className="event-meta">
                      <span>{dateText}</span> <br />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>

                {/* KANAN: Deskripsi pendek */}
                <div className="event-right-col">
                  <p>{shortDesc}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Events;
