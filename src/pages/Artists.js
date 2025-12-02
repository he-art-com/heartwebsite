import React, { useState } from "react";
import "./Artists.css";
import { FiHeart, FiShoppingCart } from "react-icons/fi";

// ==== IMPORT GAMBAR ====
import imgGustave from "../assets/images/11.png"; // old man colorful
import imgElara from "../assets/images/12.png"; // swan
import imgLeonardo from "../assets/images/3.png"; // mona lisa

import imgElias from "../assets/images/1.png"; // harmonia mundi
import imgSeraphina from "../assets/images/18.png"; // surreal face
import imgDali from "../assets/images/14.png"; // man in suit

import imgGeorge from "../assets/images/16.png"; // little girl
import imgCassian from "../assets/images/7.png"; // starry night
import imgMatsumi from "../assets/images/4.png"; // red-black abstract

// ===== DATA ARTISTS (grid & detail) =====
const ARTISTS = [
  {
    id: 1,
    name: "Gustave Courbet",
    meta: "French, 1819–1877",
    image: imgGustave,
    followers: "22k Followers",
  },
  {
    id: 2,
    name: "Elara Vancroft",
    meta: "Still don’t know",
    image: imgElara,
    followers: "18k Followers",
  },
  {
    id: 3,
    name: "Leonardo da Vinci",
    meta: "Italy, 1452–1519",
    image: imgLeonardo,
    followers: "23k Followers",
  },
  {
    id: 4,
    name: "Elias Thorne",
    meta: "born.",
    image: imgElias,
    followers: "9.2k Followers",
  },
  {
    id: 5,
    name: "Seraphina Renard",
    meta: "born.",
    image: imgSeraphina,
    followers: "11k Followers",
  },
  {
    id: 6,
    name: "Salvador Dalí",
    meta: "Spain, 1904–1989",
    image: imgDali,
    followers: "30k Followers",
  },
  {
    id: 7,
    name: "George Romney",
    meta: "British, 1734–1802",
    image: imgGeorge,
    followers: "14k Followers",
  },
  {
    id: 8,
    name: "Cassian Alistair",
    meta: "born.",
    image: imgCassian,
    followers: "7.8k Followers",
  },
  {
    id: 9,
    name: "Matsumi Kanemitsu",
    meta: "American, 1922–1992",
    image: imgMatsumi,
    followers: "12k Followers",
  },
];

// total halaman: 1 (featured) + 9 detail (page 2–10)
const TOTAL_PAGES = 10;

// ===== ARTWORKS DUMMY UNTUK DETAIL =====
const DEFAULT_ARTWORKS = [
  {
    id: 1,
    title: "Grotesque Head of an Old Woman",
    meta: "Dimension: 64.0 cm x 51.0 cm",
    price: "Rp. 5.000.000",
  },
  {
    id: 2,
    title: "Ginevra de’ Benci [obverse]",
    meta: "Dimension: 38.1 cm x 37 cm",
    price: "Rp. 10.000.000",
  },
  {
    id: 3,
    title: "Mona Lisa",
    meta: "Dimension: 38.1 cm x 37 cm",
    price: "Rp. 4.000.000",
  },
  {
    id: 4,
    title: "Portrait of a Young Lady",
    meta: "Dimension: 47.0 cm x 34 cm",
    price: "Rp. 7.000.000",
  },
  {
    id: 5,
    title: "An Angel in Green with a Vielle",
    meta: "Dimension: 27.0 cm x 60 cm",
    price: "Rp. 8.000.000",
  },
  {
    id: 6,
    title: "The Virgin of the Rocks",
    meta: "Dimension: 48.1 cm x 94 cm",
    price: "Rp. 6.000.000",
  },
];

// deskripsi singkat artist detail
const getArtistDescription = (artist) => {
  if (!artist) return "";
  if (artist.name === "Leonardo da Vinci") {
    return (
      "Leonardo da Vinci (1452–1519) was one of the most influential artists " +
      "of the Western world, renowned for masterpieces such as the Mona Lisa and The Last Supper. " +
      "His notebooks reveal a mind fascinated by machines, anatomy, engineering, and natural science."
    );
  }

  return (
    artist.name +
    " is one of the highlighted artists in our collection. Explore their creative journey, " +
    "signature style, and the stories behind each artwork."
  );
};

// ====== KOMPONEN PAGINATION (style sama dengan Gallery) ======
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
  const [currentPage, setCurrentPage] = useState(1);

  // page 2–10 map ke detail artist.
  // page 2 -> ARTISTS[0], page 3 -> ARTISTS[1], dst.
  const detailIndex = currentPage - 2;
  const currentArtist =
    detailIndex >= 0 && detailIndex < ARTISTS.length
      ? ARTISTS[detailIndex]
      : null;

  const handleHeroExplore = () => {
    const section = document.getElementById("featured-artists");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openDetailFromGrid = (index) => {
    setCurrentPage(index + 2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="artists-page">
      {/* ================= HERO – hanya di PAGE 1 ================= */}
      {currentPage === 1 && (
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
                <span className="hero-cta-arrow">→</span>
                <span>Explore more</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========== PAGE 1: FEATURED ARTIST GRID =========== */}
      {currentPage === 1 && (
        <section className="artists-featured container" id="featured-artists">
          <header className="artists-featured-header">
            <div>
              <h2 className="artists-featured-title">Featured Artist</h2>
              <p className="artists-featured-subtitle">
                Browse over 50.000 artist
              </p>
            </div>

            <div className="artists-sort">
              <span className="artists-sort-label">SORT BY</span>
              <button
                type="button"
                className="artists-sort-btn"
                aria-label="Sort artists"
              >
                <span className="artists-sort-icon" />
              </button>
            </div>
          </header>

          {/* GRID 3x3 */}
          <div className="artists-grid">
            {ARTISTS.map((artist, index) => (
              <article
                key={artist.id}
                className="artists-card"
                onClick={() => openDetailFromGrid(index)} // klik card buka detail (page 2–10)
              >
                <div className="artists-card-image">
                  <img src={artist.image} alt={artist.name} />
                  <div className="artists-card-hover">
                    <span className="artists-card-logo">HeArt</span>
                  </div>
                </div>

                <div className="artists-card-info">
                  <div className="artists-card-text">
                    <h3>{artist.name}</h3>
                    <p>{artist.meta}</p>
                  </div>

                  <button type="button" className="artists-follow-btn">
                    Follow
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* pagination di bawah grid */}
          <Pagination
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onChange={setCurrentPage}
          />
        </section>
      )}

      {/* =========== PAGE 2–10: ARTIST DETAIL LAYOUT =========== */}
      {currentPage !== 1 && (
        <section className="artist-detail container">
          {/* breadcrumb */}
          <div className="artist-breadcrumb">
            <button
              type="button"
              className="artist-breadcrumb-link"
              onClick={() => setCurrentPage(1)}
            >
              Artists
            </button>{" "}
            /{" "}
            <span>
              {currentArtist ? currentArtist.name : "New Artist Coming Soon"}
            </span>
          </div>

          {/* HEADER: image kiri, info kanan */}
          <div className="artist-header">
            <div className="artist-main-image">
              {currentArtist && (
                <img src={currentArtist.image} alt={currentArtist.name} />
              )}
            </div>

            <div className="artist-main-info">
              <h1 className="artist-main-name">
                {currentArtist ? currentArtist.name : "New Artist Coming Soon"}
              </h1>
              <p className="artist-main-meta">
                {currentArtist ? currentArtist.meta : "Stay tuned."}
              </p>

              <div className="artist-main-follow-row">
                <button className="artist-main-follow">Follow</button>
                <span className="artist-main-followers">
                  {currentArtist?.followers || "23k Followers"}
                </span>
              </div>

              <p className="artist-main-description">
                {getArtistDescription(currentArtist)}
              </p>
            </div>
          </div>

          {/* ===== ARTWORKS SECTION (grid 3 kolom) ===== */}
          <section className="artist-artworks">
            <div className="artist-artworks-header">
              <div className="artist-artworks-title-wrapper">
                <h2 className="artist-artworks-title">
                  {currentArtist
                    ? `${currentArtist.name} Artworks`
                    : "Artworks"}
                </h2>
                <p className="artist-artworks-subtitle">Display 1–6 of 20</p>
              </div>
            </div>

            <div className="artist-artworks-grid">
              {DEFAULT_ARTWORKS.map((art) => (
                <article key={art.id} className="artist-artwork-card">
                  {currentArtist && (
                    <div className="artist-artwork-image-wrapper">
                      <img
                        src={currentArtist.image}
                        alt={art.title}
                        className="artist-artwork-image"
                      />
                    </div>
                  )}

                  <div className="artist-artwork-text">
                    {/* baris atas: title kiri, icon kanan */}
                    <div className="artist-artwork-row-top">
                      <div className="artist-artwork-title">{art.title}</div>

                      <div className="artist-artwork-icons">
                        <button
                          className="artist-artwork-icon-btn"
                          aria-label="Add to favourites"
                          type="button"
                        >
                          <FiHeart className="artist-artwork-icon" />
                        </button>
                        <button
                          className="artist-artwork-icon-btn"
                          aria-label="Add to cart"
                          type="button"
                        >
                          <FiShoppingCart className="artist-artwork-icon" />
                        </button>
                      </div>
                    </div>

                    <div className="artist-artwork-meta">{art.meta}</div>
                    <div className="artist-artwork-price">{art.price}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* pagination di bawah artworks (seperti Leonardo page) */}
          <Pagination
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onChange={setCurrentPage}
          />
        </section>
      )}
    </div>
  );
};

export default Artists;
