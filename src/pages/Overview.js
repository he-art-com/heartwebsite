import React from "react";
import { Link } from "react-router-dom";
import "./Overview.css";

// GANTI PATH GAMBAR SESUAI punyamu
import starryNight from "../assets/images/7.png";
import monaLisa from "../assets/images/3.png";
import nymphs from "../assets/images/21.png";
import frameGirl from "../assets/images/13.png";
import oldMan from "../assets/images/14.png";

const Overview = () => {
  return (
    <div className="overview-page">
      <main className="overview-main">
        {/* BREADCRUMB */}
        <div className="overview-breadcrumb container">
          <Link to="/gallery" className="breadcrumb-link">
            Gallery
          </Link>
          <span> / </span>
          <span className="breadcrumb-current">Overview</span>
        </div>

        {/* TOP SECTION: IMAGE + INFO */}
        <section className="overview-hero container">
          <div className="overview-hero-image">
            <img src={starryNight} alt="The Starry Night" />
          </div>

          <div className="overview-hero-info">
            <h1 className="overview-title">THE STARRY NIGHT</h1>
            <p className="overview-artist">By Vincent van Gogh</p>

            <h3 className="overview-subheading">About The Art</h3>

            <dl className="overview-specs">
              <div>
                <dt>Type:</dt>
                <dd>Post-Impressionist Art</dd>
              </div>
              <div>
                <dt>Medium:</dt>
                <dd>Paintings › Oil</dd>
              </div>
              <div>
                <dt>Style:</dt>
                <dd>Expressionistic</dd>
              </div>
              <div>
                <dt>Subject:</dt>
                <dd>Night Landscape (Saint-Rémy-de-Provence)</dd>
              </div>
              <div>
                <dt>Year:</dt>
                <dd>1889 (June)</dd>
              </div>
              <div>
                <dt>Size:</dt>
                <dd>73.7 cm × 92.1 cm</dd>
              </div>
              <div>
                <dt>Ready to hang:</dt>
                <dd>Yes (Currently hanging in Gallery)</dd>
              </div>
              <div>
                <dt>Frame:</dt>
                <dd>Yes (Gilded Museum Frame)</dd>
              </div>
              <div>
                <dt>Signed:</dt>
                <dd>No</dd>
              </div>
              <div>
                <dt>Materials:</dt>
                <dd>Oil on canvas</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ARTWORK HISTORY */}
        <section className="overview-history container">
          <h2>Artwork History</h2>
          <p>
            In the history of Western art, few works possess the universal
            resonance of Vincent van Gogh&apos;s The Starry Night (1889). This
            oil on canvas, now the crown jewel of the Museum of Modern Art
            (MoMA) in New York, transcends its status as a mere visual
            artefact; it is a psychological document, an unintentional
            astronomical study, and a marvel of fluid dynamics that predates
            modern scientific understanding.
          </p>
          <p>
            This report presents an in-depth analysis that goes beyond the
            aesthetic surface to excavate the archaeological layers of its
            provenance, the chemical composition of its pigments, and the
            principles of physics hidden within its iconic impasto
            brushstrokes.
          </p>

          <div className="overview-artist-card">
            <div className="overview-artist-name">
              <strong>Vincent van Gogh</strong>
              <span>Yogyakarta, Indonesia</span>
            </div>
            <p>
              Vincent Willem van Gogh was born on March 30, 1853, in Groot
              Zundert, Netherlands. He was the son of a Protestant minister,
              which explains the strong spiritual themes in his early works
              (such as The Potato Eaters). Surprisingly, his artistic career
              was very short; he only began painting seriously at the age of
              27 and died at the age of 37. In that decade, he produced more
              than 2,100 works of art, including about 860 oil paintings—an
              almost unbelievable burst of creativity.
            </p>
          </div>
        </section>

        {/* LOOK CLOSER */}
        <section className="overview-lookcloser">
          <div className="container overview-lookcloser-inner">
            <div className="overview-lookcloser-text">
              <h2>Look Closer</h2>
              <p>The Starry Night</p>
              <button className="overview-lookcloser-btn">Start</button>
            </div>
            <div className="overview-lookcloser-image">
              <img src={starryNight} alt="Look closer at The Starry Night" />
            </div>
          </div>
        </section>

        {/* WHAT PEOPLE THOUGHTS */}
        <section className="overview-testimonials container">
          <div className="overview-testimonials-header">
            <h2>What People Thoughts</h2>
            <div className="overview-rating">
              <span>★★★★★</span>
              <span>(4.5 Stars) · 23 Review</span>
              <button className="overview-add-review">+ Add Yours</button>
            </div>
          </div>

          <div className="overview-testimonial-grid">
            <article className="overview-testimonial-card">
              <div className="overview-testimonial-author">
                <strong>Imam Najib</strong>
                <span>Yogyakarta, Indonesia</span>
              </div>
              <p>
                Finally, I got to see this masterpiece in person at MoMA in New
                York. Photos on the internet really can&apos;t capture its true
                magic. The first thing that surprised me was the texture of the
                paint (impasto)—it was so thick that it looked like it was
                raised above the canvas!
              </p>
            </article>

            <article className="overview-testimonial-card">
              <div className="overview-testimonial-author">
                <strong>Naya</strong>
                <span>Yogyakarta, Indonesia</span>
              </div>
              <p>
                Standing in front of The Starry Night provides a completely new
                perspective compared to digital reproductions. The use of
                Artificial Ultramarine and Indian Yellow creates intense yet
                harmonious color vibrations.
              </p>
            </article>

            <article className="overview-testimonial-card">
              <div className="overview-testimonial-author">
                <strong>Miara Juni</strong>
                <span>Yogyakarta, Indonesia</span>
              </div>
              <p>
                What is most striking is how Van Gogh visualized the turbulence
                of the wind—scientifically accurate, yet artistically
                expressive. The dark vertical structure of the cypress trees
                serves perfectly as a visual &quot;bridge&quot; connecting the
                sleeping village (earthly) with the turbulent sky (heavenly).
              </p>
            </article>
          </div>
        </section>

        {/* YOU MAY INTERESTED IN */}
        <section className="overview-related container">
          <h2>You May Interested in</h2>

          <div className="overview-related-grid">
            <div className="overview-related-card">
              <img src={monaLisa} alt="Mona Lisa" />
              <h3>Mona Lisa</h3>
              <p>Dimension: 77 cm x 53 cm</p>
            </div>

            <div className="overview-related-card">
              <img src={nymphs} alt="Nymphs' Descent" />
              <h3>Nymphs&apos; Descent</h3>
              <p>Dimension: 80 cm x 60 cm</p>
            </div>

            <div className="overview-related-card">
              <img src={frameGirl} alt="Umbra Fenestrae" />
              <h3>Umbra Fenestrae</h3>
              <p>Dimension: 60 cm x 90 cm</p>
            </div>

            <div className="overview-related-card">
              <img src={oldMan} alt="Le Désespéré" />
              <h3>Le Désespéré</h3>
              <p>Dimension: 150 cm x 240 cm</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Overview;
