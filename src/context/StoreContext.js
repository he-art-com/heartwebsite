// src/context/StoreContext.js
import React, { createContext, useContext, useState } from "react";

const StoreContext = createContext();

const makeKey = (artistId, artworkId) => `${artistId}-${artworkId}`;

export const StoreProvider = ({ children }) => {
  // artistId -> true/false
  const [followedArtists, setFollowedArtists] = useState({});
  // [{ key, artistId, artistName, title, price, image }]
  const [favourites, setFavourites] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  /* ========= FOLLOW ARTIST ========= */
  const toggleFollowArtist = (artistId) => {
    setFollowedArtists((prev) => ({
      ...prev,
      [artistId]: !prev[artistId],
    }));
  };

  const isArtistFollowed = (artistId) => !!followedArtists[artistId];

  /* ========= FAVOURITES ========= */
  const toggleFavourite = (artistId, artworkId, artworkData) => {
    const key = makeKey(artistId, artworkId);
    setFavourites((prev) => {
      const exists = prev.find((item) => item.key === key);
      if (exists) {
        // kalau sudah ada => remove
        return prev.filter((item) => item.key !== key);
      }
      // kalau belum => add
      return [...prev, { key, artistId, artworkId, ...artworkData }];
    });
  };

  const isFavourite = (artistId, artworkId) => {
    const key = makeKey(artistId, artworkId);
    return favourites.some((item) => item.key === key);
  };

  /* ========= CART ========= */
  const toggleCart = (artistId, artworkId, artworkData) => {
    const key = makeKey(artistId, artworkId);
    setCartItems((prev) => {
      const exists = prev.find((item) => item.key === key);
      if (exists) {
        return prev.filter((item) => item.key !== key);
      }
      return [...prev, { key, artistId, artworkId, quantity: 1, ...artworkData }];
    });
  };

  const isInCart = (artistId, artworkId) => {
    const key = makeKey(artistId, artworkId);
    return cartItems.some((item) => item.key === key);
  };

  const value = {
    // follow
    toggleFollowArtist,
    isArtistFollowed,
    followedArtists,
    // favourites
    favourites,
    toggleFavourite,
    isFavourite,
    // cart
    cartItems,
    toggleCart,
    isInCart,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
