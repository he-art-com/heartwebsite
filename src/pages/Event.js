import React from "react";
import { Link } from "react-router-dom";
import './Event.css'; 

const Events = () => {
    const eventsData = [
        {
            id: 1,
            title: "Art Exhibition Day #5",
            date: "19 August-24 August 2025",
            location: "GOR Senayan, Jakarta",
            image: "/images/9.png", 
            description: "For Art Exhibition #5, we invite you to leave logic at the door. After exploring the outer world and the digital realm in our previous chapters, this edition plunges deep into the human psyche. We celebrate the masters of Surrealism—the artists who painted not what they saw, but what they dreamt. From the melting clocks of Salvador Dalí to the floating apples of René Magritte, this exhibition blurs the line between reality and fantasy. Prepare to question your senses as we showcase artworks where gravity is defied, objects behave badly, and the impossible becomes the norm."
        },
        {
            id: 2,
            title: "Art Exhibition Day #4",
            date: "19 July - 24 July 2025",
            location: "Tennis Indoor Senayan",
            image: "/images/2.png",
            description: "For the finale of our series, Art Exhibition #4 breaks the frame entirely. We step away from traditional oil and canvas to explore the future of creativity. This event showcases how the turbulence and geometry of the past have evolved into the abstract and digital art of today. Featuring immersive installations and avant-garde compositions, we ask the question: 'What is the next Starry Night?' Come witness the convergence of technology and classical aesthetics."
        },
        {
            id: 3,
            title: "Art Exhibition Day #3",
            date: "18 August - 23 August 2025",
            location: "Plaza Indonesia Surabaya",
            image: "/images/4.png",
            description: "This turn focuses inward, exploring the intimate art of portraiture. What lies behind a smile? What is hidden in a sideways glance? This event deconstructs the psychology behind the canvas. Moving beyond simple likeness, we examine how artists capture the 'soul' of their subjects. From the mysterious allure of Mona Lisa to the intense vulnerability of modern self-portraits."
        },
        {
            id: 4,
            title: "Art Exhibition Day #2",
            date: "18 April - 20 April 2025",
            location: "Gelora Bung Karno Stadium",
            image: "/images/5.png", 
            description: "Following the success of our first event, Art Exhibition #2 shifts the gaze from the studio to the outside world. This edition focuses on the artist's obsession with nature—from the serene to the turbulent. Inspired by the swirling skies of Van Gogh's The Starry Night and the rolling hills of Tuscany, this exhibition explores how color affects human emotion. Witness how artists use vibrant pigments like Indian Yellow and Cobalt Blue."
        },
        {
            id: 5,
            title: "Art Exhibition Day #1",
            date: "19 Maret - 24 Maret 2025",
            location: "Taman Ismail Marzuki",
            image: "/images/15.png", 
            description: "This opening event takes a step back into the golden ages of art history, celebrating the foundations that shaped the visual world. We invite you to explore the meticulous techniques of the Renaissance and the raw, emotional power of the Post-Impressionist era. From the calculated sfumato of Da Vinci to the chaotic beauty of early expressionism, this exhibition highlights how the 'Old Masters' broke the rules."
        }
    ];

    return (
        <div className="events-page-wrapper">
            <div className="event-hero">
                <div className="hero-content">
                    <h1>Our Annual Event</h1>
                    <p>
                        This Art Exhibition is an annual event that we hold to help artists, especially local artists, introduce their
                        paintings to the general public and also as part of our efforts to bring the works of our nation's children
                        to the world. We provide a platform in the form of an exhibition that we package as an Art Exhibition.
                    </p>
                </div>
            </div>

            <div className="events-list-container">
                {eventsData.map((event) => (
                    <div className="event-card" key={event.id}>
                        
                        {/* KOLOM KIRI */}
                        <div className="event-left-col">
                            <div className="event-poster-wrapper">
                                {/* PERBAIKAN DI SINI: */}
                                {/* 1. Pakai backticks ` ` bukan kutip ' ' */}
                                {/* 2. Gambar dimasukkan KE DALAM Link */}
                                <Link to={`/event/${event.id}`}>
                                    <img 
                                        src={event.image} 
                                        alt={event.title} 
                                        className="event-poster"
                                    />
                                </Link>
                            </div>
                            <div className="event-info-box">
                                <h2>{event.title}</h2>
                                <div className="event-meta">
                                    <span>{event.date}</span> <br/>
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* KOLOM KANAN */}
                        <div className="event-right-col">
                            <p>{event.description}</p>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;