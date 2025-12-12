// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ForSale from "./pages/ForSale";
import ForSaleDetail from "./pages/ForSaleDetail";
import Event from "./pages/Event";
import EventDetail from "./pages/EventDetail";
import BuyTicket from "./pages/BuyTicket";
import Artists from "./pages/Artists";
import About from "./pages/About";
import AboutMission from "./pages/AboutMission";
import AboutOurStory from "./pages/AboutOurStory";
import AboutWhatWeDo from "./pages/AboutWhatWeDo";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HelpCenter from "./pages/HelpCenter";
import Overview from "./pages/Overview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import ProfileSettings from "./pages/ProfileSettings";
import AdminDashboard from "./pages/AdminDashboard";

import { StoreProvider } from "./context/StoreContext";

function AppContent() {
  const location = useLocation();

  // Halaman yang TIDAK memakai navbar/footer
  const noChromePaths = ["/login", "/register", "/profile", "/admin"];
  const isNoChromePage = noChromePaths.some((p) =>
    location.pathname.startsWith(p)
  );

  // Ambil user dari localStorage (SAFE parse)
  let user = null;
  try {
    const storedUser = localStorage.getItem("heart_user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.warn("Invalid heart_user in localStorage. Clearing it...");
    localStorage.removeItem("heart_user");
    user = null;
  }

  return (
    <>
      {!isNoChromePage && <Navbar />}

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROFILE SETTINGS (no navbar/footer) */}
        <Route path="/profile" element={<ProfileSettings />} />

        {/* MAIN PAGES */}
        <Route path="/home" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/overview" element={<Overview />} />

        <Route path="/for-sale" element={<ForSale />} />
        <Route path="/for-sale/:id" element={<ForSaleDetail />} />

        <Route path="/event" element={<Event />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/buy" element={<BuyTicket />} />

        <Route path="/artists" element={<Artists />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/mission-vision-values" element={<AboutMission />} />
        <Route path="/about/our-story" element={<AboutOurStory />} />
        <Route path="/about/what-we-do" element={<AboutWhatWeDo />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* FAVORITES & CART */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* FALLBACK 404 -> arahkan ke home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!isNoChromePage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <AppContent />
      </Router>
    </StoreProvider>
  );
}
