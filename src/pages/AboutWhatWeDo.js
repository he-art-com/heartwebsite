import React from "react";
import "./AboutWhatWeDo.css";

import heroImg from "../assets/images/24.jpg";
import featureImg1 from "../assets/images/31.jpg";
import featureImg2 from "../assets/images/30.jpg";

const AboutWhatWeDo = () => {
  return (
    <main className="what-page">
      {/* Breadcrumb */}
      <p className="what-breadcrumb">
        <span className="what-breadcrumb-prev">About Us /</span>
        <span className="what-breadcrumb-current"> What We Do</span>
      </p>
      {/* ============ SECTION 1 ============ */}
      <section className="what-hero">
        <h1 className="what-title">What We Do</h1>

        <div className="what-hero-content">
          <div className="what-hero-image">
            <img src={heroImg} alt="HeArt gallery" />
          </div>

          <div className="what-hero-text">
            <p>
              We make the art world feel closer—through sharp curation,
              thoughtful storytelling, and recommendations that actually get you.
            </p>

            <p>
              In a space that often feels scattered, HeArt brings everything
              together so living with art becomes easy, inspiring, and naturally
              part of your life.
            </p>
          </div>
        </div>

      </section>

      {/* ============ SECTION 2 ============ */}
      <section className="what-section what-section--split">
        <div className="what-s2-text">

            <h2 className="what-s2-heading-main">Global Art Discovery</h2>
            <p className="what-s2-body-main">
            Step into a world where creativity travels without borders. HeArt connects
            you with original works from artists shaping culture across the globe.
            </p>

            <h3 className="what-s2-heading-secondary">Personalized Recommendations</h3>
            <p className="what-s2-body-secondary">
            Your taste is personal—your feed should be too. Follow, like, and get
            tailored drops that match your vibe.
            </p>
        </div>

        <div className="what-s2-image">
            <img src={featureImg1} alt="Art discovery experience" />
        </div>
      </section>

      {/* ============ SECTION 3 ============ */}
      <section className="what-section what-section--split what-section--pricing">
    
        <div className="what-s3-image">
          <img src={featureImg2} alt="Moonlit swan artwork" />
        </div>

        <div className="what-s3-text">
          <h2 className="what-s3-heading-main">
            Transparent Pricing &amp; Market Access
          </h2>
          <p className="what-s3-body-main">
            See real numbers, real data, real value. HeArt gives you full
            visibility so you can collect with confidence.
          </p>

          <h3 className="what-s3-heading-secondary">
            Seamless, Secure Transactions
          </h3>
          <p className="what-s3-body-secondary">
            Buying art should feel good—not stressful. HeArt ensures safe,
            smooth, and trusted transactions every single time.
          </p>
        </div>
      </section>

      <section className="what-section what-insights">
        <h2 className="what-insights-heading">
          Expert Insights &amp; Curation
        </h2>

        <p className="what-insights-text">
          From artist stories to market shifts, get the context behind the
          creativity—delivered in a way that’s smart, simple, and inspiring.
        </p>
      </section>

    </main>
  );
};

export default AboutWhatWeDo;
