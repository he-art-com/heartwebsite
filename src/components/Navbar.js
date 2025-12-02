import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import {
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineBell,
} from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";

const Navbar = () => {
  return (
    <header className="navbar">
      {/* TOP ROW */}
      <div className="nav-top">
        {/* LEFT LOGO (klik => Home) */}
        <div className="nav-left">
          <a href="/" className="logo-link">
            <img src={logo} alt="HeArt Logo" className="logo" />
          </a>
        </div>

        {/* SEARCH BAR */}
        <div className="search-container">
          <BiSearch className="search-icon" />
          <input type="text" placeholder="Artist, Category, Topic" />
        </div>

        {/* RIGHT ICONS */}
        <div className="nav-icons">
          <AiOutlineShoppingCart />
          <AiOutlineHeart />
          <AiOutlineBell className="bell" />
          <FaUserCircle className="profile" />
        </div>
      </div>

      {/* BOTTOM NAV MENU */}
      <nav className="nav-menu">
        <a href="/">Home</a>
        <a href="/gallery">Gallery</a>
        <a href="/for-sale">For Sale</a>
        <a href="/artists">Artists</a>
        <a href="/about">About Us</a>
        <a href="/event">Events</a>
      </nav>
    </header>
  );
};

export default Navbar;
