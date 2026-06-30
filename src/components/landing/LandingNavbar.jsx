import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, LOGO_URL, LOGO_URL_LIGHT } from "@/lib/landing-i18n";

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
            ? "bg-[#F5F2EC]/90 backdrop-blur-xl border-b border-[#1C1C20]/8"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-[5%] md:px-[4%]">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={scrolled ? LOGO_URL : LOGO_URL_LIGHT}
                alt="MADAR"
                className="w-[150px] md:w-[200px] h-auto transition-opacity duration-300"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="font-body text-sm text-[#1C1C20]/70 hover:text-[#1C1C20] transition-colors"
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-sm text-[#1C1C20]/50 hover:text-[#1C1C20] transition-colors"
              >
                <Languages size={15} />
                {lang === "ar" ? "EN" : "ع"}
              </button>

              <Link
                to="/login"
                className="text-sm text-[#1C1C20]/70 hover:text-[#1C1C20] transition-colors"
              >
                {t["nav.login"]}
              </Link>

              <Link
                to="/login"
                className="text-sm font-body font-medium tracking-wide px-6 py-2.5 rounded-full bg-[#FF6B4A] text-white hover:bg-[#FF7D5C] transition-all duration-300 shadow-lg shadow-[#FF6B4A]/20"
              >
                {t["nav.startFree"]}
              </Link>
            </nav>

            {/* Mobile toggle */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 text-sm text-[#1C1C20]/60"
              >
                <Languages size={15} />
                {lang === "ar" ? "EN" : "ع"}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-[#1C1C20] p-1"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#F5F2EC] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                onClick={link.action}
                className="font-display text-3xl text-[#1C1C20] hover:text-[#FF6B4A] transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center gap-4"
            >
              <Link to="/login" className="text-lg text-[#1C1C20]/70">
                {t["nav.login"]}
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium px-8 py-3 rounded-full bg-[#FF6B4A] text-white"
              >
                {t["nav.startFree"]}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}