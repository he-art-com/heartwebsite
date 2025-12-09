import React from "react";
import "./AboutMission.css";

// import gambar contoh (pakai gambar kamu sendiri nanti)
import heroImg from "../assets/images/22.jpg";
import missionImg from "../assets/images/25.jpg";
import visionImg from "../assets/images/26.jpg";
import valuesImg from "../assets/images/27.jpg";

export default function AboutMission() {
  return (
    <div className="mission-page">
      {/* Breadcrumb */}
        <p className="mission-breadcrumb">
            <span className="breadcrumb-prev">About Us /</span>
            <span className="breadcrumb-current"> Mission, Vision, and Values</span>
        </p>
      {/* HERO TITLE */}
      <h1 className="mission-main-title">Mission, Vision, and Values</h1>

      {/* HERO IMAGE */}
      <div className="mission-hero-img-wrapper">
        <img src={heroImg} alt="Mission hero" className="mission-hero-img" />
      </div>

      {/* ============================= */}
      {/* SECTION 1 — OUR MISSION */}
      {/* ============================= */}
      <section className="mission-section mission-row">
        
        <div className="mission-text-col">
          <p className="mission-subtitle">Our Mission:</p>

          <h2 className="mission-title">
            Building a Future Where Every Artist Thrives
          </h2>

          <p className="mission-desc">
            Our mission is to create a space where anyone can discover and collect 
            art effortlessly, while giving artists the visibility, support, and 
            opportunities they deserve.
          </p>
        </div>

        <div className="mission-img-col">
          <img src={missionImg} alt="Mission" />
        </div>
      </section>

      {/* ============================= */}
      {/* SECTION 2 — OUR VISION */}
      {/* ============================= */}
      <section className="mission-section mission-row vision-row">

        <div className="mission-img-col">
          <img src={visionImg} alt="Vision" />
        </div>

        <div className="mission-text-col">
          <p className="mission-subtitle">Our Vision:</p>

          <h2 className="mission-title">
            A World Where Art Belongs to Everyone
          </h2>

          <p className="mission-desc">
            To shape a world where art is more than something we see — 
            it's something everyone can access, connect with, and 
            be inspired by, anytime and anywhere.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* SECTION 3 — OUR VALUES */}
      {/* ============================= */}
      <section className="mission-section values-row">

        <div className="mission-text-col">
          <p className="mission-subtitle">Our Values:</p> 

          <p className="values-desc">
            At HE-ART, we lead with integrity and keep our space open and accessible for all. We chase excellence with intention, helping people connect with art in meaningful ways. We stay curious, keep learning, and grow with creativity. With empathy at our core and agility in how we move, we uplift our community and adapt to what they need.
          </p>
        </div>

        <div className="mission-img-col">
          <img src={valuesImg} alt="Values" />
        </div>
      </section>

    </div>
  );
}
