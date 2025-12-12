// src/pages/ForSale.js
import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./ForSale.css";
import { ARTWORKS } from "./artworks";

import FilterIcon from "../assets/filter-icon.svg";
import HeartLogo from "../assets/heart.svg";
import ArrowIcon from "../assets/icon-arrow.svg"; 

const STYLE_OPTIONS = ["All", "Realistic", "Abstract", "Surrealist", "Geometric", "Illustrative"];
const PRICE_OPTIONS = ["All", "Under 3M", "3M - 5M", "5M - 7M", "7M+"];
const HEIGHT_OPTIONS = ["All", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];
const WIDTH_OPTIONS = ["All", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];

const TOTAL_PAGES = 5; 

// ===============================
// RANGE MAPPING UNTUK FILTER
// ===============================

// mapping range price (dalam Rupiah)
const PRICE_RANGES = {
  "Under 3M": { min: 0, max: 3000000 },
  "3M - 5M": { min: 3000000, max: 5000000 },
  "5M - 7M": { min: 5000000, max: 7000000 },
  "7M+": { min: 7000000, max: Infinity },
};

// mapping range height (cm)
const HEIGHT_RANGES = {
  "Under 40 cm": { min: 0, max: 40 },
  "40 - 80 cm": { min: 40, max: 80 },
  "80 - 120 cm": { min: 80, max: 120 },
  "120+ cm": { min: 120, max: Infinity },
};

// mapping range width (cm)
const WIDTH_RANGES = {
  "Under 40 cm": { min: 0, max: 40 },
  "40 - 80 cm": { min: 40, max: 80 },
  "80 - 120 cm": { min: 80, max: 120 },
  "120+ cm": { min: 120, max: Infinity },
};

// helper untuk cek apakah value masuk range terpilih
const matchesRangeFilter = (value, selectedLabel, rangesMap) => {
  if (!selectedLabel) return true; // kalau tidak ada filter → lolos
  const range = rangesMap[selectedLabel];
  if (!range) return true; // label tidak dikenali → jangan batasi
  const { min, max } = range;
  return value >= min && value <= max;
};


// ===============================
// FILTER DROPDOWN COMPONENT
// ===============================
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

// ===============================
// MAIN COMPONENT
// ===============================
const ForSale = () => {
  const navigate = useNavigate();
  const [openFilter, setOpenFilter] = useState(null);
  const [pendingFilters, setPendingFilters] = useState({
    style: null,
    price: null,
    height: null,
    width: null,
  });

  // appliedFilters: benar-benar dipakai untuk filter grid
  const [appliedFilters, setAppliedFilters] = useState({
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
  // "All" disimpan apa adanya di pendingFilters (hanya untuk UI)
  setPendingFilters((prev) => ({
    ...prev,
    [filterKey]: value,
  }));

  setOpenFilter(null);
};

  const handleApplyFilters = () => {
  setAppliedFilters({
    style: pendingFilters.style === "All" ? null : pendingFilters.style,
    price: pendingFilters.price === "All" ? null : pendingFilters.price,
    height: pendingFilters.height === "All" ? null : pendingFilters.height,
    width: pendingFilters.width === "All" ? null : pendingFilters.width,
  });

  setCurrentPage(1); // selalu balik ke page pertama setelah apply
};

const handleOpenDetail = (artworkId) => {
  if (artworkId !== 2) return;
  navigate(`/for-sale/${artworkId}`);
};

  // hasil artworks yang sudah difilter
const filteredArtworks = ARTWORKS.filter((artwork) => {
  const matchStyle =
    !appliedFilters.style || artwork.style === appliedFilters.style;

  const matchPrice = matchesRangeFilter(
    artwork.priceValue,
    appliedFilters.price,
    PRICE_RANGES
  );

  const matchHeight = matchesRangeFilter(
    artwork.heightCm,
    appliedFilters.height,
    HEIGHT_RANGES
  );

  const matchWidth = matchesRangeFilter(
    artwork.widthCm,
    appliedFilters.width,
    WIDTH_RANGES
  );

  return matchStyle && matchPrice && matchHeight && matchWidth;
});

const isNoFilterActive =
  !appliedFilters.style &&
  !appliedFilters.price &&
  !appliedFilters.height &&
  !appliedFilters.width;


  // pagination berdasarkan hasil filter
const ITEMS_PER_PAGE = 3; // 3 item per halaman, seperti rotasi lama

const getPageArtworks = () => {
  if (filteredArtworks.length === 0) return [];

  // 🆕 kalau tidak ada filter aktif (All), tampilkan SEMUA artwork
  if (isNoFilterActive) {
    return filteredArtworks; // ini bisa 12 item
  }

  const offset =
    ((currentPage - 1) * ITEMS_PER_PAGE) % filteredArtworks.length;

  // ambil array yang sudah di-rotate
  const rotated = [
    ...filteredArtworks.slice(offset),
    ...filteredArtworks.slice(0, offset),
  ];

  // ambil hanya 3 item teratas
  return rotated.slice(0, ITEMS_PER_PAGE);
};

const pageArtworks = getPageArtworks();

  // tetap pakai TOTAL_PAGES agar layout pagination kamu tidak berubah
  const handleChangePage = (page) => {
    if (page < 1 || page > TOTAL_PAGES) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              selectedValue={pendingFilters.style}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Price"
              filterKey="price"
              options={PRICE_OPTIONS}
              isOpen={openFilter === "price"}
              selectedValue={pendingFilters.price}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Height"
              filterKey="height"
              options={HEIGHT_OPTIONS}
              isOpen={openFilter === "height"}
              selectedValue={pendingFilters.height}
              onToggle={handleToggleFilter}
              onSelect={handleSelectFilter}
            />

            <FilterDropdown
              label="Width"
              filterKey="width"
              options={WIDTH_OPTIONS}
              isOpen={openFilter === "width"}
              selectedValue={pendingFilters.width}
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
                    onClick={() => handleOpenDetail(artwork.id)} 
                    style={{ cursor: artwork.id === 2 ? "pointer" : "default" }}
                  />
                  <div className="artwork-card__overlay">
                    <img
                      src={HeartLogo}
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
                    <span className="artwork-card__wishlist-icon">♡</span>
                  </button>
                </div>

                <p className="artwork-card__dimensions">
                  Dimension: {artwork.height} x {artwork.width} cm
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
            {/* empty state kalau filter tidak menemukan hasil */}
            {filteredArtworks.length === 0 && (
              <p className="for-sale-artworks__empty">
                No artworks match your filters.
              </p>
            )}
          </div>
        </section> 

        {/* ========================= */}
        {/* PAGINATION                */}
        {/* ========================= */}
        <section className="for-sale-pagination">
          <button
            type="button"
            className="pagination-arrow"
            onClick={() => handleChangePage(currentPage - 1)} 
            disabled={currentPage === 1} 
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
                  onClick={() => handleChangePage(pageNum)} 
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="pagination-arrow"
            onClick={() => handleChangePage(currentPage + 1)} 
            disabled={currentPage === TOTAL_PAGES} 
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
