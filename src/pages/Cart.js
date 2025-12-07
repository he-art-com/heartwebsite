// src/pages/Cart.js
import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems, toggleCart } = useStore();

  // total item (belum hitung uang beneran karena format Rp. xx.xxx.xxx)
  const totalItems = cartItems.length;

  const summaryText = useMemo(() => {
    if (totalItems === 0) return "Your cart is empty.";
    if (totalItems === 1) return "1 artwork in your cart.";
    return `${totalItems} artworks in your cart.`;
  }, [totalItems]);

  return (
    <main className="cart-page container">
      <header className="cart-header">
        <div>
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">{summaryText}</p>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>No artworks in your cart yet.</p>
          <span>Add artworks to your cart from the Artists page.</span>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left: list */}
          <section className="cart-list">
            {cartItems.map((item) => (
              <article key={item.key} className="cart-item-card">
                <div className="cart-item-image-wrapper">
                  <img src={item.image} alt={item.title} />
                </div>

                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-artist">{item.artistName}</p>
                  <p className="cart-item-price">{item.price}</p>

                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() =>
                      toggleCart(item.artistId, item.artworkId, item)
                    }
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* Right: summary box */}
          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <p className="cart-summary-line">
              Items <span>{totalItems}</span>
            </p>
            {/* kalau nanti mau hitung total harga, tinggal tambahin di sini */}
            <button type="button" className="cart-checkout-btn">
              Proceed to Checkout
            </button>
            <p className="cart-summary-note">
              This is a demo checkout. You can plug in a real payment flow
              later.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;
