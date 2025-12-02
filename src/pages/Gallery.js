import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Gallery.css";

import img1 from "../assets/images/11.png";
import img2 from "../assets/images/7.png";
import img3 from "../assets/images/18.png";
import img4 from "../assets/images/21.png";
import img5 from "../assets/images/12.png";
import img6 from "../assets/images/16.png";
import img7 from "../assets/images/15.png";
import img8 from "../assets/images/20.png";
import img9 from "../assets/images/14.png";
import img10 from "../assets/images/13.png";

const TOTAL_PAGES = 6;

/** META DATA ARTWORK (judul + subtitle di modal) */
const artworkMeta = {
  [img5]: {
    title: "The Scream",
    subtitle: "Edvard Munch, 1893",
  },
  [img6]: {
    title: "Swans on the Lake",
    subtitle: "Oil on canvas",
  },
  [img7]: {
    title: "Relief of the Flood",
    subtitle: "Anonymous, c. 1900",
  },
  [img8]: {
    title: "The Raft of the Survivors",
    subtitle: "Lithograph, 19th century",
  },
  [img9]: {
    title: "Old Man Portrait",
    subtitle: "Oil on canvas",
  },
  [img10]: {
    title: "Girl in a Gilded Frame",
    subtitle: "Oil on canvas",
  },
  [img1]: {
    title: "Abstract Portrait Study",
    subtitle: "Mixed media",
  },
  [img2]: {
    title: "The Starry Night",
    subtitle: "Vincent van Gogh, 1889",
  },
  [img3]: {
    title: "Water Lilies",
    subtitle: "Claude Monet, c. 1916",
  },
  [img4]: {
    title: "Nymphs’ Descent",
    subtitle: "Classical painting",
  },
};

// TEXT HERO PER PAGE
const heroConfigs = {
  1: {
    title: "Discover our ArtWorks",
    subtitle:
      "Our extraordinary collection from many local artists to brings together centuries of masterpieces from around the world.",
  },
  2: {
    title: "Realistic",
    subtitle:
      "Realism emerged prominently in France around the 1840s, acting as a radical rejection of the dramatic sentimentality of Romanticism and the conservative, idealized subjects of Academic art. Pioneered by figures such as Gustave Courbet, Honoré Daumier, and Jean-François Millet, the movement championed the objective and unvarnished depiction of contemporary life. Realist artists focused deliberately on painting ordinary subjects, including the working class, peasants, and mundane domestic scenes, elevating them to the importance traditionally reserved for historical or mythological narratives. The style is defined by its commitment to visual accuracy, minute detail, and a truthful presentation of reality free from emotional filtering, effectively turning painting into a subtle yet powerful vehicle for social and political critique against the backdrop of industrialization.",
  },
  3: {
    title: "Surrealist",
    subtitle:
      "Realism emerged prominently in France around the 1840s, acting as a radical rejection of the dramatic sentimentality of Romanticism and the conservative, idealized subjects of Academic art. Pioneered by figures such as Gustave Courbet, Honoré Daumier, and Jean-François Millet, the movement championed the objective and unvarnished depiction of contemporary life. Realist artists focused deliberately on painting ordinary subjects, including the working class, peasants, and mundane domestic scenes, elevating them to the importance traditionally reserved for historical or mythological narratives. The style is defined by its commitment to visual accuracy, minute detail, and a truthful presentation of reality free from emotional filtering, effectively turning painting into a subtle yet powerful vehicle for social and political critique against the backdrop of industrialization.",
  },
  4: {
    title: "Abstract",
    subtitle:
      "Abstract is a contemporary artistic style that deliberately emerged from the blurring lines between fine art and commercial illustration, gaining traction from the late 20th century onwards. While drawing from Abstract Expressionism, it rejects pure non-objectivity, often retaining recognizable forms or narrative elements rendered in a simplified, flattened, or emotionally resonant manner. This style is championed by artists who combine bold colors, distinct graphic shapes, and dynamic composition to convey themes, moods, or stories without relying on realistic representation. The work is characterized by its playful ambiguity, high visual energy, and clean execution, making it a powerful vehicle for modern communication, storytelling, and imaginative expression in a way that is highly accessible yet deeply stylistic.",
  },
  5: {
    title: "Geometric",
    subtitle:
      "Geometric art is rooted in the early 20th-century avant-garde movements, particularly Suprematism and De Stijl (Neoplasticism), which sought absolute purity in art by reducing form to its most essential elements: points, lines, and planes. Pioneered by figures like Kazimir Malevich and Piet Mondrian, the movement completely abandoned figurative subject matter in favor of precise, non-representational compositions built exclusively from primary colors, black, white, and a strict adherence to orthogonal (horizontal and vertical) lines. The style is defined by its commitment to logic, order, and mathematical precision, creating works that are clean, balanced, and intellectual. Geometric art functions as a statement of universal harmony and rational structure, effectively serving as a model for a utopian, ordered society, free from the chaos and sentimentality of the natural world.",
  },
  6: {
    title: "Illustrative",
    subtitle:
      "This style typically retains clear, recognizable forms or narrative structures, but renders them in a simplified, flattened, or strongly stylized manner to evoke a specific emotional response or tell a story. It is championed by artists who effectively use bold color palettes, distinctive graphic shapes, and dynamic compositions. Abstract Illustrative art is defined by its playful sense of ambiguity, high visual energy, and clean, deliberate execution, making it a highly effective and accessible vehicle for modern visual communication, storytelling, and expressive imagination.",
  },
};

// mapping Style → nomor page
const stylePageMap = {
  "All styles": 1,
  Realistic: 2,
  Surrealist: 3,
  Abstract: 4,
  Geometric: 5,
  Illustrative: 6,
};

const Gallery = () => {
  // STYLE DROPDOWN
  const styleOptions = [
    "All styles",
    "Realistic",
    "Surrealist",
    "Abstract",
    "Geometric",
    "Illustrative",
  ];

  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("ALL STYLES");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // LIGHTBOX: index artwork yg lagi dibuka (di current page)
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const toggleStyleDropdown = () => {
    setIsStyleOpen((prev) => !prev);
  };

  const goToPage = (page) => {
    if (page < 1 || page > TOTAL_PAGES) return;
    setCurrentPage(page);
    setLightboxIndex(null); // tutup modal kalau ganti page
  };

  const handleStyleSelect = (value) => {
    setSelectedStyle(value.toUpperCase());
    setIsStyleOpen(false);

    const targetPage = stylePageMap[value] || 1;
    goToPage(targetPage);
  };

  // GAMBAR PER PAGE
  const pageImages = {
    1: [img5, img6, img7, img8, img9, img10, img1, img2, img3, img4, img5, img6],
    2: [img3, img4, img2, img1, img8, img9, img10, img7, img6, img5, img4, img3],
    3: [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img1, img2],
    4: [img8, img9, img10, img7, img6, img5, img4, img3, img2, img1, img8, img9],
    5: [img2, img3, img4, img5, img6, img7, img8, img9, img10, img1, img2, img3],
    6: [img7, img8, img9, img10, img1, img2, img3, img4, img5, img6, img7, img8],
  };

  const currentImages = pageImages[currentPage] || pageImages[1];

  // flatten artworks dengan meta
  const artworks = currentImages.map((src) => ({
    src,
    title: artworkMeta[src]?.title || "Artwork",
    subtitle: artworkMeta[src]?.subtitle || "",
  }));

  // bagi ke 4 kolom masonry
  const columns = [[], [], [], []];
  artworks.forEach((art, index) => {
    columns[index % 4].push({ ...art, index });
  });

  // hero text sesuai page
  const hero = heroConfigs[currentPage] || heroConfigs[1];
  const isCenteredHero = currentPage !== 1; // cuma page 2–6 yang center

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + artworks.length) % artworks.length
    );
  };

  const showNext = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % artworks.length
    );
  };

  const activeArtwork =
    lightboxIndex === null ? null : artworks[lightboxIndex];

  return (
    <div className="gallery-page">
      <main>
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-bg" />
          <div
            className={
              "hero-overlay " + (isCenteredHero ? "hero-overlay-centered" : "")
            }
          >
            <div
              className={
                "container hero-content " +
                (isCenteredHero ? "hero-content-centered" : "hero-content-left")
              }
            >
              <h1
                className={
                  "hero-title " +
                  (isCenteredHero ? "hero-title-centered" : "hero-title-left")
                }
              >
                {hero.title}
              </h1>

              <p
                className={
                  "hero-subtitle " +
                  (isCenteredHero
                    ? "hero-subtitle-centered"
                    : "hero-subtitle-left")
                }
              >
                {hero.subtitle}
              </p>

              {/* Explore more hanya di page 1 */}
              {currentPage === 1 && (
                <Link to="/gallery/overview" className="hero-cta">
                  <span className="hero-cta-arrow">→</span>
                  <span>Explore more</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* A FEW OF OUR ARTWORKS */}
        <section className="section container" id="gallery">
          <h2 className="section-title">A few of our artworks</h2>
          <div className="featured-grid">
            <div className="featured-item featured-large">
              <img src={img2} alt="Artwork 1" className="featured-img" />
            </div>
            <div className="featured-item">
              <img src={img3} alt="Artwork 2" className="featured-img" />
            </div>
            <div className="featured-item">
              <img src={img4} alt="Artwork 3" className="featured-img" />
            </div>
          </div>
        </section>

        {/* MORE WAYS TO EXPLORE */}
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
                <span className="filter-select-label">{selectedStyle}</span>
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

          {/* 4 COLUMN "MASONRY" LAYOUT */}
          <div className="masonry">
            {columns.map((col, colIndex) => (
              <div className="masonry-column" key={colIndex}>
                {col.map((art) => (
                  <button
                    type="button"
                    className="masonry-item"
                    key={`${colIndex}-${art.index}`}
                    onClick={() => openLightbox(art.index)}
                  >
                    <img
                      src={art.src}
                      alt={art.title}
                      className="masonry-img"
                    />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PAGINATION */}
        <section className="pagination-section">
          <button
            className="page-arrow-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <span className="page-arrow-icon page-arrow-left" />
          </button>

          {[1, 2, 3, 4, 5, 6].map((page) => (
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
            disabled={currentPage === TOTAL_PAGES}
            aria-label="Next page"
          >
            <span className="page-arrow-icon page-arrow-right" />
          </button>
        </section>
      </main>

      {/* LIGHTBOX / CLOSE-UP MODAL */}
      {activeArtwork && (
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
                src={activeArtwork.src}
                alt={activeArtwork.title}
                className="lightbox-image"
              />

              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-left"
                onClick={showPrev}
                aria-label="Previous artwork"
              >
                ‹
              </button>

              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-right"
                onClick={showNext}
                aria-label="Next artwork"
              >
                ›
              </button>
            </div>

            <div className="lightbox-caption">
              <h3>{activeArtwork.title}</h3>
              {activeArtwork.subtitle && (
                <p className="lightbox-subtitle">{activeArtwork.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
