// src/pages/Artists.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./Artists.css";
import { useStore } from "../context/StoreContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

// ====== HELPER DESKRIPSI ARTIST ======
const getArtistDescription = (artist) => {
  if (!artist) return "";

  if (artist.name && artist.name.toLowerCase().includes("leonardo")) {
    return (
      "Leonardo da Vinci (1452–1519) was one of the most influential artists " +
      "of the Western world, renowned for masterpieces such as the Mona Lisa and The Last Supper. " +
      "His notebooks reveal a mind fascinated by machines, anatomy, engineering, and natural science."
    );
  }

  return (
    (artist.name || "This artist") +
    " is one of the highlighted artists in our collection. Explore their creative journey, " +
    "signature style, and the stories behind each artwork."
  );
};

// ====== PAGINATION (GAYA SAMA KAYAK GALLERY) ======
const Pagination = ({ currentPage, totalPages, onChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="pagination-section">
      <button
        className="page-arrow-btn"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <span className="page-arrow-icon page-arrow-left" />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          className={`page-number ${
            currentPage === page ? "page-number-active" : ""
          }`}
          onClick={() => goToPage(page)}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </button>
      ))}

      <button
        className="page-arrow-btn"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <span className="page-arrow-icon page-arrow-right" />
      </button>
    </section>
  );
};

const Artists = () => {
  const navigate = useNavigate();

  // ===== VIEW STATE =====
  const [artistPage, setArtistPage] = useState(1); // pagination untuk LIST ARTIST
  const [selectedArtist, setSelectedArtist] = useState(null); // null = list, ada = detail

  // data artists dari backend
  const [artists, setArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(false);
  const [artistsError, setArtistsError] = useState("");

  // artworks untuk 1 artist (halaman detail)
  const [artworks, setArtworks] = useState([]);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [artworksError, setArtworksError] = useState("");
  const [artworkFilter, setArtworkFilter] = useState("all"); // all | gallery | for_sale
  const [artworkPage, setArtworkPage] = useState(1); // pagination karya artist

  // LIGHTBOX
  const [lightboxArtwork, setLightboxArtwork] = useState(null);

  // SORT state (untuk page list)
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState("default");

  const { toggleFollowArtist, isArtistFollowed } = useStore();

  const ARTISTS_PER_PAGE = 9;
  const ARTWORKS_PER_PAGE = 6;

  // ====== FETCH ARTISTS (list) ======
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setArtistsLoading(true);
        setArtistsError("");

        const res = await fetch(`${API_BASE_URL}/api/artists`);
        const data = await res.json();

        if (!res.ok) {
          setArtistsError(data.message || "Failed to load artists.");
          return;
        }

        const formatted = (data.artists || []).map((a) => ({
          ...a,
          name: a.nickname || a.full_name || "Unnamed Artist",
        }));

        setArtists(formatted);
      } catch (err) {
        console.error("Error fetch artists:", err);
        setArtistsError("Terjadi kesalahan saat mengambil data artists.");
      } finally {
        setArtistsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // ====== FETCH ARTWORKS UNTUK 1 ARTIST ======
  const fetchArtworks = useCallback(async (artistId, filter) => {
    if (!artistId) return;

    try {
      setArtworksLoading(true);
      setArtworksError("");
      setArtworks([]);

      const query = filter && filter !== "all" ? `?source=${filter}` : "";
      const res = await fetch(
        `${API_BASE_URL}/api/artists/${artistId}/artworks${query}`
      );

      const data = await res.json();

      if (!res.ok) {
        setArtworksError(
          data.message || "Failed to load artworks for this artist."
        );
        return;
      }

      setArtworks(data.artworks || []);
    } catch (err) {
      console.error("Error fetch artist artworks:", err);
      setArtworksError("Terjadi kesalahan saat mengambil karya artist ini.");
    } finally {
      setArtworksLoading(false);
    }
  }, []);

  // kalau ganti artist atau filter → reload karya & reset page
  useEffect(() => {
    if (!selectedArtist) return;
    setArtworkPage(1);
    fetchArtworks(selectedArtist.id, artworkFilter);
  }, [selectedArtist, artworkFilter, fetchArtworks]);

  // ===== HERO =====
  const handleHeroExplore = () => {
    const section = document.getElementById("featured-artists");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ===== SORTING (untuk list) =====
  const sortedArtists = useMemo(() => {
    const arr = [...artists];

    if (sortOption === "name-asc") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortOption === "name-desc") {
      arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortOption === "followers-desc") {
      arr.sort((a, b) => {
        const fa = a.follower_count || 0;
        const fb = b.follower_count || 0;
        return fb - fa;
      });
    }
    return arr;
  }, [artists, sortOption]);

  const handleSortSelect = (value) => {
    setSortOption(value);
    setSortOpen(false);
  };

  // ===== PAGINATION LIST ARTIST =====
  const totalArtistPages = Math.max(
    1,
    Math.ceil(sortedArtists.length / ARTISTS_PER_PAGE)
  );
  const startArtistIndex = (artistPage - 1) * ARTISTS_PER_PAGE;
  const paginatedArtists = sortedArtists.slice(
    startArtistIndex,
    startArtistIndex + ARTISTS_PER_PAGE
  );

  // helper format tanggal
  const formatDatePretty = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // teks alamat singkat
  const shortAddress = (addr) => {
    if (!addr) return "-";
    return addr.length > 40 ? addr.slice(0, 40) + "…" : addr;
  };

  // buka detail artist
  const openDetailFromGrid = (artist) => {
    setSelectedArtist(artist);
    setArtworkFilter("all");
    setArtworkPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToArtists = () => {
    setSelectedArtist(null);
    setArtworks([]);
    setArtworkFilter("all");
    setArtworkPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===== LIGHTBOX (sama seperti Gallery) =====
  const handleDownload = (art) => {
    if (!art || !art.id) return;

    const downloadUrl = `${API_BASE_URL}/api/artworks/${art.id}/download`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // helper format Rupiah
  const formatRp = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
  };

  // pagination karya artist
  const totalArtworkPages = Math.max(
    1,
    Math.ceil(artworks.length / ARTWORKS_PER_PAGE)
  );
  const startArtworkIndex = (artworkPage - 1) * ARTWORKS_PER_PAGE;
  const paginatedArtworks = artworks.slice(
    startArtworkIndex,
    startArtworkIndex + ARTWORKS_PER_PAGE
  );

  const currentArtist = selectedArtist;

  return (
    <div className="artists-page">
      {/* ================= HERO – hanya di LIST ================= */}
      {!currentArtist && (
        <section className="hero-section">
          <div className="hero-bg" />
          <div className="hero-overlay">
            <div className="container hero-content hero-content-left">
              <h1 className="hero-title hero-title-left">
                Discover the Minds Behind the Art
              </h1>
              <p className="hero-subtitle hero-subtitle-left">
                Meet the minds behind the magic. Dive into the artists of
                HE-ART, explore their creative journeys and see how each piece
                comes to life. Stalk—uh, follow—their portfolios, hype their
                work, and connect with your faves.
              </p>

              <button
                type="button"
                className="hero-cta"
                onClick={handleHeroExplore}
              >
                <span className="hero-cta-arrow" aria-hidden="true">
                  ➜
                </span>
                <span>Explore more</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= LIST ARTISTS ================= */}
      {!currentArtist && (
        <section className="artists-featured container" id="featured-artists">
          <header className="artists-featured-header">
            <div>
              <h2 className="artists-featured-title">Featured Artist</h2>
              <p className="artists-featured-subtitle">
                Browse all artists who already upload their works
              </p>
            </div>

            {/* SORT BY */}
            <div className="artists-sort">
              <span className="artists-sort-label">SORT BY</span>

              <div className="artists-sort-dropdown">
                <button
                  type="button"
                  className="artists-sort-btn"
                  aria-label="Sort artists"
                  onClick={() => setSortOpen((prev) => !prev)}
                >
                  <span className="artists-sort-icon" aria-hidden="true" />
                </button>

                {sortOpen && (
                  <div className="artists-sort-menu">
                    <button
                      type="button"
                      className={`artists-sort-option ${
                        sortOption === "default" ? "is-active" : ""
                      }`}
                      onClick={() => handleSortSelect("default")}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      className={`artists-sort-option ${
                        sortOption === "name-asc" ? "is-active" : ""
                      }`}
                      onClick={() => handleSortSelect("name-asc")}
                    >
                      Name A–Z
                    </button>
                    <button
                      type="button"
                      className={`artists-sort-option ${
                        sortOption === "name-desc" ? "is-active" : ""
                      }`}
                      onClick={() => handleSortSelect("name-desc")}
                    >
                      Name Z–A
                    </button>
                    <button
                      type="button"
                      className={`artists-sort-option ${
                        sortOption === "followers-desc" ? "is-active" : ""
                      }`}
                      onClick={() => handleSortSelect("followers-desc")}
                    >
                      Most followers
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {artistsError && (
            <p style={{ color: "#d11a2a", fontSize: 13 }}>{artistsError}</p>
          )}
          {artistsLoading && <p>Loading artists...</p>}

          {!artistsLoading && artists.length === 0 && !artistsError && (
            <p style={{ fontSize: 13, color: "#777" }}>
              Belum ada artist yang mengupload karya.
            </p>
          )}

          {!artistsLoading && artists.length > 0 && (
            <>
              <div className="artists-grid">
                {paginatedArtists.map((artist) => {
                  const followed = isArtistFollowed(artist.id);

                  return (
                    <article
                      key={artist.id}
                      className="artists-card"
                      onClick={() => openDetailFromGrid(artist)}
                    >
                      <div className="artists-card-image">
                        {artist.avatar_url ? (
                          <img
                            src={artist.avatar_url}
                            alt={artist.name || "Artist"}
                          />
                        ) : (
                          <img
                            src="https://via.placeholder.com/400x500?text=Artist"
                            alt={artist.name || "Artist"}
                          />
                        )}

                        <div className="artists-card-hover">
                          <span className="artists-card-logo">HeArt</span>
                        </div>
                      </div>

                      <div className="artists-card-info">
                        <div className="artists-card-text">
                          <h3>{artist.name || "Unnamed Artist"}</h3>
                          <p>{shortAddress(artist.address)}</p>
                          <p>{formatDatePretty(artist.birth_date)}</p>
                        </div>

                        <button
                          type="button"
                          className={`artists-follow-btn ${
                            followed ? "is-following" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowArtist(artist.id);
                          }}
                        >
                          {followed ? "Following" : "Follow"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Pagination
                currentPage={artistPage}
                totalPages={totalArtistPages}
                onChange={setArtistPage}
              />
            </>
          )}
        </section>
      )}

      {/* ================= DETAIL ARTIST ================= */}
      {currentArtist && (
        <section className="artist-detail container">
          {/* breadcrumb */}
          <div className="artist-breadcrumb">
            <button
              type="button"
              className="artist-breadcrumb-link"
              onClick={backToArtists}
            >
              Artists
            </button>{" "}
            / <span>{currentArtist.name}</span>
          </div>

          {/* HEADER */}
          <div className="artist-header">
            <div className="artist-main-image">
              {currentArtist.avatar_url ? (
                <img src={currentArtist.avatar_url} alt={currentArtist.name} />
              ) : (
                <img
                  src="https://via.placeholder.com/400x500?text=Artist"
                  alt={currentArtist.name || "Artist"}
                />
              )}
            </div>

            <div className="artist-main-info">
              <h1 className="artist-main-name">{currentArtist.name}</h1>
              <p className="artist-main-meta">
                {shortAddress(currentArtist.address)}
              </p>
              <p className="artist-main-meta">
                {formatDatePretty(currentArtist.birth_date)}
              </p>

              <div className="artist-main-follow-row">
                <button
                  className={`artist-main-follow ${
                    isArtistFollowed(currentArtist.id) ? "is-following" : ""
                  }`}
                  type="button"
                  onClick={() => toggleFollowArtist(currentArtist.id)}
                >
                  {isArtistFollowed(currentArtist.id) ? "Following" : "Follow"}
                </button>

                <span className="artist-main-followers">
                  Followers: {currentArtist.follower_count || 0}
                </span>
              </div>

              <p className="artist-main-description">
                {currentArtist.bio
                  ? currentArtist.bio
                  : getArtistDescription(currentArtist)}
              </p>
            </div>
          </div>

          {/* ===== FILTER KARYA ===== */}
          <section className="artist-artworks">
            <div className="artist-artworks-header">
              <div className="artist-artworks-title-wrapper">
                <h2 className="artist-artworks-title">
                  {currentArtist.name} Artworks
                </h2>
                <p className="artist-artworks-subtitle">
                  Filter:
                  <button
                    type="button"
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border:
                        artworkFilter === "all"
                          ? "1px solid #573101"
                          : "1px solid #ccc",
                      background: artworkFilter === "all" ? "#573101" : "#fff",
                      color: artworkFilter === "all" ? "#fff" : "#000",
                      cursor: "pointer",
                    }}
                    onClick={() => setArtworkFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border:
                        artworkFilter === "gallery"
                          ? "1px solid #573101"
                          : "1px solid #ccc",
                      background:
                        artworkFilter === "gallery" ? "#573101" : "#fff",
                      color: artworkFilter === "gallery" ? "#fff" : "#000",
                      cursor: "pointer",
                    }}
                    onClick={() => setArtworkFilter("gallery")}
                  >
                    Gallery
                  </button>
                  <button
                    type="button"
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border:
                        artworkFilter === "for_sale"
                          ? "1px solid #573101"
                          : "1px solid #ccc",
                      background:
                        artworkFilter === "for_sale" ? "#573101" : "#fff",
                      color: artworkFilter === "for_sale" ? "#fff" : "#000",
                      cursor: "pointer",
                    }}
                    onClick={() => setArtworkFilter("for_sale")}
                  >
                    For Sale
                  </button>
                </p>
              </div>
            </div>

            {artworksError && (
              <p style={{ color: "#d11a2a", fontSize: 13 }}>{artworksError}</p>
            )}
            {artworksLoading && <p>Loading artworks...</p>}

            {!artworksLoading && artworks.length === 0 && !artworksError && (
              <p style={{ fontSize: 13, color: "#777" }}>
                Artist ini belum memiliki karya pada filter yang dipilih.
              </p>
            )}

            {!artworksLoading && artworks.length > 0 && (
              <>
                <div className="artist-artworks-grid">
                  {paginatedArtworks.map((art) => (
                    <article key={art.id} className="artist-artwork-card">
                      <button
                        type="button"
                        className="artist-artwork-image-wrapper"
                        onClick={() => {
                          // ✅ FIX: for_sale -> arahkan ke detail for sale
                          if (art.mode === "for_sale") {
                            navigate(`/for-sale/${art.id}`);
                            return;
                          }

                          // ✅ gallery -> lightbox
                          setLightboxArtwork({
                            ...art,
                            nickname: currentArtist.nickname,
                            full_name:
                              currentArtist.full_name || currentArtist.name,
                          });
                        }}
                      >
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="artist-artwork-image"
                        />
                      </button>

                      <div className="artist-artwork-text">
                        <div className="artist-artwork-row-top">
                          <div className="artist-artwork-title">
                            {art.title || "Untitled"}
                          </div>
                        </div>

                        <div className="artist-artwork-meta">
                          {art.style || ""}
                        </div>

                        <div className="artist-artwork-price">
                          {art.mode === "for_sale"
                            ? formatRp(art.price || 0)
                            : "Not for sale"}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <Pagination
                  currentPage={artworkPage}
                  totalPages={totalArtworkPages}
                  onChange={setArtworkPage}
                />
              </>
            )}
          </section>
        </section>
      )}

      {/* ================== LIGHTBOX ================== */}
      {lightboxArtwork && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxArtwork(null)}
        >
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setLightboxArtwork(null)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="lightbox-image-wrapper">
              <img
                src={lightboxArtwork.image_url}
                alt={lightboxArtwork.title || "Artwork"}
                className="lightbox-image"
              />
            </div>

            <div className="lightbox-caption">
              <div className="lightbox-caption-main">
                <div>
                  <h3>{lightboxArtwork.title || "Untitled"}</h3>
                  {(lightboxArtwork.nickname || lightboxArtwork.full_name) && (
                    <p className="lightbox-artist">
                      {lightboxArtwork.nickname || lightboxArtwork.full_name}
                    </p>
                  )}
                  {lightboxArtwork.style && (
                    <p className="lightbox-style">
                      Style: {lightboxArtwork.style}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="download-btn"
                  onClick={() => handleDownload(lightboxArtwork)}
                >
                  Download
                </button>
              </div>

              {lightboxArtwork.description && (
                <p className="lightbox-description">
                  {lightboxArtwork.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;
