import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { AiOutlineShoppingCart, AiOutlineHeart, AiOutlineBell } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";

const Navbar = () => {
  return (
    <header className="navbar">

      {/* TOP ROW */}
      <div className="nav-top">
        {/* LEFT LOGO */}
        <div className="nav-left">
          <img src={logo} alt="HeArt Logo" className="logo" />
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
        <a href="/forsale">For Sale</a>
        <a href="/artists">Artists</a>
        <a href="/about">About Us</a>
        <a href="/events">Events</a>
      </nav>

    </header>
  );
};

export default Navbar;
