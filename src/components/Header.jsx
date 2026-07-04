import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Languages, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { MadarFullLogo } from "./Logo";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { theme, preference, setPreference } = useTheme();

  const themeIcon = preference === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  const ThemeIcon = themeIcon;
  const cycleTheme = () => {
    const order = ["light", "dark", "system"];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    setPreference(next);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      setHidden(currentY > lastScrollY && currentY > 200);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: t("nav.dashboard"), path: "/" },
    { label: t("nav.properties"), path: "/properties" },
    { label: t("nav.market"), path: "/market" },
    { label: t("nav.billing"), path: "/billing" },
    { label: t("nav.assistant"), path: "/assistant" },
    { label: t("nav.commits"), path: "/commits" },
  ];

  const isHomepage = location.pathname === "/";
  const textColor = isHomepage ? "text-white" : "text-foreground";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled
            ? isHomepage
              ? "bg-foreground/60 backdrop-blur-xl"
              : "bg-background/95 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-[4%] md:px-[2%]">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/" className="relative z-10 flex items-center">
              <MadarFullLogo
                variant={isHomepage && !menuOpen ? "light" : "dark"}
                className="w-[120px] md:w-[160px] h-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated &&
                navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-body text-xs tracking-label uppercase relative group pb-1 ${
                      location.pathname === link.path
                        ? "text-accent"
                        : isHomepage
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </Link>
                ))}

              <button
                onClick={cycleTheme}
                className={`flex items-center gap-1.5 font-body text-xs tracking-label uppercase transition-colors ${
                  isHomepage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Toggle theme"
                title={preference}
              >
                <ThemeIcon size={14} />
              </button>

              <button
                onClick={toggleLang}
                className={`flex items-center gap-1.5 font-body text-xs tracking-label uppercase transition-colors ${
                  isHomepage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Toggle language"
              >
                <Languages size={14} />
                {lang === "ar" ? "EN" : "ع"}
              </button>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 font-body text-xs tracking-label uppercase transition-colors ${
                    isHomepage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LogOut size={14} />
                  {t("nav.logout")}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`font-body text-xs tracking-label uppercase transition-colors ${
                      isHomepage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className={`font-body text-xs tracking-label uppercase transition-colors ${
                      isHomepage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )}

              <Link
                to={isAuthenticated ? "/properties" : "/login?mode=signup"}
                className={`text-xs px-8 py-3 text-sm font-body tracking-widest uppercase transition-all duration-500 rounded-full border ${
                  isHomepage
                    ? "border-white bg-white text-black hover:bg-white/80"
                    : "border-foreground bg-foreground text-background hover:bg-foreground/80"
                }`}
              >
                {isAuthenticated ? t("nav.addProperty") : t("hero.cta")}
              </Link>
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden relative z-10 p-2 ${menuOpen ? "text-foreground" : textColor}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-start justify-center px-[4%]"
          >
            <nav className="flex flex-col items-start gap-6">
              {isAuthenticated &&
                navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.path}
                      className="font-display text-display-md text-foreground hover:text-[#976620] transition-colors text-left"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <Link
                    to="/login"
                    className="font-display text-display-md text-foreground hover:text-[#976620] transition-colors text-left"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className="font-display text-display-md text-foreground hover:text-[#976620] transition-colors text-left"
                  >
                    {t("nav.signup")}
                  </Link>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 mt-4"
              >
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Languages size={14} />
                  {lang === "ar" ? "English" : "العربية"}
                </button>
                <button
                  onClick={cycleTheme}
                  className="flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ThemeIcon size={14} />
                  {preference === "light" ? (lang === "ar" ? "فاتح" : "Light") : preference === "dark" ? (lang === "ar" ? "داكن" : "Dark") : (lang === "ar" ? "النظام" : "System")}
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut size={14} />
                    {t("nav.logout")}
                  </button>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}