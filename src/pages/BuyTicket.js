import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BuyTicket.css'; 

const BuyTicket = () => {
    const { id } = useParams();
    
    // STATE: Langkah (1 = Input Data, 2 = Payment)
    const [step, setStep] = useState(1); 

    // STATE: Data Pembeli (Tambahan baru agar bisa dikirim ke WA)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // STATE: Tiket & Pembayaran
    const [vipCount, setVipCount] = useState(0);
    const [regulerCount, setRegulerCount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');

    const vipPrice = 700000;
    const regulerPrice = 300000;
    const totalAmount = (vipCount * vipPrice) + (regulerCount * regulerPrice);

    const formatRp = (num) => "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const handleTicketChange = (type, operation) => {
        if (type === 'vip') {
            if (operation === '+' ) setVipCount(vipCount + 1);
            if (operation === '-' && vipCount > 0) setVipCount(vipCount - 1);
        } else {
            if (operation === '+' ) setRegulerCount(regulerCount + 1);
            if (operation === '-' && regulerCount > 0) setRegulerCount(regulerCount - 1);
        }
    };

    // Fungsi Lanjut ke Payment (Step 1 -> Step 2)
    const handleBuyClick = () => {
        if (totalAmount > 0) {
            if (!paymentMethod) {
                alert("Mohon pilih metode pembayaran terlebih dahulu.");
                return;
            }
            if (!fullName) {
                alert("Mohon isi nama lengkap Anda.");
                return;
            }
            setStep(2); 
            window.scrollTo(0, 0); 
        } else {
            alert("Silakan pilih minimal 1 tiket!");
        }
    };

    // --- FUNGSI BARU: KIRIM KE WHATSAPP ---
    const handleConfirmToWA = () => {
        // 1. Nomor Admin (Ganti dengan nomor WhatsApp aslimu, gunakan kode negara 62)
        const phoneNumber = "6281234567890"; 

        // 2. Format Pesan
        const message = `Halo Admin HeArt, saya ingin konfirmasi pembayaran tiket event:

*Event:* ART EXHIBITION #5: INFINITE BEAUTY
*Nama Pemesan:* ${fullName}
*Email:* ${email}

*Rincian Pesanan:*
- VIP Ticket (${vipCount}x): ${formatRp(vipCount * vipPrice)}
- Reguler Ticket (${regulerCount}x): ${formatRp(regulerCount * regulerPrice)}

*Total Pembayaran:* ${formatRp(totalAmount)}
*Metode Pembayaran:* ${paymentMethod}

Mohon segera diproses tiket saya. Terima kasih!`;

        // 3. Encode pesan agar aman untuk URL
        const encodedMessage = encodeURIComponent(message);

        // 4. Buka Link WhatsApp di tab baru
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="buy-ticket-wrapper">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/event">Events</Link> / 
                <Link to={`/event/${id}`}>Detail</Link> / 
                <span onClick={() => setStep(1)} style={{cursor: 'pointer', color: step === 1 ? '#8d6e63' : '#888'}}>
                     Buy Ticket
                </span> 
                {step === 2 && (
                    <> / <span>Pay Ticket</span> </>
                )}
            </div>

            {/* ======================= */}
            {/* STEP 1: FORMULIR TIKET  */}
            {/* ======================= */}
            {step === 1 && (
                <div className="buy-ticket-container">
                    {/* KOLOM KIRI */}
                    <div className="buy-left-col">
                        <img src="/images/9.png" alt="Event Poster" className="buy-poster" />
                        <div className="left-info-content">
                            <h1 className="buy-event-title">ART EXHIBITION #5: INFINITE BEAUTY by HeArt feat KITT</h1>
                            <div className="info-group">
                                <h4>Lokasi</h4>
                                <div className="info-box-beige">
                                    <div className="icon-pin"><i className="fas fa-map-marker-alt"></i></div>
                                    <span className="location-text">Jakarta Internasional Stadium</span>
                                </div>
                            </div>
                            <div className="info-group">
                                <h4>Tanggal dan waktu</h4>
                                <div className="info-box-beige">
                                    <p className="date-text">27 dan 28 September 2025</p>
                                    <p className="time-text">13:00 - 15:00 WIB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN */}
                    <div className="buy-right-col">
                        <div className="form-group">
                            <label>Full Name</label>
                            {/* Input Nama dikoneksikan ke State */}
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
                            {/* Input Email dikoneksikan ke State */}
                            <input 
                                type="email" 
                                placeholder="Example@gmail.com" 
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>

                        <h3 className="section-title">Choose Your Ticket Type</h3>
                        
                        {/* Ticket Cards */}
                        <div className="ticket-card vip-card">
                            <div className="ticket-info">
                                <span className="ticket-icon">📦</span>
                                <div><h4>VIP</h4><p>{formatRp(vipPrice)}</p></div>
                            </div>
                            <div className="ticket-counter">
                                <span className="counter-label">Amount</span>
                                <div className="counter-controls">
                                    <button onClick={() => handleTicketChange('vip', '-')}>-</button>
                                    <span>{vipCount}</span>
                                    <button onClick={() => handleTicketChange('vip', '+')}>+</button>
                                </div>
                            </div>
                        </div>
                        <div className="ticket-card reguler-card">
                            <div className="ticket-info">
                                <span className="ticket-icon">📦</span>
                                <div><h4>REGULER</h4><p>{formatRp(regulerPrice)}</p></div>
                            </div>
                            <div className="ticket-counter">
                                <span className="counter-label">Amount</span>
                                <div className="counter-controls">
                                    <button onClick={() => handleTicketChange('reguler', '-')}>-</button>
                                    <span>{regulerCount}</span>
                                    <button onClick={() => handleTicketChange('reguler', '+')}>+</button>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Buttons */}
                        <div className="summary-section">
                            <div className="total-row">
                                <span>Total</span>
                                <span className="total-price">{formatRp(totalAmount)}</span>
                            </div>
                        </div>

                        <div className="payment-section">
                             {['QRIS', 'Bank BCA', 'Bank BNI', 'Bank Mandiri'].map((method) => (
                                <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                                    <div className="payment-logo-area">
                                        <div className="bank-logo-placeholder">{method.substring(0,4)}</div> 
                                        <span>{method}</span>
                                    </div>
                                    <input type="radio" name="payment" value={method} onChange={(e) => setPaymentMethod(e.target.value)} />
                                </label>
                            ))}
                        </div>

                        <div className="action-buttons">
                            <button className="btn-cancel">Cancel</button>
                            <button className="btn-buy" onClick={handleBuyClick}>Buy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= */}
            {/* STEP 2: PAYMENT (QRIS)  */}
            {/* ======================= */}
            {step === 2 && (
                <div className="pay-view-container">
                    <div className="pay-card">
                        <h2 className="pay-title">Payment Detail</h2>
                        
                        {/* Detail Header Kiri-Kanan */}
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                            <div>
                                <p style={{fontSize:'14px', color:'#666'}}>VIP Ticket</p>
                                <p style={{fontSize:'14px', color:'#666'}}>Discount Voucher</p>
                                <h3 style={{marginTop:'10px', fontSize:'24px'}}>Total Price</h3>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <p style={{fontSize:'14px', color:'#000'}}>{formatRp(vipCount * vipPrice + regulerCount * regulerPrice)}</p>
                                <p style={{fontSize:'14px', color:'#000'}}>-Rp 0</p>
                                <h3 style={{marginTop:'10px', fontSize:'24px', fontWeight:'700'}}>{formatRp(totalAmount)}</h3>
                            </div>
                        </div>

                        <div className="qris-section">
                            <div className="qris-box">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" alt="QRIS" className="qris-logo-img"/>
                                <h3 className="merchant-name">HeArt</h3>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="qr-code-img"/>
                                <button className="btn-download-qr">Download QR Code</button>
                            </div>
                        </div>
                    </div>

                    <div className="pay-actions">
                        <button className="btn-cancel" style={{marginRight: '15px'}} onClick={() => setStep(1)}>Back</button>
                        
                        {/* TOMBOL KONFIRMASI WA YANG SUDAH AKTIF */}
                        <button className="btn-confirm-wa" onClick={handleConfirmToWA}>
                            Confirm To Whatsapp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyTicket;