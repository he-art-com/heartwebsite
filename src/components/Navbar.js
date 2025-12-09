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
import { FiSettings } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // fungsi load user dari localStorage
  const loadUserFromStorage = () => {
    const stored = localStorage.getItem("heart_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Error parse heart_user:", err);
      }
    } else {
      setUser(null);
    }
  };

  // Load user saat Navbar pertama kali mount
  useEffect(() => {
    loadUserFromStorage();

    // dengarkan event custom dari ProfileSettings
    const handler = () => loadUserFromStorage();
    window.addEventListener("heart_user_updated", handler);

    return () => {
      window.removeEventListener("heart_user_updated", handler);
    };
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // bersihkan semua jejak login
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("heart_token");
    localStorage.removeItem("heart_user");

    setUser(null);
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

  const displayName = user?.nickname || user?.full_name || "Hi, User";
  const displayEmail = user?.email || "user@example.com";

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

          {/* NOTIFICATION */}
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
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="nav-avatar"
                />
              ) : (
                <FaUserCircle className="profile" />
              )}
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-info">
                    <span className="profile-name">{displayName}</span>
                    <span className="profile-email">{displayEmail}</span>
                  </div>

                  {/* ICON SETTINGS → KE PROFILE */}
                  <button
                    type="button"
                    className="settings-btn"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                    aria-label="Profile settings"
                  >
                    <FiSettings size={18} />
                  </button>
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
