// src/components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

import {
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineBell,
} from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // nanti kalau ada auth beneran, bersihin token di sini
    localStorage.removeItem("isAuthenticated");
    setIsProfileOpen(false);
    navigate("/login");
  };

  // klik di luar dropdown -> otomatis nutup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goHome = () => navigate("/home");
  const goToCart = () => navigate("/cart");
  const goToFavorites = () => navigate("/favorites");

  return (
    <header className="navbar">
      {/* TOP ROW */}
      <div className="nav-top">
        {/* LEFT LOGO */}
        <div
          className="nav-left"
          onClick={goHome}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="HeArt Logo" className="logo" />
        </div>

        {/* SEARCH BAR */}
        <div className="search-container">
          <BiSearch className="search-icon" />
          <input type="text" placeholder="Artist, Category, Topic" />
        </div>

        {/* RIGHT ICONS */}
        <div className="nav-icons">
          {/* CART */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={goToCart}
            aria-label="Open cart"
          >
            <AiOutlineShoppingCart />
          </button>

          {/* FAVORITES */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={goToFavorites}
            aria-label="Open favourites"
          >
            <AiOutlineHeart />
          </button>

          {/* NOTIFICATION (belum ada aksi) */}
          <button
            type="button"
            className="nav-icon-btn"
            aria-label="Notifications"
          >
            <AiOutlineBell className="bell" />
          </button>

          {/* PROFILE + DROPDOWN */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="profile-btn"
              onClick={toggleProfile}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
            >
              <FaUserCircle className="profile" />
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <span className="profile-name">Hi, User</span>
                  <span className="profile-email">user@example.com</span>
                </div>
                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV MENU */}
      <nav className="nav-menu">
        <Link to="/home">Home</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/for-sale">For Sale</Link>
        <Link to="/artists">Artists</Link>
        <Link to="/about">About Us</Link>
        <Link to="/event">Events</Link>
      </nav>
    </header>
  );
};

export default Navbar;
