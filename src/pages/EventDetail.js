import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './EventDetail.css';

const EventDetail = () => {
    // Kita ambil ID dari URL (misal: /event/1)
    const { id } = useParams();

    // Data Dummy (disesuaikan dengan screenshot desainmu)
    const event = {
        title: "ART EXHIBITION #5: INFINITE BEAUTY by HeArt feat KITT",
        price: "Rp 1.200.000",
        rating: 4.5,
        reviewCount: 23,
        description: "Jakarta International Stadium adalah sebuah stadion sepak bola yang berlokasi di Kelurahan Papanggo, Kecamatan Tanjung Priok, Jakarta Utara. Stadion ini merupakan stadion sepak bola pertama di Indonesia yang memiliki fasilitas atap buka-tutup.",
        organizer: "NCT Dream",
        organizerImg: "/images/nct5.png", // Placeholder avatar
        
        // Info Sidebar
        date: "27 dan 28 September 2025",
        time: "13.00 - 15.00 WIB",
        locationName: "Jakarta Internasional Stadium",
        address: "Papanggo, Kec. TJ. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta",
        
        // Gambar
        poster: "/images/9.png", // Pastikan ini path gambar poster ungumu
        mapImage: "/images/maps.png", // Ganti dengan screenshot map nanti
        gallery: [
            "/images/nct1.png",
            "/images/nct2.png",
            "/images/nct3.png",
            "/images/nct4.png"
        ]
    };

    return (
        <div className="detail-page-wrapper">
            
            {/* Breadcrumb sederhana (Opsional, sesuai desain pojok kiri atas) */}
            <div className="breadcrumb-container">
                <Link to="/event">Events</Link> / <span>Detail</span>
            </div>

            <div className="detail-container">
                
                {/* --- BAGIAN ATAS (3 KOLOM: Poster | Judul | Sidebar) --- */}
                <div className="detail-top-section">
                    
                    {/* 1. Poster Image */}
                    <div className="detail-poster-col">
                        <img src={event.poster} alt="Poster" className="main-poster" />
                    </div>

                    {/* 2. Info Tengah (Judul, Harga, Rating) */}
                    <div className="detail-info-col">
                        <h1 className="main-title">{event.title}</h1>
                        
                        <div className="price-rating-box">
                            <div className="price-block">
                                <span className="label-small">Start From</span>
                                <h2 className="price-text">{event.price}</h2>
                            </div>
                            <div className="rating-block">
                                <span className="stars">⭐⭐⭐⭐⭐</span>
                                <span className="review-text">({event.rating} Star) • {event.reviewCount} Review</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Sidebar Kanan (Date, Location, Button) */}
                    <div className="detail-sidebar-col">
                        {/* Box Date */}
                        <div className="info-card">
                            <h3>Date and Time</h3>
                            <div className="info-content">
                                <p className="highlight-text">{event.date}</p>
                                <p className="sub-text">{event.time}</p>
                            </div>
                        </div>

                        {/* Box Location */}
                        <div className="info-card">
                            <h3>Location</h3>
                            <div className="info-content location-flex">
                                <div className="loc-icon-wrapper">
                                    <i className="fas fa-map-marker-alt"></i> {/* Atau icon 📍 */}
                                </div>
                                <div>
                                    <p className="highlight-text">{event.locationName}</p>
                                    <p className="sub-text">{event.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Button */}
                        <Link to={`/event/${id}/buy`} className="btn-view-ticket-link">
                        <button className="btn-view-ticket">View Ticket</button>
                        </Link>
                    </div>
                </div>

                {/* --- BAGIAN MAPS --- */}
                <div className="detail-section">
                    <h3 className="section-heading">Maps</h3>
                    <div className="map-wrapper">
                        <img src={event.mapImage} alt="Event Map" className="map-img" />
                    </div>
                </div>

                {/* --- BAGIAN PHOTOS --- */}
                <div className="detail-section">
                    <h3 className="section-heading">Photos</h3>
                    <div className="photos-grid">
                        {event.gallery.map((imgUrl, index) => (
                            <img key={index} src={imgUrl} alt={`Gallery ${index}`} className="gallery-img" />
                        ))}
                    </div>
                </div>

                {/* --- BAGIAN ABOUT --- */}
                <div className="detail-section last-section">
                    <h3 className="section-heading">About Event</h3>
                    <p className="about-text">{event.description}</p>
                    
                    <div className="organizer-profile">
                        <img src={event.organizerImg} alt={event.organizer} className="org-avatar" />
                        <span className="org-name">{event.organizer}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventDetail;