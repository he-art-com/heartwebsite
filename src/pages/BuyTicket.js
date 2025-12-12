// src/pages/BuyTicket.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./BuyTicket.css";

// ✅ QR image dari assets (ganti ekstensi kalau beda: .jpg/.jpeg/.webp)
import qrisLocal from "../assets/image 23.png";

const API_BASE_URL = "http://localhost:5000";

// ✅ Merchant name fix jadi HeArt
const MERCHANT_NAME = "HeArt";

const formatRp = (num) => {
  const n = Number(num || 0);
  return "Rp " + n.toLocaleString("id-ID");
};

const formatDateRange = (start, end) => {
  if (!start && !end) return "-";
  try {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    if (s && e) {
      const opt = { day: "2-digit", month: "long", year: "numeric" };
      const sText = s.toLocaleDateString("id-ID", opt);
      const eText = e.toLocaleDateString("id-ID", opt);
      if (sText === eText) return sText;
      return `${sText} - ${eText}`;
    }

    const only = (s || e).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return only;
  } catch {
    return start || end || "-";
  }
};

const formatTimeRange = (start, end) => {
  if (!start && !end) return "-";
  try {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;

    const opt = { hour: "2-digit", minute: "2-digit" };

    if (s && e) {
      const sText = s.toLocaleTimeString("id-ID", opt);
      const eText = e.toLocaleTimeString("id-ID", opt);
      return `${sText} - ${eText} WIB`;
    }

    const only = (s || e).toLocaleTimeString("id-ID", opt);
    return `${only} WIB`;
  } catch {
    return "-";
  }
};

const BuyTicket = () => {
  const { id } = useParams();

  const [step, setStep] = useState(1);

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Data Pembeli
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // jumlah tiket per ticket_id
  const [ticketCounts, setTicketCounts] = useState({});

  // hanya QRIS
  const paymentMethod = "QRIS";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat detail event.");
        }

        const backendEvent = data.event;
        const backendTickets = data.tickets || [];

        setEvent({
          id: backendEvent.id,
          title: backendEvent.title,
          location: backendEvent.location,
          start_date: backendEvent.start_datetime,
          end_date: backendEvent.end_datetime,
          poster: backendEvent.poster_url || "/images/9.png",
          organizer_whatsapp: backendEvent.organizer_whatsapp || "",
        });

        setTickets(backendTickets);
        setTicketCounts({});
      } catch (err) {
        console.error("fetchEvent error:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const getCount = (ticketId) => ticketCounts[ticketId] || 0;

  const totalAmount = tickets.reduce((sum, t) => {
    const qty = getCount(t.id);
    const price = Number(t.price) || 0;
    return sum + qty * price;
  }, 0);

  const handleTicketChange = (ticket, operation) => {
    setTicketCounts((prev) => {
      const current = prev[ticket.id] || 0;
      let next = current;

      if (operation === "+") {
        const quota = ticket.quota != null ? Number(ticket.quota) : null;
        if (quota == null || current < quota) {
          next = current + 1;
        } else {
          alert(`Kuota untuk tiket "${ticket.ticket_type}" hanya ${quota} tiket.`);
        }
      } else if (operation === "-") {
        if (current > 0) next = current - 1;
      }

      return { ...prev, [ticket.id]: next };
    });
  };

  const handleBuyClick = () => {
    if (totalAmount <= 0) return alert("Silakan pilih minimal 1 tiket!");
    if (!fullName) return alert("Mohon isi nama lengkap Anda.");
    if (!email) return alert("Mohon isi email Anda.");

    setStep(2);
    window.scrollTo(0, 0);
  };

  const sendOrdersToBackend = async () => {
    const payloads = tickets
      .map((t) => ({
        ticket_id: t.id,
        quantity: getCount(t.id),
      }))
      .filter((p) => p.quantity > 0);

    if (payloads.length === 0) return;

    for (const item of payloads) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${id}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_id: item.ticket_id,
            quantity: item.quantity,
            customer_name: fullName,
            customer_email: email,
            payment_method: paymentMethod,
          }),
        });

        const data = await res.json();
        if (!res.ok) console.error("Order error:", data);
      } catch (err) {
        console.error("sendOrdersToBackend error:", err);
      }
    }
  };

  const handleConfirmToWA = async () => {
    if (totalAmount <= 0) return alert("Total Rp 0. Silakan pilih tiket terlebih dahulu.");
    if (!fullName || !email) return alert("Nama dan email wajib diisi.");

    await sendOrdersToBackend();

    // nomor tetap
    const phoneNumber = "6287877174156";

    const ticketLines = tickets
      .map((t) => {
        const qty = getCount(t.id);
        if (!qty) return null;
        const price = Number(t.price) || 0;
        return `- ${t.ticket_type} (${qty}x): ${formatRp(qty * price)}`;
      })
      .filter(Boolean)
      .join("\n");

    const message = `Halo Admin ${MERCHANT_NAME}, saya ingin konfirmasi pembayaran tiket event:

*Event:* ${event?.title || "HeArt Event"}
*Nama Pemesan:* ${fullName}
*Email:* ${email}

*Rincian Pesanan:*
${ticketLines}

*Total Pembayaran:* ${formatRp(totalAmount)}
*Metode Pembayaran:* ${paymentMethod}

Mohon segera diproses tiket saya. Terima kasih!`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="buy-ticket-wrapper">
        <p>Loading...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="buy-ticket-wrapper">
        <div className="breadcrumb">
          <Link to="/event">Events</Link> / <span>Buy Ticket</span>
        </div>
        <p style={{ color: "#d11a2a", fontSize: 13 }}>{errorMsg}</p>
      </div>
    );
  }

  if (!event) return null;

  const dateText = formatDateRange(event.start_date, event.end_date);
  const timeText = formatTimeRange(event.start_date, event.end_date);

  return (
    <div className="buy-ticket-wrapper">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/event">Events</Link> / <Link to={`/event/${id}`}>Detail</Link> /{" "}
        <span
          onClick={() => setStep(1)}
          style={{ cursor: "pointer", color: step === 1 ? "#8d6e63" : "#888" }}
        >
          Buy Ticket
        </span>
        {step === 2 && (
          <>
            {" "}
            / <span>Pay Ticket</span>
          </>
        )}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="buy-ticket-container">
          {/* KIRI */}
          <div className="buy-left-col">
            <img src={event.poster} alt="Event Poster" className="buy-poster" />
            <div className="left-info-content">
              <h1 className="buy-event-title">{event.title}</h1>

              <div className="info-group">
                <h4>Lokasi</h4>
                <div className="info-box-beige">
                  <div className="icon-pin">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <span className="location-text">{event.location}</span>
                </div>
              </div>

              <div className="info-group">
                <h4>Tanggal dan waktu</h4>
                <div className="info-box-beige">
                  <p className="date-text">{dateText}</p>
                  <p className="time-text">{timeText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN */}
          <div className="buy-right-col">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Name on invoice"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Example@gmail.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <h3 className="section-title">Choose Your Ticket Type</h3>

            {tickets.length === 0 && (
              <p style={{ fontSize: 13, color: "#777" }}>
                Belum ada tipe tiket untuk event ini.
              </p>
            )}

            {tickets.map((t) => {
              const qty = getCount(t.id);
              const quota = t.quota != null ? Number(t.quota) : null;

              return (
                <div
                  key={t.id}
                  className={`ticket-card ${
                    (t.ticket_type || "").toLowerCase() === "vip"
                      ? "vip-card"
                      : "reguler-card"
                  }`}
                >
                  <div className="ticket-info">
                    <span className="ticket-icon">📦</span>
                    <div>
                      <h4>{t.ticket_type}</h4>
                      <p>{formatRp(t.price)}</p>
                      {quota != null && (
                        <p style={{ fontSize: 12, color: "#333", marginTop: 4 }}>
                          Quota: {quota} tickets
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ticket-counter">
                    <span className="counter-label">Amount</span>
                    <div className="counter-controls">
                      <button type="button" onClick={() => handleTicketChange(t, "-")}>
                        -
                      </button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => handleTicketChange(t, "+")}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="summary-section">
              <div className="total-row">
                <span>Total</span>
                <span className="total-price">{formatRp(totalAmount)}</span>
              </div>
            </div>

            {/* hanya QRIS */}
            <div className="payment-section">
              <label className="payment-option selected">
                <div className="payment-logo-area">
                  <div className="bank-logo-placeholder">QRIS</div>
                  <span>QRIS</span>
                </div>
                <input type="radio" name="payment" value="QRIS" readOnly checked />
              </label>
            </div>

            <div className="action-buttons">
              <button type="button" className="btn-cancel">
                Cancel
              </button>
              <button type="button" className="btn-buy" onClick={handleBuyClick}>
                Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="pay-view-container">
          <div className="pay-card">
            <h2 className="pay-title">Payment Detail</h2>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                {tickets.map((t) => {
                  const qty = getCount(t.id);
                  if (!qty) return null;
                  return (
                    <p key={t.id} style={{ fontSize: 14, color: "#666" }}>
                      {t.ticket_type} x {qty}
                    </p>
                  );
                })}
                <h3 style={{ marginTop: 10, fontSize: 24 }}>Total Price</h3>
              </div>

              <div style={{ textAlign: "right" }}>
                {tickets.map((t) => {
                  const qty = getCount(t.id);
                  if (!qty) return null;
                  const price = Number(t.price) || 0;
                  return (
                    <p key={t.id} style={{ fontSize: 14, color: "#000" }}>
                      {formatRp(qty * price)}
                    </p>
                  );
                })}
                <h3 style={{ marginTop: 10, fontSize: 24, fontWeight: 700 }}>
                  {formatRp(totalAmount)}
                </h3>
              </div>
            </div>

            <div className="qris-section">
              <div className="qris-box">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png"
                  alt="QRIS"
                  className="qris-logo-img"
                />

                {/* ✅ Nama merchant fix */}
                <h3 className="merchant-name">{MERCHANT_NAME}</h3>

                {/* ✅ QR code selalu dari assets */}
                <img src={qrisLocal} alt="QR Code" className="qr-code-img" />

                <button type="button" className="btn-download-qr">
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          <div className="pay-actions">
            <button
              type="button"
              className="btn-cancel"
              style={{ marginRight: 15 }}
              onClick={() => setStep(1)}
            >
              Back
            </button>

            <button type="button" className="btn-confirm-wa" onClick={handleConfirmToWA}>
              Confirm To Whatsapp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyTicket;
