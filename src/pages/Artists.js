// src/pages/Artists.js
import React, { useState, useMemo } from "react";
import "./Artists.css";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useStore } from "../context/StoreContext";

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

// ====== KOMPONEN PAGINATION ======
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

  // === SORT STATE (featured grid, page 1) ===
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState("default");

  const {
    toggleFollowArtist,
    isArtistFollowed,
    toggleFavourite,
    toggleCart,
    isFavourite,
    isInCart,
  } = useStore();

  // halaman 2–10 map ke detail artist.
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

  // === HITUNG ARTIST YANG SUDAH DI-SORT (untuk page 1) ===
  const sortedArtists = useMemo(() => {
    const arr = [...ARTISTS];

    if (sortOption === "name-asc") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      arr.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "followers-desc") {
      arr.sort((a, b) => {
        const fa = parseInt(String(a.followers || "").replace(/[^\d]/g, ""), 10) || 0;
        const fb = parseInt(String(b.followers || "").replace(/[^\d]/g, ""), 10) || 0;
        return fb - fa;
      });
    }
    // "default" -> urutan asli
    return arr;
  }, [sortOption]);

  const handleSortSelect = (value) => {
    setSortOption(value);
    setSortOpen(false);
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
                <span className="hero-cta-arrow" aria-hidden="true">
                  ➜
                </span>
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

            {/* SORT BY dengan icon custom + dropdown */}
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

          {/* GRID 3x3 – pakai sortedArtists */}
          <div className="artists-grid">
            {sortedArtists.map((artist, index) => {
              const followed = isArtistFollowed(artist.id);

              return (
                <article
                  key={artist.id}
                  className="artists-card"
                  onClick={() => openDetailFromGrid(index)}
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
                {currentArtist && (
                  <button
                    className={`artist-main-follow ${
                      isArtistFollowed(currentArtist.id) ? "is-following" : ""
                    }`}
                    type="button"
                    onClick={() => toggleFollowArtist(currentArtist.id)}
                  >
                    {isArtistFollowed(currentArtist.id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
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
              {DEFAULT_ARTWORKS.map((art) => {
                if (!currentArtist) return null;

                const fav = isFavourite(currentArtist.id, art.id);
                const inCart = isInCart(currentArtist.id, art.id);

                const artworkPayload = {
                  artistName: currentArtist.name,
                  title: art.title,
                  price: art.price,
                  image: currentArtist.image,
                  meta: art.meta,
                  dimension: art.meta,
                };

                return (
                  <article key={art.id} className="artist-artwork-card">
                    <div className="artist-artwork-image-wrapper">
                      <img
                        src={currentArtist.image}
                        alt={art.title}
                        className="artist-artwork-image"
                      />
                    </div>

                    <div className="artist-artwork-text">
                      <div className="artist-artwork-row-top">
                        <div className="artist-artwork-title">{art.title}</div>

                        <div className="artist-artwork-icons">
                          <button
                            className={`artist-artwork-icon-btn ${
                              fav ? "is-active" : ""
                            }`}
                            aria-label="Add to favourites"
                            type="button"
                            onClick={() =>
                              toggleFavourite(
                                currentArtist.id,
                                art.id,
                                artworkPayload
                              )
                            }
                          >
                            <FiHeart className="artist-artwork-icon" />
                          </button>
                          <button
                            className={`artist-artwork-icon-btn ${
                              inCart ? "is-active" : ""
                            }`}
                            aria-label="Add to cart"
                            type="button"
                            onClick={() =>
                              toggleCart(
                                currentArtist.id,
                                art.id,
                                artworkPayload
                              )
                            }
                          >
                            <FiShoppingCart className="artist-artwork-icon" />
                          </button>
                        </div>
                      </div>

                      <div className="artist-artwork-meta">{art.meta}</div>
                      <div className="artist-artwork-price">{art.price}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

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
