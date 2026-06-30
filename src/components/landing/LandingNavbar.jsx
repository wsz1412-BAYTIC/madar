import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT } from "@/lib/landing-i18n";
import { MadarFullLogo } from "@/components/Logo";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const t = landingT[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: t["nav.features"], action: () => scrollTo("features") },
    { label: t["nav.pricing"], action: () => scrollTo("pricing") },
    { label: t["nav.cities"], action: () => scrollTo("cities-anchor") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-[5%] md:px-[4%]">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: menu + language (desktop) */}
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white p-1"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Languages size={15} />
                {lang === "ar" ? "EN" : "ع"}
              </button>
            </div>

            {/* Right: logo */}
            <Link to="/" className="flex items-center">
              <MadarFullLogo variant="light" className="w-[130px] md:w-[170px] h-auto" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile/dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#0a1628]/95 backdrop-blur-xl md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-16 md:top-20 left-0 z-50 w-64 bg-[#0a1628] border-r border-white/10 p-6 flex flex-col gap-5"
            >
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-left font-body text-base text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/login"
                className="font-body text-base text-white/80 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {t["nav.login"]}
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium px-6 py-3 rounded-full bg-[#F76C54] text-white text-center"
                onClick={() => setMenuOpen(false)}
              >
                {t["nav.startFree"]}
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}