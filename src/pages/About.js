import React, { useRef } from "react";
import "./About.css";
import { Link } from "react-router-dom";

import img1 from "../assets/images/22.jpg";
import img2 from "../assets/images/23.jpg";
import img3 from "../assets/images/24.jpg";

// LIST DATA
const STATS_DATA = [
  { value: "50K", label: "Artists on HeArt" },
  { value: "100K", label: "Artworks Available" },
  { value: "30+", label: "Exhibitions / Year" },
];

const ABOUT_CARDS = [
  {
    title: "Mission, Vision, and Values",
    img: img1,
    alt: "Mission",
  },
  {
    title: "Our Story",
    img: img2,
    alt: "Our Story",
  },
  {
    title: "What We Do",
    img: img3,
    alt: "What We Do",
  },
];

const TESTIMONIALS = [
  {
    name: "Park Chanyeol",
    rating: 4.5,
    text: `What I appreciate most as a user is how HE-ART makes the art world feel open and accessible. Whether I'm looking to buy or just get inspired, the experience always feels welcoming and thoughtfully designed.`,
  },
  {
    name: "Chenle",
    rating: 4.5,
    text: `I’d rate HE-ART a solid 4.5 out of 5. The platform feels fresh, intuitive, and genuinely supportive for both artists and users like me. I love how easy it is to discover new artwork and how responsive the team is whenever I need help. There’s still a bit of room to grow, but honestly, HE-ART already feels like one of the most promising art platforms out there.`,
  },
  {
    name: "Lay",
    rating: 4.5,
    text: `You can tell the platform is run by people who genuinely care. As a user, I’ve always felt supported—whether I’m trying to buy artwork or just browsing. The team is present, helpful, and surprisingly warm for an online marketplace.`,
  },
  {
    name: "Kyle",
    rating: 4.5,
    text: `Really impressed by the service, regular communications and quality of the artwork received. The website was easy to view and shop from with lots of relevant information to help with artwork selection. I received regular email updates which was really useful as it kept me in the know at all times. Thank you so much.`,
  },
];

export default function About() {
  // untuk scroll arrow
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    const amount = 320;
    trackRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="about-container">
      {/* Header Section */}
      <div className="about-header">
        <h1>About Us</h1>
        <p>
          We stand as a global platform where art, creativity, and collectors
          come together — an online marketplace shaped by vision and expression.
        </p>
      </div>

      {/* Stats Section */}
      <div className="about-stats">
        <div className="about-stats-box">
          {STATS_DATA.map((item) => (
            <div className="stat-box" key={item.label}>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div className="about-cards">
        {ABOUT_CARDS.map((card) => {
          let to = "#";

          if (card.title === "Mission, Vision, and Values") {
            to = "/about/mission-vision-values";
          } else if (card.title === "Our Story") {
            to = "/about/our-story";
          } else if (card.title === "What We Do") {
            to = "/about/what-we-do";
          }

          return (
            <Link
              to={to}
              className="card-item"
              key={card.title}
            >
              <img src={card.img} alt={card.alt} className="card-image" />
              <h3 className="card-title">{card.title}</h3>
            </Link>
          );
        })}
      </div>

      {/* Testimonial Section Title */}
      <section className="about-testimonial">
        {/* Judul + summary rating (posisi kiri atas seperti Figma) */}
        <div className="about-testimonial-header">
          <h2 className="about-testimonial-title">HeArt in Their Words</h2>

          <div className="about-testimonial-summary">
            <div className="about-summary-stars">
              <span className="star full">★</span>
              <span className="star full">★</span>
              <span className="star full">★</span>
              <span className="star full">★</span>
              <span className="star half">★</span>
            </div>
            <p className="about-summary-average">4.5 Average</p>
            <p className="about-summary-reviews">952 Reviews</p>
          </div>
        </div>

        {/* Body: arrow kiri - cards - arrow kanan */}
        <div className="about-testimonial-body">
          <button
            type="button"
            className="about-carousel-btn about-carousel-btn-left"
            onClick={() => scroll("left")}
          >
            ‹
          </button>

          <div className="about-testimonial-track" ref={trackRef}>
            {TESTIMONIALS.map((item) => (
              <article className="about-testimonial-card" key={item.name}>
                <header className="about-card-header">
                  <p className="about-card-name">{item.name}</p>
                  <div className="about-card-stars">
                    <span className="star full">★</span>
                    <span className="star full">★</span>
                    <span className="star full">★</span>
                    <span className="star full">★</span>
                    <span className="star half">★</span>
                  </div>
                </header>
                <p className="about-card-text">{item.text}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="about-carousel-btn about-carousel-btn-right"
            onClick={() => scroll("right")}
          >
            ›
          </button>
        </div>
      </section>
    </div>
  );
}
