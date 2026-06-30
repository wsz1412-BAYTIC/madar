import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { madarApi } from "@/api/madarApi";
import { useMadarAuth } from "@/lib/MadarAuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Languages } from "lucide-react";
import MadarLogo from "@/components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMadarAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextUrl = new URLSearchParams(location.search).get("next") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await madarApi.login(email, password);
      login(data);
      navigate(nextUrl, { replace: true });
    } catch (err) {
      setError(err.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="px-[4%] md:px-[2%] py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <MadarLogo size={36} />
          <span className="font-display text-2xl md:text-3xl font-light tracking-editorial text-foreground">
            MADAR
            <span className="text-accent"> مدار</span>
          </span>
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
            {t("login.title")}
          </h1>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-10">
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <p className="font-body text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ghost-btn w-full text-center disabled:opacity-50"
            >
              {loading ? t("login.signingIn") : t("login.submit")}
            </button>
          </form>

          <p className="font-body text-xs text-muted-foreground mt-8 text-center">
            {t("login.demoHint")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}