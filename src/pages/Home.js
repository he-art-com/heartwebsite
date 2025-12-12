import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

/* fallback images (kalau backend kosong / image_url null) */
import img8 from "../assets/images/8.jpg";
import img10 from "../assets/images/10.jpg";
import fallbackArt from "../assets/images/1.png";
import fallbackEvent from "../assets/images/9.png";
import fallbackArtist from "../assets/images/6.jpg";

const API_BASE_URL = "http://localhost:5000";

function Home() {
  const navigate = useNavigate();

  // ====== STATE: ARTWORKS (Favorites) ======
  const [allArtworks, setAllArtworks] = useState([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState("");

  // ====== STATE: EVENTS (Upcoming) ======
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(false);
  const [evError, setEvError] = useState("");

  // ====== STATE: ARTISTS (Featured) ======
  const [artists, setArtists] = useState([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState("");

  // ====== FAVORITES PAGINATION (3 items per page) ======
  const PER_FAV = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const totalFavPages = useMemo(() => {
    return Math.max(1, Math.ceil(allArtworks.length / PER_FAV));
  }, [allArtworks.length]);

  useEffect(() => {
    if (currentPage > totalFavPages) setCurrentPage(totalFavPages);
  }, [totalFavPages, currentPage]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 1 ? totalFavPages : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalFavPages ? 1 : prev + 1));
  };

  const currentFavArtworks = useMemo(() => {
    if (allArtworks.length === 0) return [];
    const start = (currentPage - 1) * PER_FAV;
    return allArtworks.slice(start, start + PER_FAV);
  }, [allArtworks, currentPage]);

  // ====== FETCH ARTWORKS ======
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setArtLoading(true);
        setArtError("");

        const res = await fetch(`${API_BASE_URL}/api/artworks`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat artworks.");

        setAllArtworks((data.artworks || []).filter(Boolean));
      } catch (err) {
        console.error("fetchArtworks Home error:", err);
        setArtError(err.message || "Terjadi kesalahan saat memuat artworks.");
      } finally {
        setArtLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // ====== FETCH EVENTS ======
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEvLoading(true);
        setEvError("");

        const res = await fetch(`${API_BASE_URL}/api/events`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat events.");

        setEvents((data.events || []).filter(Boolean));
      } catch (err) {
        console.error("fetchEvents Home error:", err);
        setEvError(err.message || "Terjadi kesalahan saat memuat events.");
      } finally {
        setEvLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ====== FETCH ARTISTS ======
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setArtistLoading(true);
        setArtistError("");

        const res = await fetch(`${API_BASE_URL}/api/artists`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat artists.");

        const formatted = (data.artists || []).map((a) => ({
          ...a,
          name: a.nickname || a.full_name || "Unnamed Artist",
        }));

        setArtists(formatted);
      } catch (err) {
        console.error("fetchArtists Home error:", err);
        setArtistError(err.message || "Terjadi kesalahan saat memuat artists.");
      } finally {
        setArtistLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // ====== TOP 3 ARTISTS ======
  const top3Artists = useMemo(() => {
    const arr = [...artists];
    const hasFollowers = arr.some((a) => typeof a.follower_count === "number");
    if (hasFollowers) {
      arr.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0));
    }
    return arr.slice(0, 3);
  }, [artists]);

  // ====== klik Explore => scroll ke favorites ======
  const handleExploreClick = () => {
    const section = document.getElementById("favorites-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // ====== format tanggal event (simple) ======
  const formatDateRange = (start, end) => {
    if (!start && !end) return "-";
    try {
      const s = start ? new Date(start) : null;
      const e = end ? new Date(end) : null;

      const opt = { day: "2-digit", month: "long", year: "numeric" };
      if (s && e) {
        const sText = s.toLocaleDateString("id-ID", opt);
        const eText = e.toLocaleDateString("id-ID", opt);
        return sText === eText ? sText : `${sText} – ${eText}`;
      }

      const only = (s || e).toLocaleDateString("id-ID", opt);
      return only;
    } catch {
      return start || end || "-";
    }
  };

  /**
   * ✅ LOOP PALING AMAN:
   * Track = base + base + base
   * animasi geser -33.333% (1/3 track) -> balik mulus tanpa “kosong”
   */
  const eventSlides = useMemo(() => {
    const base = (events || []).filter(Boolean);
    if (base.length === 0) return [];
    return [...base, ...base, ...base];
  }, [events]);

  return (
    <div className="home">
      {/* ====================== HERO ========================== */}
      <section className="hero">
        <img className="hero-bg" src={img8} alt="HeArt hero banner" />

        <div className="hero-text">
          <h1>Discover and Buy Art That Moves You</h1>
          <p>
            Discover, collect, and connect with artworks that speak to you.
            HeArt makes the art world easier to explore—beautiful, accessible,
            and built for everyone.
          </p>
        </div>
      </section>

      {/* ====================== FAVORITES ========================== */}
      <section className="favorites" id="favorites-section">
        <h2>A few of our favorites</h2>

        {artLoading && (
          <p style={{ color: "#777", fontSize: 13 }}>Loading artworks...</p>
        )}
        {artError && (
          <p style={{ color: "#d11a2a", fontSize: 13 }}>{artError}</p>
        )}

        {!artLoading && !artError && allArtworks.length === 0 && (
          <p style={{ color: "#777", fontSize: 13 }}>
            Belum ada karya yang di-upload. Upload dulu dari Profile Settings.
          </p>
        )}

        {!artLoading && !artError && allArtworks.length > 0 && (
          <>
            <div className="fav-grid">
              {currentFavArtworks.map((art) => (
                <div className="fav-card" key={art.id}>
                  <img
                    src={art.image_url || fallbackArt}
                    alt={art.title ? `Karya: ${art.title}` : "Karya"}
                    onClick={() => navigate("/gallery")}
                    style={{ cursor: "pointer" }}
                  />
                  <p className="title">
                    {art.title || "Untitled"}
                    {(art.nickname || art.full_name)
                      ? ` — ${art.nickname || art.full_name}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="fav-pagination">
              <div className="fav-line" />

              <div className="fav-page-inline">
                <button
                  className="fav-arrow-inline"
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous artworks"
                >
                  &lt;
                </button>

                <span className="fav-page-text-inline">
                  {currentPage} of {totalFavPages}
                </span>

                <button
                  className="fav-arrow-inline"
                  type="button"
                  onClick={handleNext}
                  aria-label="Next artworks"
                >
                  &gt;
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ====================== DISCOVER ARTWORKS ========================== */}
      <section className="discover">
        <img src={img10} alt="Discover banner" className="discover-bg" />

        <div className="discover-text">
          <h2>Discover our Artworks.</h2>
          <p>
            Explore a curated collection of works from creators across eras and
            cultures.
            <br />
            Explore by artist, and more.
          </p>

          <button
            className="discover-explore-btn"
            type="button"
            onClick={handleExploreClick}
          >
            <span className="discover-explore-arrow">→</span>
            <span>Explore by artist, and more</span>
          </button>
        </div>
      </section>

      {/* ====================== UPCOMING EVENTS (LOOP SLIDER) ========================== */}
      <section className="events">
        <div className="events-header-row">
          <h2>Upcoming Events</h2>

          <button
            className="events-see-all"
            type="button"
            onClick={() => navigate("/event")}
          >
            See All Events
          </button>
        </div>

        {evLoading && (
          <p style={{ color: "#777", fontSize: 13 }}>Loading events...</p>
        )}
        {evError && (
          <p style={{ color: "#d11a2a", fontSize: 13 }}>{evError}</p>
        )}

        {!evLoading && !evError && events.length === 0 && (
          <p style={{ color: "#777", fontSize: 13 }}>
            Belum ada event. Tambahkan event dari Admin.
          </p>
        )}

        {!evLoading && !evError && eventSlides.length > 0 && (
          <div className="home-events-carousel" aria-label="Upcoming events">
            <div className="home-events-track home-events-track-animate">
              {eventSlides.map((ev, idx) => {
                const poster = ev.poster_url || fallbackEvent;
                const dateText = formatDateRange(
                  ev.start_datetime,
                  ev.end_datetime
                );

                return (
                  <button
                    type="button"
                    key={`${ev.id}-${idx}`}
                    className="home-event-card"
                    onClick={() => navigate(`/event/${ev.id}`)}
                  >
                    <img
                      src={poster}
                      alt={ev.title ? `Poster ${ev.title}` : "Poster event"}
                      className="home-event-img"
                    />
                    <p className="title">{ev.title || "Untitled Event"}</p>
                    <p className="subtitle">{dateText}</p>
                    <p className="location">{ev.location || "-"}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ====================== FEATURED ARTIST ========================== */}
      <section className="artists">
        <div className="artists-header">
          <h2>Featured Artist</h2>

          <button
            className="see-all-artists"
            type="button"
            onClick={() => navigate("/artists")}
          >
            See All Artists
          </button>
        </div>

        {artistLoading && (
          <p style={{ color: "#777", fontSize: 13 }}>Loading artists...</p>
        )}
        {artistError && (
          <p style={{ color: "#d11a2a", fontSize: 13 }}>{artistError}</p>
        )}

        {!artistLoading && !artistError && top3Artists.length === 0 && (
          <p style={{ color: "#777", fontSize: 13 }}>
            Belum ada artist terdaftar.
          </p>
        )}

        {!artistLoading && !artistError && top3Artists.length > 0 && (
          <div className="artist-grid">
            {top3Artists.map((a) => (
              <div className="artist-card" key={a.id}>
                <img
                  src={a.avatar_url || fallbackArtist}
                  alt={a.name || "Artist"}
                />
                <p className="name">{a.name || "Unnamed Artist"}</p>
                <p className="subtitle">{a.address ? a.address : "—"}</p>
                <button
                  className="view-btn"
                  type="button"
                  onClick={() => navigate("/artists")}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
