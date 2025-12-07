// src/pages/Favorites.js
import React from "react";
import { useStore } from "../context/StoreContext";
import "./Favorites.css"; // kalau mau pisah styling, boleh juga pakai Artists.css dulu

const Favorites = () => {
  const { favourites, toggleFavourite, toggleCart, isInCart } = useStore();

  return (
    <main className="favorites-page container">
      <header className="favorites-header">
        <div>
          <h1 className="favorites-title">My Favourites</h1>
          <p className="favorites-subtitle">
            Save the artworks you love and come back to them anytime.
          </p>
        </div>
      </header>

      {favourites.length === 0 ? (
        <div className="favorites-empty">
          <p>You haven&apos;t favourited any artworks yet.</p>
          <span>Browse Artists and tap the heart icon to save artworks.</span>
        </div>
      ) : (
        <section className="favorites-grid">
          {favourites.map((item) => (
            <article key={item.key} className="favorites-card">
              <div className="favorites-image-wrapper">
                <img src={item.image} alt={item.title} />
              </div>

              <div className="favorites-info">
                <h3 className="favorites-art-title">{item.title}</h3>
                <p className="favorites-artist-name">{item.artistName}</p>
                <p className="favorites-price">{item.price}</p>

                <div className="favorites-actions">
                  <button
                    type="button"
                    className="favorites-btn-secondary"
                    onClick={() =>
                      toggleFavourite(item.artistId, item.artworkId, item)
                    }
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="favorites-btn-primary"
                    onClick={() =>
                      toggleCart(item.artistId, item.artworkId, item)
                    }
                  >
                    {isInCart(item.artistId, item.artworkId)
                      ? "In Cart"
                      : "Add to Cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Favorites;
