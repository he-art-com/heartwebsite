// src/pages/ForSaleDetail.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ForSaleDetail.css";

const API_BASE_URL = "http://localhost:5000";

const toAbsUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const formatRp = (num) => {
  const n = Number(num || 0);
  return "Rp " + n.toLocaleString("id-ID");
};

// bikin link wa.me valid (digits only, +62...)
const normalizeWhatsAppNumber = (raw) => {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/[^\d]/g, "");

  if (!s) return "";

  // kalau 0xxxx -> 62xxxx
  if (s.startsWith("0")) s = "62" + s.slice(1);
  // kalau 8xxxx (tanpa 0/62) -> 62xxxx
  if (s.startsWith("8")) s = "62" + s;

  return s;
};

export default function ForSaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState(null);
  const [recommend, setRecommend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ===== fetch detail =====
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(`${API_BASE_URL}/api/for-sale/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.message || "Artwork not available");

        const a = data.artwork || null;
        if (!a) throw new Error("Data artwork kosong.");

        setArtwork({
          ...a,
          image_url: toAbsUrl(a.image_url),
        });
      } catch (e) {
        setErrMsg(e.message || "Gagal mengambil detail artwork.");
        setArtwork(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // ===== fetch recommend =====
  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/for-sale`);
        const data = await res.json();
        if (!res.ok) return;

        const list = (data.artworks || [])
          .filter((x) => String(x.id) !== String(id))
          .slice(0, 8)
          .map((x) => ({ ...x, image_url: toAbsUrl(x.image_url) }));

        setRecommend(list);
      } catch {
        // silent
      }
    };

    fetchRecommend();
  }, [id]);

  const waNumber = useMemo(() => {
    if (!artwork) return "";
    const raw = artwork.artist_whatsapp || artwork.whatsapp_number || "";
    return normalizeWhatsAppNumber(raw);
  }, [artwork]);

  const handleMakeOffer = () => {
    if (!artwork) return;

    if (!waNumber) {
      alert("Nomor WhatsApp seniman belum tersedia di database.");
      return;
    }

    const title = artwork.title || "Artwork";
    const priceText = artwork.price ? formatRp(artwork.price) : "-";
    const sizeText =
      artwork.height_cm && artwork.width_cm
        ? `${artwork.height_cm} x ${artwork.width_cm} cm`
        : artwork.height_cm
        ? `${artwork.height_cm} cm`
        : artwork.width_cm
        ? `${artwork.width_cm} cm`
        : "-";

    const msg = `Halo kak, saya tertarik dengan karya "${title}" di HeArt.
Harga: ${priceText}
Ukuran: ${sizeText}
Link: ${window.location.href}

Boleh nego / make an offer? 🙂`;

    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>{errMsg}</h2>
        <button
          type="button"
          className="btn-primary-black"
          onClick={() => navigate("/for-sale")}
          style={{ marginTop: 16 }}
        >
          Back to For Sale
        </button>
      </div>
    );
  }

  if (!artwork) return null;

  return (
    <main className="for-sale-detail">
      {/* BREADCRUMB */}
      <section className="for-sale-detail__breadcrumb">
        <span
          className="breadcrumb-sale"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/for-sale")}
        >
          For Sale /
        </span>
        <span className="breadcrumb-detail">Detail</span>
      </section>

      {/* HERO */}
      <section className="for-sale-detail__hero-v2">
        {/* LEFT */}
        <div className="for-sale-detail__left">
          <div className="for-sale-detail__image-frame">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="for-sale-detail__image"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="for-sale-detail__right">
          <h1 className="for-sale-detail__title">{artwork.title || "UNTITLED"}</h1>

          <p className="for-sale-detail__byline">
            By {artwork.artist_name || "Unknown Artist"}
          </p>

          <div className="for-sale-detail__meta-row">
            <div>
              <p className="for-sale-detail__price">{formatRp(artwork.price)}</p>
              <p className="for-sale-detail__dimension">
                Dimension: {artwork.height_cm ?? "-"} Cm x {artwork.width_cm ?? "-"} Cm
              </p>
            </div>

            <p className="for-sale-detail__stock">Available</p>
          </div>

          <div className="for-sale-detail__actions">
            <button type="button" className="for-sale-detail__btn-cart">
              Add to cart
            </button>

            <button
              type="button"
              className="for-sale-detail__btn-offer"
              onClick={handleMakeOffer}
              disabled={!waNumber}
              title={waNumber ? `Chat WhatsApp: ${waNumber}` : "No WhatsApp number"}
              style={!waNumber ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
            >
              Make an Offer
            </button>
          </div>

          <h2 className="for-sale-detail__section-title">About The Art</h2>

          <div className="for-sale-detail__specs">
            <div className="spec-row">
              <span className="spec-key">Type:</span>
              <span className="spec-val">{artwork.category || "-"}</span>
            </div>

            <div className="spec-row">
              <span className="spec-key">Style:</span>
              <span className="spec-val">{artwork.style || "-"}</span>
            </div>

            <div className="spec-row">
              <span className="spec-key">Size:</span>
              <span className="spec-val">
                {artwork.height_cm ?? "-"} Cm x {artwork.width_cm ?? "-"} Cm
              </span>
            </div>

            <div className="spec-row">
              <span className="spec-key">Shipping:</span>
              <span className="spec-val">{artwork.shipping_from || "Indonesia"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="for-sale-detail__history">
        <div className="for-sale-detail__history-container">
          <h2 className="for-sale-detail__history-title">Artwork Description</h2>

          <div className="for-sale-detail__history-text">
            <p>{artwork.description || "No description."}</p>
          </div>

          <div className="for-sale-detail__artist-card">
            <div className="for-sale-detail__artist-card-inner">
              <h3 className="for-sale-detail__artist-name">
                {artwork.artist_name || "Unknown Artist"}
              </h3>
              <p className="for-sale-detail__artist-location">
                {artwork.address || "Indonesia"}
              </p>
              <p className="for-sale-detail__artist-bio">
                {artwork.bio || "Artist bio can be connected later from user profile."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMEND */}
      <section className="for-sale-detail__recommend">
        <div className="for-sale-detail__recommend-container">
          <h2 className="for-sale-detail__recommend-title">You May Interested in</h2>

          <div className="for-sale-detail__recommend-grid">
            {recommend.map((item) => (
              <article
                key={item.id}
                className="recommend-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/for-sale/${item.id}`)}
              >
                <div className="recommend-card__img-wrap">
                  <img src={item.image_url} alt={item.title} className="recommend-card__img" />
                </div>

                <div className="recommend-card__head">
                  <h3 className="recommend-card__title">{item.title}</h3>
                  <button
                    className="recommend-card__wish"
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ♡
                  </button>
                </div>

                <p className="recommend-card__dim">
                  Dimension: {item.height_cm ?? "-"} x {item.width_cm ?? "-"} cm
                </p>

                <p className="recommend-card__price">{formatRp(item.price)}</p>
                <p className="recommend-card__artist">
                  By {item.artist_name || "Unknown Artist"}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
