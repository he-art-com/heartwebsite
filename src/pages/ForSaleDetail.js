import React from "react";
import { useParams } from "react-router-dom";
import "./ForSaleDetail.css";
import { ARTWORKS } from "./artworks";

import Artwork2 from "../assets/images/3.png";

const ForSaleDetail = () => {
  const { id } = useParams();

  // sementara HARD CODE hanya untuk id = 2
  if (id !== "2") {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>Artwork not available</h2>
      </div>
    );
  }

  return (
    <main className="for-sale-detail">

        {/* ========================= */}
        {/* BREADCRUMB               */}
        {/* ========================= */}
        <section className="for-sale-detail__breadcrumb">
            <span className="breadcrumb-sale">For Sale /</span>
            <span className="breadcrumb-detail">Detail</span>
        </section>

        {/* ========================= */}
        {/* HERO SECTION              */}
        {/* ========================= */}
        <section className="for-sale-detail__hero-v2">
        {/* LEFT: IMAGE */}
        <div className="for-sale-detail__left">
            <div className="for-sale-detail__image-frame">
            <img
                src={Artwork2}
                alt="Umbra Fenestre"
                className="for-sale-detail__image"
            />
            </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="for-sale-detail__right">
            <h1 className="for-sale-detail__title">MONA LISA</h1>
            <p className="for-sale-detail__byline">By Leonardo da Vinci</p>

            <div className="for-sale-detail__meta-row">
            <div>
                <p className="for-sale-detail__price">Rp. 2.500.000</p>
                <p className="for-sale-detail__dimension">Dimension: 60 Cm x 90 Cm</p>
            </div>

            <p className="for-sale-detail__stock">Only 1 Available</p>
            </div>

            <div className="for-sale-detail__actions">
            <button type="button" className="for-sale-detail__btn-cart">
                Add to cart
            </button>
            <button type="button" className="for-sale-detail__btn-offer">
                Make an Offer
            </button>
            </div>

            <h2 className="for-sale-detail__section-title">About The Art</h2>

            <div className="for-sale-detail__specs">
            <div className="spec-row"><span className="spec-key">Type:</span><span className="spec-val">Geometric Art</span></div>
            <div className="spec-row"><span className="spec-key">Medium:</span><span className="spec-val">Paintings › Oil</span></div>
            <div className="spec-row"><span className="spec-key">Style:</span><span className="spec-val">Geometric</span></div>
            <div className="spec-row"><span className="spec-key">Year:</span><span className="spec-val">2011</span></div>
            <div className="spec-row"><span className="spec-key">Size:</span><span className="spec-val">60 Cm x 90 Cm</span></div>
            <div className="spec-row"><span className="spec-key">Ready to hang:</span><span className="spec-val">Yes</span></div>
            <div className="spec-row"><span className="spec-key">Frame:</span><span className="spec-val">No</span></div>
            <div className="spec-row"><span className="spec-key">Materials:</span><span className="spec-val">Oil on canvas</span></div>
            <div className="spec-row"><span className="spec-key">Shipping:</span><span className="spec-val">Ships from Surabaya</span></div>
            </div>
        </div>
        </section>

        {/* ========================= */}
        {/* ARTWORK HISTORY           */}
        {/* ========================= */}
        <section className="for-sale-detail__history">
        <div className="for-sale-detail__history-container">
            <h2 className="for-sale-detail__history-title">Artwork History</h2>

            <div className="for-sale-detail__history-text">
            <p>
                The subject's hand position right hand resting gently on left wrist is an
                important iconographic element. In 16th century portrait body language,
                this gesture symbolizes a wife's modesty and fidelity. Leonardo chose to
                represent this gesture rather than materialistic attributes such as
                wedding rings or excessive jewelry to emphasize the subject's internal virtues.
            </p>
            <p>
                The subject's clothing also holds important clues. Infrared imaging analysis
                by Bruno Mottin detected that the thin fabric covering the subject's shoulders
                is a guarnello. A guarnello is a type of outer garment made of thin linen that
                was historically worn by pregnant women or women who had recently given birth
                in Renaissance Italy. The presence of the guarnello reinforces documentary
                evidence that this painting was created around 1503 to celebrate the birth
                of Lisa Gherardini's second child, and may explain her calm smile as an expression
                of maternal satisfaction.
            </p>
            </div>

            <div className="for-sale-detail__artist-card">
            <div className="for-sale-detail__artist-card-inner">
                <h3 className="for-sale-detail__artist-name">Leonardo da Vinci</h3>
                <p className="for-sale-detail__artist-location">Bogor, Indonesia</p>
                <p className="for-sale-detail__artist-bio">
                Leonardo di ser Piero da Vinci was born on April 15, 1452, in Anchiano,
                near Vinci, in the Republic of Florence. As a Renaissance polymath, he studied
                various disciplines ranging from anatomy and botany to civil engineering.
                Although he was very famous, he completed very few paintings—less than 20 works
                survive today—largely due to his extreme perfectionism and his easily distracted
                interest in scientific studies.
                </p>
            </div>
            </div>
        </div>
        </section>

        {/* ========================= */}
        {/* YOU MAY INTERESTED IN     */}
        {/* ========================= */}
        <section className="for-sale-detail__recommend">
        <div className="for-sale-detail__recommend-container">
            <h2 className="for-sale-detail__recommend-title">
            You May Interested in
            </h2>

            <div className="for-sale-detail__recommend-grid">
            {ARTWORKS.slice(0, 8).map((item) => (
                <article key={item.id} className="recommend-card">
                <div className="recommend-card__img-wrap">
                    <img
                    src={item.image}
                    alt={item.title}
                    className="recommend-card__img"
                    />
                </div>

                <div className="recommend-card__head">
                    <h3 className="recommend-card__title">{item.title}</h3>
                    <button className="recommend-card__wish">♡</button>
                </div>

                <p className="recommend-card__dim">
                    Dimension: {item.height} x {item.width} cm
                </p>

                <p className="recommend-card__price">{item.price}</p>
                <p className="recommend-card__artist">By {item.artist}</p>
                </article>
            ))}
            </div>
        </div>
        </section>
    </main>
  );
};

export default ForSaleDetail;
