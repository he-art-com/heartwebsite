// src/pages/ForSale.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForSale.css";

import FilterIcon from "../assets/filter-icon.svg";
import HeartLogo from "../assets/heart.svg";
import ArrowIcon from "../assets/icon-arrow.svg";

const API_BASE_URL = "http://localhost:5000";

const STYLE_OPTIONS = [
  "All",
  "Realistic",
  "Abstract",
  "Surrealist",
  "Geometric",
  "Illustrative",
];

const PRICE_OPTIONS = ["All", "Under 3M", "3M - 5M", "5M - 7M", "7M+"];
const HEIGHT_OPTIONS = ["All", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];
const WIDTH_OPTIONS = ["All", "Under 40 cm", "40 - 80 cm", "80 - 120 cm", "120+ cm"];

const PRICE_RANGES = {
  "Under 3M": { min: 0, max: 3000000 },
  "3M - 5M": { min: 3000000, max: 5000000 },
  "5M - 7M": { min: 5000000, max: 7000000 },
  "7M+": { min: 7000000, max: Number.MAX_SAFE_INTEGER },
};

const HEIGHT_RANGES = {
  "Under 40 cm": { min: 0, max: 40 },
  "40 - 80 cm": { min: 40, max: 80 },
  "80 - 120 cm": { min: 80, max: 120 },
  "120+ cm": { min: 120, max: Number.MAX_SAFE_INTEGER },
};

const WIDTH_RANGES = {
  "Under 40 cm": { min: 0, max: 40 },
  "40 - 80 cm": { min: 40, max: 80 },
  "80 - 120 cm": { min: 80, max: 120 },
  "120+ cm": { min: 120, max: Number.MAX_SAFE_INTEGER },
};

const formatRp = (num) => {
  const n = Number(num || 0);
  return "Rp " + n.toLocaleString("id-ID");
};

const buildQuery = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
      <span className="filter-dropdown__label">{selectedValue || label}</span>
      <span
        className={`filter-dropdown__chevron ${
          isOpen ? "filter-dropdown__chevron--open" : ""
        }`}
      />
    </button>

    <div
      className={`filter-dropdown__menu ${isOpen ? "filter-dropdown__menu--open" : ""}`}
    >
      <ul className="filter-dropdown__list">
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              className={`filter-dropdown__option ${
                selectedValue === option ? "filter-dropdown__option--selected" : ""
              }`}
              onClick={() => onSelect(filterKey, option)}
            >
              <span>{option}</span>
              {selectedValue === option && <span className="filter-dropdown__check">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// ===============================
// MAIN
// ===============================
export default function ForSale() {
  const navigate = useNavigate();

  const [openFilter, setOpenFilter] = useState(null);

  // UI filter (sebelum apply)
  const [pendingFilters, setPendingFilters] = useState({
    style: null,
    price: null,
    height: null,
    width: null,
  });

  // filter yang sudah di-apply (dipakai request)
  const [appliedFilters, setAppliedFilters] = useState({
    style: null,
    price: null,
    height: null,
    width: null,
  });

  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 4 kolom; enak 12 (3 row)
  const [totalPages, setTotalPages] = useState(1);

  // close dropdown kalau klik di luar
  const pageRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!pageRef.current) return;
      if (!pageRef.current.contains(e.target)) setOpenFilter(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleToggleFilter = (filterKey) => {
    setOpenFilter((curr) => (curr === filterKey ? null : filterKey));
  };

  const handleSelectFilter = (filterKey, value) => {
    setPendingFilters((prev) => ({ ...prev, [filterKey]: value }));
    setOpenFilter(null);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      style: pendingFilters.style === "All" ? null : pendingFilters.style,
      price: pendingFilters.price === "All" ? null : pendingFilters.price,
      height: pendingFilters.height === "All" ? null : pendingFilters.height,
      width: pendingFilters.width === "All" ? null : pendingFilters.width,
    });
    setCurrentPage(1);
  };

  // convert filter label -> query params backend
  const queryString = useMemo(() => {
    const priceRange = appliedFilters.price ? PRICE_RANGES[appliedFilters.price] : null;
    const heightRange = appliedFilters.height ? HEIGHT_RANGES[appliedFilters.height] : null;
    const widthRange = appliedFilters.width ? WIDTH_RANGES[appliedFilters.width] : null;

    return buildQuery({
      style: appliedFilters.style || "",
      priceMin: priceRange ? priceRange.min : "",
      priceMax: priceRange ? priceRange.max : "",
      heightMin: heightRange ? heightRange.min : "",
      heightMax: heightRange ? heightRange.max : "",
      widthMin: widthRange ? widthRange.min : "",
      widthMax: widthRange ? widthRange.max : "",
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
  }, [appliedFilters, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/for-sale${queryString}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Gagal ambil data for sale");

      const list = Array.isArray(data?.artworks) ? data.artworks : [];
      setItems(list);

      const tp = Number(data?.totalPages || 1);
      setTotalPages(tp > 0 ? tp : 1);
    } catch (e) {
      setErrMsg(e?.message || "Terjadi kesalahan");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDetail = (artworkId) => {
    navigate(`/for-sale/${artworkId}`);
  };

  return (
    <main className="for-sale-page" ref={pageRef}>
      <div className="for-sale-page__container">
        {/* FILTER BAR */}
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

          <button className="for-sale-filter-bar__apply" type="button" onClick={handleApplyFilters}>
            <img src={FilterIcon} alt="Filter" className="for-sale-filter-bar__apply-icon" />
            <span className="for-sale-filter-bar__apply-text">Filter</span>
          </button>
        </section>

        {/* GRID */}
        <section className="for-sale-artworks">
          <div className="for-sale-artworks__grid">
            {loading && (
              <p className="for-sale-artworks__empty">Loading...</p>
            )}

            {!loading && errMsg && (
              <p className="for-sale-artworks__empty">
                {errMsg}
              </p>
            )}

            {!loading && !errMsg && items.length === 0 && (
              <p className="for-sale-artworks__empty">
                Belum ada artwork for sale.
              </p>
            )}

            {!loading &&
              !errMsg &&
              items.map((artwork) => {
                const id = artwork.id;
                const title = artwork.title || "-";
                const artist = artwork.artist_name || "Unknown";
                const priceText = formatRp(artwork.price);
                const height = artwork.height_cm ?? artwork.heightCm ?? "";
                const width = artwork.width_cm ?? artwork.widthCm ?? "";
                const frame = artwork.frame || artwork.frame_details || "";
                const image = artwork.image_url || artwork.image || "";

                return (
                  <article key={id} className="artwork-card">
                    <div className="artwork-card__image-wrapper">
                      <img
                        src={image}
                        alt={title}
                        className="artwork-card__image"
                        onClick={() => handleOpenDetail(id)}
                        style={{ cursor: "pointer" }}
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
                      <h3 className="artwork-card__title">{title}</h3>
                      <button type="button" className="artwork-card__wishlist" aria-label="Wishlist">
                        <span className="artwork-card__wishlist-icon">♡</span>
                      </button>
                    </div>

                    <p className="artwork-card__dimensions">
                      Dimension: {height} x {width} cm
                    </p>
                    <p className="artwork-card__frame">{frame || " "}</p>
                    <p className="artwork-card__price">{priceText}</p>
                    <p className="artwork-card__artist">{artist}</p>
                  </article>
                );
              })}
          </div>
        </section>

        {/* PAGINATION */}
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
            {Array.from({ length: totalPages }, (_, index) => {
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
            disabled={currentPage === totalPages}
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
}
