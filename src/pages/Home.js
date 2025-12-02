import React, { useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

/* IMPORT IMAGES */
import img1 from "../assets/images/1.png";
import img2 from "../assets/images/2.png";
import img3 from "../assets/images/3.png";
import img4 from "../assets/images/4.png";
import img5 from "../assets/images/5.png";
import img6 from "../assets/images/6.jpg";
import img7 from "../assets/images/7.png";
import img8 from "../assets/images/8.jpg";
import img9 from "../assets/images/9.png";
import img10 from "../assets/images/10.jpg";

function Home() {
  const navigate = useNavigate();

  // daftar artwork yang akan diputar
  const artworks = [
    { img: img3, title: "Leonardo da Vinci, Mona Lisa, 1503" },
    { img: img1, title: "Elias Tinoco, Harmonia Mundi, 1703" },
    { img: img7, title: "Cassian Alistair, The Starry Night, 1803" },
    { img: img2, title: "Art Exhibition Poster, 2024" },
    { img: img4, title: "Matsumi Kanemitsu, Untitled, 1965" },
    { img: img5, title: "IB-AP Art Exhibition Poster, 2025" },
    { img: img6, title: "George Romney, Portrait Study" },
    { img: img8, title: "Baroque Musicians, 17th c." },
    { img: img9, title: "Art Exhibition Day #5 Poster" },
    { img: img10, title: "Discover our Artworks Banner" },
  ];

  const TOTAL_PAGES = 10; // biar sesuai desain: 1 of 10
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 1 ? TOTAL_PAGES : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === TOTAL_PAGES ? 1 : prev + 1));
  };

  // hitung 3 artwork yang ditampilkan di page sekarang
  const startIndex = (currentPage - 1) % artworks.length;
  const currentArtworks = [
    artworks[startIndex],
    artworks[(startIndex + 1) % artworks.length],
    artworks[(startIndex + 2) % artworks.length],
  ];

  // klik Explore => scroll ke favorites
  const handleExploreClick = () => {
    const section = document.getElementById("favorites-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home">
      {/* ====================== HERO ========================== */}
      <section className="hero">
        <img className="hero-bg" src={img8} alt="Hero" />

        <div className="hero-text">
          <h1>Discover and Buy Art That Moves You</h1>
          <p>
            Discover, collect, and connect with artworks that speak to you.
            HeArt makes the art world easier to explore—beautiful, accessible,
            and built for everyone.
          </p>
        </div>
      </section>

      {/* ====================== FAVORITES ========================== */}
      <section className="favorites" id="favorites-section">
        <h2>A few of our favorites</h2>

        <div className="fav-grid">
          {currentArtworks.map((art, idx) => (
            <div className="fav-card" key={idx}>
              <img src={art.img} alt={`Artwork ${idx + 1}`} />
              <p className="title">{art.title}</p>
            </div>
          ))}
        </div>

        {/* ================== GARIS + PAGINATION ================== */}
        <div className="fav-pagination">
          <div className="fav-line" />

          <div className="fav-page-inline">
            <button
              className="fav-arrow-inline"
              type="button"
              onClick={handlePrev}
              aria-label="Previous artworks"
            >
              &lt;
            </button>

            <span className="fav-page-text-inline">
              {currentPage} of {TOTAL_PAGES}
            </span>

            <button
              className="fav-arrow-inline"
              type="button"
              onClick={handleNext}
              aria-label="Next artworks"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* ====================== DISCOVER ARTWORKS ========================== */}
      <section className="discover">
        <img
          src={img10}
          alt="Discover Artworks Banner"
          className="discover-bg"
        />

        <div className="discover-text">
          <h2>Discover our Artworks.</h2>
          <p>
            Explore a curated collection of works from creators across eras and
            cultures.
            <br />
            Explore by artist, and more.
          </p>

          <button
            className="discover-explore-btn"
            type="button"
            onClick={handleExploreClick}
          >
            <span className="discover-explore-arrow">→</span>
            <span>Explore by artist, and more</span>
          </button>
        </div>
      </section>

      {/* ====================== UPCOMING EVENTS ========================== */}
      <section className="events">
        <h2>Upcoming Events</h2>

        <div className="event-grid">
          <div className="event-card">
            <img src={img9} alt="Event 1" />
            <p className="title">Art Exhibition Day #5</p>
            <p className="subtitle">19 August – 24 August 2025</p>
            <p className="location">GOR Senayan Jakarta</p>
          </div>

          <div className="event-card">
            <img src={img2} alt="Event 2" />
            <p className="title">Art Exhibition Day #4</p>
            <p className="subtitle">29 July – 24 July 2025</p>
            <p className="location">Tennis Indoor Senayan</p>
          </div>

          <div className="event-card">
            <img src={img5} alt="Event 3" />
            <p className="title">Art Exhibition Day #2</p>
            <p className="subtitle">18 – 24 April 2025</p>
            <p className="location">Gelora Bung Karno Stadium</p>
          </div>
        </div>
      </section>

      {/* ====================== FEATURED ARTIST ========================== */}
      <section className="artists">
        <div className="artists-header">
          <h2>Featured Artist</h2>

          <button
            className="see-all-artists"
            type="button"
            onClick={() => navigate("/artists")}
          >
            See All Artists
          </button>
        </div>

        <div className="artist-grid">
          <div className="artist-card">
            <img src={img6} alt="Artist 1" />
            <p className="name">George Romney</p>
            <p className="subtitle">British, 1734-1802</p>
            <button className="view-btn">View Profile</button>
          </div>

          <div className="artist-card">
            <img src={img7} alt="Artist 2" />
            <p className="name">Cassian Alistair</p>
            <p className="subtitle">born.</p>
            <button className="view-btn">View Profile</button>
          </div>

          <div className="artist-card">
            <img src={img4} alt="Artist 3" />
            <p className="name">Matsumi Kanemitsu</p>
            <p className="subtitle">American, 1922-1992</p>
            <button className="view-btn">View Profile</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
