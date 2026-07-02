import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { madarApi } from "@/api/madarApi";
import { useMadarAuth } from "@/lib/MadarAuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Languages } from "lucide-react";
import { MadarFullLogo } from "@/components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useMadarAuth();
  const { lang, toggleLang, t } = useLanguage();
  const urlMode = new URLSearchParams(location.search).get("mode");
  const [mode, setMode] = useState(urlMode === "signup" ? "signup" : "signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextUrl = new URLSearchParams(location.search).get("next") || "/dashboard";

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError(t("login.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(nextUrl, { replace: true });
    } catch (err) {
      setError(isSignup ? (err.message || t("login.signupError")) : (err.message || t("login.error")));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? "signin" : "signup");
    setError("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="px-[4%] md:px-[2%] py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <MadarFullLogo variant="dark" className="w-[140px] md:w-[180px] h-auto" />
        </Link>
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <Languages size={14} />
          {lang === "ar" ? "English" : "العربية"}
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-[4%] md:px-[2%] py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-display-md font-light mb-3">
            {isSignup ? t("login.signupTitle") : t("login.title")}
          </h1>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-10">
            {isSignup ? t("login.signupSubtitle") : t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                  {t("login.name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
              </div>
            )}

            <div>
              <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                {t("login.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                {t("login.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                dir="ltr"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                  {t("login.confirmPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  dir="ltr"
                />
              </div>
            )}

            {error && (
              <p className="font-body text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ghost-btn w-full text-center disabled:opacity-50"
            >
              {loading
                ? (isSignup ? t("login.signingUp") : t("login.signingIn"))
                : (isSignup ? t("login.submitSignup") : t("login.submit"))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="font-body text-xs text-muted-foreground">
              {isSignup ? t("login.haveAccount") : t("login.noAccount")}{" "}
            </span>
            <button
              onClick={switchMode}
              className="font-body text-xs tracking-label uppercase text-accent hover:text-foreground transition-colors underline underline-offset-4"
            >
              {isSignup ? t("login.signin") : t("login.signup")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}