// src/pages/AboutOurStory.js
import React from "react";
import "./AboutOurStory.css";

import storyImg1 from "../assets/images/23.jpg";
import storyImg2 from "../assets/images/29.jpg";
import storyImg3 from "../assets/images/28.jpg";

const AboutOurStory = () => {
  return (
    <div className="story-page">

      {/* SECTION 1 */}
      <p className="story-breadcrumb">
        <span className="story-breadcrumb-prev">About Us /</span>
        <span className="story-breadcrumb-current"> Our Story</span>
      </p>

      <section className="story-hero-row">
        <h1 className="story-hero-heading">Our Story</h1>

        <div className="story-hero-image-wrapper">
          <img
            src={storyImg1}
            alt="People viewing artwork in a gallery"
            className="story-hero-image"
          />
        </div>
      </section>

      <section className="story-intro">
        <h2 className="story-intro-title">HeArt</h2>

        <p className="story-intro-text">
          was born from a simple idea: art should be something everyone can
          reach, understand, and feel connected to — not just a world reserved
          for a few. What started as a passion project to make discovering art
          easier has grown into a digital space where artists and audiences meet
          with clarity, confidence, and creativity.
        </p>
      </section>

      {/* SECTION 2 */}
       <section className="story-section story-split">
        <div className="story-split-img">
          <img
            src={storyImg2}
            alt="People enjoying art together"
          />
        </div>

        <div className="story-split-text">
          <p className="story-split-body">
            Built for the new generation of art lovers, HeArt brings together
            emerging creators, curious buyers, and lifelong collectors in one
            accessible ecosystem. Here, users can explore artworks, learn the
            stories behind them, and support artists directly — all through a
            platform designed to feel intuitive, warm, and genuinely human.
          </p>
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="story-section story-purpose">
        <div className="story-purpose-row">
          <div className="story-purpose-text">
            <p>
              As our community grows, our purpose
              <br />
              stays the same:
            </p>
            <p className="story-purpose-strong">
              to open the art world to everyone,
              <br />
              everywhere — and to give artists the
              <br />
              space they deserve to thrive.
            </p>
          </div>

          <div className="story-purpose-img">
            <img src={storyImg3} alt="HeArt community" />
          </div>
        </div>

        <div className="story-purpose-bottom">
          <p className="story-purpose-bottom-title">At HeArt</p>
          <p className="story-purpose-bottom-text">
            we celebrate creativity not just as something to look at, but as
            something to belong to. And this is only the beginning.
          </p>
        </div>
      </section>

    </div>
  );
};

export default AboutOurStory;
