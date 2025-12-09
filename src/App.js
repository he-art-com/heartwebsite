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
import Artists from "./pages/Artists";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HelpCenter from "./pages/HelpCenter";
import Overview from "./pages/Overview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import ProfileSettings from "./pages/ProfileSettings";

import { StoreProvider } from "./context/StoreContext";

function AppContent() {
  const location = useLocation();

  // Halaman yang TIDAK pakai navbar/footer
  const authPaths = ["/login", "/register","/profile"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        {/* default: ke /login dulu */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfileSettings />} />
        {/* MAIN PAGES */}
        <Route path="/home" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/overview" element={<Overview />} />
        <Route path="/for-sale" element={<ForSale />} />
        <Route path="/for-sale/:id" element={<ForSaleDetail />} />
        <Route path="/event" element={<Event />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* BARU */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />

      </Routes>

      {!isAuthPage && <Footer />}
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
