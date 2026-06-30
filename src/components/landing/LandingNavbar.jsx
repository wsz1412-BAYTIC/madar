import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, LOGO_URL } from "@/lib/landing-i18n";

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
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: t["nav.features"], action: () => scrollTo("features") },
    { label: t["nav.pricing"], action: () => scrollTo("pricing") },
    { label: t["nav.cities"], action: () => scrollTo("cities") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-[5%] md:px-[4%]">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={LOGO_URL}
                alt="MADAR"
                style={{ mixBlendMode: "screen" }}
                className="w-[120px] md:w-[160px] h-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="font-body text-sm text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Languages size={15} />
                {lang === "ar" ? "EN" : "ع"}
              </button>

              <Link
                to="/login"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {t["nav.login"]}
              </Link>

              <Link
                to="/login"
                className="text-sm font-body font-medium tracking-wide px-6 py-2.5 rounded-full bg-[#FF6B4A] text-white hover:bg-[#FF8264] transition-all duration-300 shadow-lg shadow-[#FF6B4A]/20"
              >
                {t["nav.startFree"]}
              </Link>
            </nav>

            {/* Mobile toggle */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 text-sm text-white/60"
              >
                <Languages size={15} />
                {lang === "ar" ? "EN" : "ع"}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white p-1"
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
            className="fixed inset-0 z-40 bg-[#080B14] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                onClick={link.action}
                className="font-display text-3xl text-white hover:text-[#FF6B4A] transition-colors"
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
              <Link to="/login" className="text-lg text-white/70">
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