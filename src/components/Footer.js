import React from "react";
import "./Footer.css";
import logo from "../assets/logo.png";

import {
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineEnvironment,
  AiOutlineInstagram,
  AiOutlineTwitter,
  AiOutlineWhatsApp,
  AiOutlineFacebook,
  AiOutlineMail
} from "react-icons/ai";

const Footer = () => {
  return (
    <>
      <footer className="footer">

        {/* LEFT SECTION */}
        <div className="footer-section about">
          <img src={logo} alt="HeArt Logo" className="footer-logo" />
          <p>
            Empowering students to take control of their mental wellness through AI-powered
            insights and community support.
          </p>
        </div>

        {/* QUICKLINKS */}
        <div className="footer-section">
          <h3>QuickLinks</h3>
          <a href="/">Home</a>
          <a href="/gallery">Gallery</a>
          <a href="/artists">Artists</a>
          <a href="/about">About Us</a>
          <a href="/events">Events</a>
        </div>

        {/* RESOURCES */}
        <div className="footer-section">
          <h3>Resources</h3>
          <a href="/about">About Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/help">Help Center</a>
        </div>

        {/* STAY CONNECTED */}
        <div className="footer-section">
          <h3>Stay Connected</h3>
          <p>Let us know about your thoughts for our website</p>

          <div className="footer-input">
            <input type="text" placeholder="Drop your comment below" />
            <button>Send</button>
          </div>

          <div className="footer-social">
            <AiOutlineInstagram />
            <AiOutlineTwitter />
            <AiOutlineWhatsApp />
            <AiOutlineFacebook />
            <AiOutlineMail />
          </div>
        </div>
      </footer>

      {/* 🔥 CONTACT INFO BAR (DALAM 1 BARIS) */}
      <div className="footer-contact-bar">
        <div><AiOutlinePhone /> +62 8679-2543-6778</div>
        <div><AiOutlineGlobal /> HeArt.com</div>
        <div><AiOutlineEnvironment /> Jl. Mohammad Hatta no 1, Surabaya Jawa Timur</div>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © 2024 HeArt. All Rights Reserved
      </div>
    </>
  );
};

export default Footer;
