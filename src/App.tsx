import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { StoreProvider } from "./context/StoreContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotificationManager from "./components/NotificationManager";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <StoreProvider>
          <Router>
            <ScrollToTop />
            <NotificationManager />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/site-yonetim" element={<Admin />} />
              <Route path="/sss" element={<FAQ />} />
              <Route path="/iletisim" element={<Contact />} />
            </Routes>
          </Router>
        </StoreProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
