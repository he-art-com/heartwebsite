// src/pages/Favorites.js
import React, { useMemo, useState } from "react";
import "./Favorites.css";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useStore } from "../context/StoreContext";

// helper: parse "Dimension: 60 cm x 90 cm"
const parseDimension = (meta) => {
  if (!meta) return { height: null, width: null };

  const match = meta.match(/(\d+(?:\.\d+)?)\s*cm\s*x\s*(\d+(?:\.\d+)?)\s*cm/i);
  if (!match) return { height: null, width: null };

  const height = parseFloat(match[1]);
  const width = parseFloat(match[2]);
  return { height, width };
};

const Favorites = () => {
  const { favourites, toggleFavourite, toggleCart, isInCart } = useStore();

  // ===== FILTER STATE =====
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("none");
  const [heightFilter, setHeightFilter] = useState("all");
  const [widthFilter, setWidthFilter] = useState("all");

  // panel filter open / close
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleResetFilters = () => {
    setStyleFilter("all");
    setPriceFilter("none");
    setHeightFilter("all");
    setWidthFilter("all");
  };

  // klik tombol Filter:
  // - kalau lagi tertutup -> buka panel
  // - kalau lagi kebuka -> tutup + reset filter
  const handleFilterButtonClick = () => {
    if (filtersOpen) {
      handleResetFilters();
      setFiltersOpen(false);
    } else {
      setFiltersOpen(true);
    }
  };

  // ===== APPLY FILTER & SORT =====
  const filteredItems = useMemo(() => {
    let items = [...favourites];

    // STYLE
    if (styleFilter !== "all") {
      items = items.filter((item) => {
        const style = (item.style || "other").toLowerCase();
        return style === styleFilter;
      });
    }

    // HEIGHT & WIDTH dari meta/dimension
    items = items.filter((item) => {
      const metaText = item.meta || item.dimension || "";
      const { height, width } = parseDimension(metaText);

      // height filter
      if (heightFilter !== "all" && height != null) {
        if (heightFilter === "<80" && !(height < 80)) return false;
        if (heightFilter === "80-120" && !(height >= 80 && height <= 120))
          return false;
        if (heightFilter === ">120" && !(height > 120)) return false;
      }

      // width filter
      if (widthFilter !== "all" && width != null) {
        if (widthFilter === "<80" && !(width < 80)) return false;
        if (widthFilter === "80-120" && !(width >= 80 && width <= 120))
          return false;
        if (widthFilter === ">120" && !(width > 120)) return false;
      }

      return true;
    });

    // PRICE sort – price string "Rp 2.500.000"
    if (priceFilter !== "none") {
      items.sort((a, b) => {
        const numA = parseInt(
          String(a.price || "0").replace(/[^\d]/g, ""),
          10
        );
        const numB = parseInt(
          String(b.price || "0").replace(/[^\d]/g, ""),
          10
        );
        if (priceFilter === "asc") return numA - numB;
        if (priceFilter === "desc") return numB - numA;
        return 0;
      });
    }

    return items;
  }, [favourites, styleFilter, priceFilter, heightFilter, widthFilter]);

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        {/* breadcrumb */}
        <div className="favorites-breadcrumb">
          <span className="favorites-breadcrumb-link">Home</span>
          <span className="favorites-breadcrumb-separator">/</span>
          <span className="favorites-breadcrumb-current">Favorites</span>
        </div>

        {/* header title */}
        <header className="favorites-header">
          <div className="favorites-header-main">
            <h1 className="favorites-title">Your Favorite Artworks</h1>
            <p className="favorites-subtitle">
              Save artworks you love and revisit them anytime
            </p>
          </div>
        </header>

        {/* FILTER BAR (bisa open / close) */}
        <section
          className={`favorites-filter-bar ${
            filtersOpen ? "is-open" : "is-collapsed"
          }`}
        >
          {filtersOpen && (
            <div className="favorites-filter-groups">
              {/* STYLE */}
              <div className="favorites-filter-group">
                <span className="favorites-filter-label">STYLE</span>
                <div className="favorites-filter-select-wrapper">
                  <select
                    className="favorites-filter-select"
                    value={styleFilter}
                    onChange={(e) => setStyleFilter(e.target.value)}
                  >
                    <option value="all">All styles</option>
                    <option value="realism">Realism</option>
                    <option value="surrealism">Surrealism</option>
                    <option value="abstract">Abstract</option>
                    <option value="other">Other</option>
                  </select>
                  <span
                    className="favorites-filter-arrow"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* PRICE */}
              <div className="favorites-filter-group">
                <span className="favorites-filter-label">PRICE</span>
                <div className="favorites-filter-select-wrapper">
                  <select
                    className="favorites-filter-select"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="none">Default</option>
                    <option value="asc">Low to high</option>
                    <option value="desc">High to low</option>
                  </select>
                  <span
                    className="favorites-filter-arrow"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* HEIGHT */}
              <div className="favorites-filter-group">
                <span className="favorites-filter-label">HEIGHT</span>
                <div className="favorites-filter-select-wrapper">
                  <select
                    className="favorites-filter-select"
                    value={heightFilter}
                    onChange={(e) => setHeightFilter(e.target.value)}
                  >
                    <option value="all">All heights</option>
                    <option value="<80">&lt; 80 cm</option>
                    <option value="80-120">80–120 cm</option>
                    <option value=">120">&gt; 120 cm</option>
                  </select>
                  <span
                    className="favorites-filter-arrow"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* WIDTH */}
              <div className="favorites-filter-group">
                <span className="favorites-filter-label">WIDTH</span>
                <div className="favorites-filter-select-wrapper">
                  <select
                    className="favorites-filter-select"
                    value={widthFilter}
                    onChange={(e) => setWidthFilter(e.target.value)}
                  >
                    <option value="all">All widths</option>
                    <option value="<80">&lt; 80 cm</option>
                    <option value="80-120">80–120 cm</option>
                    <option value=">120">&gt; 120 cm</option>
                  </select>
                  <span
                    className="favorites-filter-arrow"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}

          {/* tombol Filter kanan */}
          <button
            type="button"
            className="favorites-filter-button"
            onClick={handleFilterButtonClick}
          >
            <span className="favorites-filter-icon" aria-hidden="true" />
            <span>Filter</span>
          </button>
        </section>

        {/* info jumlah pieces (tetap kelihatan walau panel ditutup) */}
        <div className="favorites-count">
          Showing {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "piece" : "pieces"}
        </div>

        {/* grid artworks */}
        {filteredItems.length === 0 ? (
          <div className="favorites-empty">
            You don&apos;t have any favourite artworks yet.
          </div>
        ) : (
          <section className="favorites-grid">
            {filteredItems.map((item) => {
              const inCart = isInCart(item.artistId, item.artworkId);
              const metaText =
                item.meta || item.dimension || "Dimension: -";

              return (
                <article key={item.key} className="favorites-card">
                  <div className="favorites-card-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="favorites-card-image"
                    />
                  </div>

                  <div className="favorites-card-body">
                    <div className="favorites-card-text">
                      <h3 className="favorites-card-title">
                        {item.title || "Untitled"}
                      </h3>
                      <p className="favorites-card-meta">{metaText}</p>

                      <p className="favorites-card-price">
                        {item.price || "Rp -"}
                      </p>
                      <p className="favorites-card-artist">
                        {item.artistName || "Unknown artist"}
                      </p>
                    </div>

                    {/* heart + cart (remove & in-cart) */}
                    <div className="favorites-card-actions">
                      <button
                        type="button"
                        className="favorites-icon-btn favorites-icon-heart"
                        aria-label="Remove from favourites"
                        onClick={() =>
                          toggleFavourite(
                            item.artistId,
                            item.artworkId,
                            item
                          )
                        }
                      >
                        <FiHeart />
                      </button>

                      <button
                        type="button"
                        className={`favorites-icon-btn favorites-icon-cart ${
                          inCart ? "is-in-cart" : ""
                        }`}
                        aria-label={
                          inCart ? "Remove from cart" : "Add to cart"
                        }
                        onClick={() =>
                          toggleCart(item.artistId, item.artworkId, item)
                        }
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default Favorites;
