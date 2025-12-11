// src/pages/ForSale.js
import React, { useState } from "react";
import "./ForSale.css";

import FilterIcon from "../assets/filter-icon.svg";
import HeartLogo from "../assets/heart.svg";
import ArrowIcon from "../assets/icon-arrow.svg";

import Artwork1 from "../assets/images/1.png"; 
import Artwork2 from "../assets/images/3.png"; 
import Artwork3 from "../assets/images/6.jpg"; 
import Artwork4 from "../assets/images/7.png"; 
import Artwork5 from "../assets/images/11.png"; 
import Artwork6 from "../assets/images/12.png"; 
import Artwork7 from "../assets/images/13.png"; 
import Artwork8 from "../assets/images/14.png"; 
import Artwork9 from "../assets/images/16.png"; 

const STYLE_OPTIONS = ["Realistic", "Abstract", "Surrealist", "Geometric", "Illustrative"];
const PRICE_OPTIONS = ["Any", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];
const HEIGHT_OPTIONS = ["Any", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];
const WIDTH_OPTIONS = ["Any", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];

const TOTAL_PAGES = 5;

const ARTWORKS = [ // 🆕 NEW
  {
    id: 1,
    image: Artwork1,
    title: "Le Désespéré",
    dimensions: "Dimension: 60 x 120 cm",
    price: "Rp. 8.500.000",
    artist: "Gustave Courbet",
  },
  {
    id: 2,
    image: Artwork2,
    title: "Umbra Fenestre",
    dimensions: "Dimension: 60 cm x 90 cm",
    price: "Rp. 2.500.000",
    artist: "Studio Artist",
  },
  {
    id: 3,
    image: Artwork3,
    title: "White Symphony",
    dimensions: "Dimension: 80 x 120 cm",
    price: "Rp. 8.200.000",
    artist: "Ballet Artwork",
  },
  {
    id: 4,
    image: Artwork4,
    title: "Mona Lisa",
    dimensions: "Dimension: 70 x 100 cm",
    price: "Rp. 4.000.000",
    artist: "Leonardo da Vinci",
  },
  {
    id: 5,
    image: Artwork5,
    title: "Oculus Profundus",
    dimensions: "Dimension: 80 x 120 cm",
    price: "Rp. 8.000.000",
    artist: "Surreal Studio",
  },
  {
    id: 6,
    image: Artwork6,
    title: "Harmonia Mundi",
    dimensions: "Dimension: 70 x 110 cm",
    price: "Rp. 3.500.000",
    artist: "Urban Theme",
  },
  {
    id: 7,
    image: Artwork7,
    title: "The Persistence",
    dimensions: "Dimension: 60 x 90 cm",
    price: "Rp. 3.400.000",
    artist: "Salvador Dalí",
  },
  {
    id: 8,
    image: Artwork8,
    title: "White Symphony",
    dimensions: "Dimension: 80 x 120 cm",
    price: "Rp. 8.200.000",
    artist: "Ballet Artwork",
  },
  {
    id: 9,
    image: Artwork9,
    title: "Mona Lisa",
    dimensions: "Dimension: 70 x 100 cm",
    price: "Rp. 4.000.000",
    artist: "Leonardo da Vinci",
  },
  {
    id: 10,
    image: Artwork1,
    title: "The Starry Night",
    dimensions: "Dimension: 70 x 110 cm",
    price: "Rp. 3.800.000",
    artist: "Vincent van Gogh",
  },
  {
    id: 11,
    image: Artwork3,
    title: "Umbra Fenestre",
    dimensions: "Dimension: 60 x 90 cm",
    price: "Rp. 2.500.000",
    artist: "Studio Artist",
  },
  {
    id: 12,
    image: Artwork5,
    title: "Le Désespéré",
    dimensions: "Dimension: 60 x 120 cm",
    price: "Rp. 8.500.000",
    artist: "Gustave Courbet",
  },
];

const FilterDropdown = ({
  label,
  filterKey,
  options,
  isOpen,
  selectedValue,
  onToggle,
  onSelect,
}) => (
  <div className="filter-dropdown">
    <button
      type="button"
      className={`filter-dropdown__trigger ${
        isOpen ? "filter-dropdown__trigger--open" : ""
      }`}
      onClick={() => onToggle(filterKey)}
    >
      <span className="filter-dropdown__label">
        {selectedValue || label}
      </span>
      <span
        className={`filter-dropdown__chevron ${
          isOpen ? "filter-dropdown__chevron--open" : ""
        }`}
      />
    </button>

    <div
      className={`filter-dropdown__menu ${
        isOpen ? "filter-dropdown__menu--open" : ""
      }`}
    >
      <ul className="filter-dropdown__list">
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              className={`filter-dropdown__option ${
                selectedValue === option
                  ? "filter-dropdown__option--selected"
                  : ""
              }`}
              onClick={() => onSelect(filterKey, option)}
            >
              <span>{option}</span>
              {selectedValue === option && (
                <span className="filter-dropdown__check">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ForSale = () => {
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    style: null,
    price: null,
    height: null,
    width: null,
  });

const [currentPage, setCurrentPage] = useState(1);

  const handleToggleFilter = (filterKey) => {
    setOpenFilter((current) => (current === filterKey ? null : filterKey));
  };

  const handleSelectFilter = (filterKey, value) => {
    setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }));
    setOpenFilter(null);
  };

  const handleApplyFilters = () => {
    console.log("Filters:", selectedFilters);
    // TODO: nanti bisa dipakai untuk filter ARTWORKS di step berikutnya
  };

   // 🆕 NEW: ganti halaman saat nomor/arrow diklik
  const handleChangePage = (page) => {
    if (page < 1 || page > TOTAL_PAGES) return;
    setCurrentPage(page);

    // optional: scroll ke atas grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🆕 NEW: "acak" urutan artwork berdasarkan halaman (rotasi array)
  const getPageArtworks = () => {
    if (ARTWORKS.length === 0) return [];
    const offset = ((currentPage - 1) * 3) % ARTWORKS.length; // geser 3 item per halaman
    return [
      ...ARTWORKS.slice(offset),
      ...ARTWORKS.slice(0, offset),
    ];
  };

  const pageArtworks = getPageArtworks(); // 🆕 NEW

  return (
    <main className="for-sale-page">
      <div className="for-sale-page__container">

        {/* ========================= */}
        {/* FILTER BAR                */}
        {/* ========================= */}
        <section className="for-sale-filter-bar">

          <div className="for-sale-filter-bar__filters">
            <FilterDropdown
              label="Style"
              filterKey="style"
              options={STYLE_OPTIONS}
              isOpen={openFilter === "style"}
              selectedValue={selectedFilters.style}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Price"
              filterKey="price"
              options={PRICE_OPTIONS}
              isOpen={openFilter === "price"}
              selectedValue={selectedFilters.price}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Height"
              filterKey="height"
              options={HEIGHT_OPTIONS}
              isOpen={openFilter === "height"}
              selectedValue={selectedFilters.height}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Width"
              filterKey="width"
              options={WIDTH_OPTIONS}
              isOpen={openFilter === "width"}
              selectedValue={selectedFilters.width}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />
          </div>

          <button
            className="for-sale-filter-bar__apply" 
            type="button" 
            onClick={handleApplyFilters} 
          >
            <img
              src={FilterIcon}
              alt="Filter"
              className="for-sale-filter-bar__apply-icon"
            />
            <span className="for-sale-filter-bar__apply-text">Filter</span>
          </button>
        </section>

        {/* ========================= */}
        {/* ARTWORK GRID              */}
        {/* ========================= */}
        <section className="for-sale-artworks"> 
          <div className="for-sale-artworks__grid">
            {pageArtworks.map((artwork) => (
              <article key={artwork.id} className="artwork-card">
                <div className="artwork-card__image-wrapper">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="artwork-card__image"
                  />
                  <div className="artwork-card__overlay">
                    <img
                      src={HeartLogo}  // svg yang kamu bilang sudah punya
                      alt="HeArt Logo"
                      className="artwork-card__overlay-logo"
                    />
                  </div>
                </div>

                <div className="artwork-card__header">
                  <h3 className="artwork-card__title">{artwork.title}</h3>
                  <button
                    type="button"
                    className="artwork-card__wishlist"
                    aria-label={`Add ${artwork.title} to wishlist`}
                  >
                    {/* Bisa diganti SVG icon heart kalau sudah siap */}
                    <span className="artwork-card__wishlist-icon">♡</span>
                  </button>
                </div>

                <p className="artwork-card__dimensions">
                  {artwork.dimensions}
                </p>
                <p className="artwork-card__frame">
                  {artwork.frameDetails}
                </p>

                <p className="artwork-card__price">
                  {artwork.price}
                </p>

                <p className="artwork-card__artist">
                  {artwork.artist}
                </p>
              </article>
            ))}
          </div>
        </section> 

        {/* ========================= */}
        {/* PAGINATION                */}
        {/* ========================= */}
        <section className="for-sale-pagination"> {/* 🆕 NEW */}
          <button
            type="button"
            className="pagination-arrow"
            onClick={() => handleChangePage(currentPage - 1)} // 🆕 NEW
            disabled={currentPage === 1} // 🆕 NEW
          >
            <img
              src={ArrowIcon}
              alt="Previous page"
              className="pagination-arrow__icon pagination-arrow__icon--left"
            />
          </button>

          <div className="pagination-pages">
            {Array.from({ length: TOTAL_PAGES }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-page ${
                    pageNum === currentPage ? "pagination-page--active" : ""
                  }`}
                  onClick={() => handleChangePage(pageNum)} // 🆕 NEW
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="pagination-arrow"
            onClick={() => handleChangePage(currentPage + 1)} // 🆕 NEW
            disabled={currentPage === TOTAL_PAGES} // 🆕 NEW
          >
            <img
              src={ArrowIcon}
              alt="Next page"
              className="pagination-arrow__icon pagination-arrow__icon--right"
            />
          </button>
        </section>

      </div>
    </main>
  );
};

export default ForSale;
