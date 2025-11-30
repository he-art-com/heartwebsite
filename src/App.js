import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/for-sale" element={<ForSale />} />
        <Route path="/for-sale/:id" element={<ForSaleDetail />} />
        <Route path="/event" element={<Event />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>

      <Footer />
      
    </Router>
  );
}

export default App;
