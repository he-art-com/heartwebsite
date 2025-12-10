import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Gallery.css";

const API_BASE_URL = "http://localhost:5000";

const Gallery = () => {
  const [allArtworks, setAllArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STYLE DROPDOWN
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("All styles");

  // PAGINATION UNTUK GRID BAWAH
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 15;

  // LIGHTBOX
  const [lightboxArtwork, setLightboxArtwork] = useState(null);

  // ================== FETCH ARTWORKS DARI BACKEND ==================
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/api/artworks`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat karya.");
        }

        setAllArtworks(data.artworks || []);
      } catch (err) {
        console.error("Error fetch artworks:", err);
        setError(err.message || "Terjadi kesalahan saat memuat karya.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // ================== STYLE OPTIONS (DROPDOWN) ==================
  const baseStyles = [
    "Realistic",
    "Surrealist",
    "Abstract",
    "Geometric",
    "Illustrative",
    "Others",
  ];

  const dynamicStyles = Array.from(
    new Set(
      allArtworks
        .map((a) => a.style)
        .filter((s) => s && s.trim() && s !== "All styles")
    )
  );

  const styleSet = new Set(["All styles", ...baseStyles, ...dynamicStyles]);
  const styleOptions = Array.from(styleSet);

  // ================== FILTER & PAGINATION (GRID) ==================
  const filteredArtworks =
    selectedStyle === "All styles"
      ? allArtworks
      : allArtworks.filter((art) => art.style === selectedStyle);

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / PER_PAGE));

  // kalau jumlah halaman mengecil (misal habis delete), jangan dibiarkan di page kosong
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const currentPageArtworks = filteredArtworks.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  // Reset ke page 1 kalau ganti style
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStyle]);

  // ================== DATA UNTUK SLIDER KERETA (ATAS) ==================
  const featuredArtworks = allArtworks; // semua karya ikut slider

  // ================== HANDLER UI ==================

  const toggleStyleDropdown = () => {
    setIsStyleOpen((prev) => !prev);
  };

  const handleStyleSelect = (value) => {
    setSelectedStyle(value);
    setIsStyleOpen(false);
  };

  const openLightbox = (art) => {
    setLightboxArtwork(art);
  };

  const closeLightbox = () => {
    setLightboxArtwork(null);
  };

  /**
   * DOWNLOAD:
   * sekarang pakai endpoint backend:
   *   GET /api/artworks/:id/download
   * yang sudah kamu buat di server.js
   * Backend akan handle path file & paksa jadi attachment.
   */
  const handleDownload = (art) => {
    if (!art || !art.id) return;

    const downloadUrl = `${API_BASE_URL}/api/artworks/${art.id}/download`;

    // bikin <a> hidden lalu klik programmatically
    const link = document.createElement("a");
    link.href = downloadUrl;
    // attribute download biar browser treat sebagai download (plus header dari server)
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // ================== MASONRY DATA (GRID BAWAH) ==================
  const masonryColumns = [[], [], [], []];
  currentPageArtworks.forEach((art, index) => {
    masonryColumns[index % 4].push(art);
  });

  return (
    <div className="gallery-page">
      <main>
        {/* ================== HERO ================== */}
        <section className="hero-section">
          <div className="hero-bg" />
          <div className="hero-overlay">
            <div className="container hero-content-left">
              <h1 className="hero-title-left">Discover our ArtWorks</h1>
              <p className="hero-subtitle-left">
                Our extraordinary collection from many local artists brings
                together diverse masterpieces to inspire your next creation.
              </p>
              <Link to="/gallery/overview" className="hero-cta">
                <span className="hero-cta-arrow" aria-hidden="true">➜</span>
                <span>Explore more</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ================== A FEW OF OUR ARTWORKS (KERETA) ================== */}
        <section className="section container" id="gallery">
          <h2 className="section-title">A few of our artworks</h2>

          {loading && <p>Loading artworks...</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && !error && featuredArtworks.length === 0 && (
            <p className="empty-text">
              Belum ada karya yang di-upload. Coba upload karya dari Profile
              Settings.
            </p>
          )}

          {!loading && !error && featuredArtworks.length > 0 && (
            <div className="featured-carousel">
              <div className="featured-track featured-track-animate">
                {[...featuredArtworks, ...featuredArtworks].map(
                  (art, idx) => (
                    <button
                      type="button"
                      key={`${art.id}-${idx}`}
                      className="featured-card"
                      onClick={() => openLightbox(art)}
                    >
                      <div className="featured-card-image-wrapper">
                        <img
                          src={art.image_url}
                          alt={art.title || "Artwork"}
                          className="featured-card-image"
                        />
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================== MORE WAYS TO EXPLORE (GRID + FILTER) ================== */}
        <section className="section container">
          <div className="section-header">
            <h2 className="section-title section-title-tight">
              More Ways to Explore
            </h2>

            <div className="filter-wrapper">
              <div
                className={`filter-select ${isStyleOpen ? "open" : ""}`}
                onClick={toggleStyleDropdown}
              >
                <span className="filter-select-label">
                  {selectedStyle.toUpperCase()}
                </span>
                <span className="filter-arrow" aria-hidden="true" />
              </div>

              {isStyleOpen && (
                <div className="filter-menu">
                  {styleOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="filter-option"
                      onClick={() => handleStyleSelect(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading && <p>Loading artworks...</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && !error && currentPageArtworks.length === 0 && (
            <p className="empty-text">
              Belum ada karya dengan style <strong>{selectedStyle}</strong>.
            </p>
          )}

          {/* 4 COLUMN "MASONRY" LAYOUT */}
          {!loading && !error && currentPageArtworks.length > 0 && (
            <div className="masonry">
              {masonryColumns.map((col, colIndex) => (
                <div className="masonry-column" key={colIndex}>
                  {col.map((art) => (
                    <button
                      type="button"
                      key={art.id}
                      className="masonry-item"
                      onClick={() => openLightbox(art)}
                    >
                      <img
                        src={art.image_url}
                        alt={art.title || "Artwork"}
                        className="masonry-img"
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================== PAGINATION BAWAH SELALU MUNCUL ================== */}
        {!loading && !error && filteredArtworks.length > 0 && (
          <section className="pagination-section">
            <button
              className="page-arrow-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <span className="page-arrow-icon page-arrow-left" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  className={`page-number ${
                    currentPage === page ? "page-number-active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              )
            )}

            <button
              className="page-arrow-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <span className="page-arrow-icon page-arrow-right" />
            </button>
          </section>
        )}
      </main>

      {/* ================== LIGHTBOX / CLOSE-UP ================== */}
      {lightboxArtwork && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div
            className="lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={closeLightbox}
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

export default Gallery;
