import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    // Newsletter subscription — no base44 storage, just local confirmation
    // In production, POST to madarApi newsletter endpoint
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-foreground text-background w-full">
      <div className="px-[2%] w-full">
        <div className="py-24 md:py-40 pb-16 md:pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 px-[2%] mx-auto max-w-[1400px]">
            <div>
              <h2 className="font-display text-display-lg font-light mb-6">
                {t("footer.newsletter")}
              </h2>
              <p className="font-body text-background/60 text-sm leading-relaxed max-w-md mb-8">
                {t("footer.newsletterDesc")}
              </p>
              {subscribed ? (
                <p className="font-body text-sm tracking-label uppercase text-background/80">
                  {t("footer.subscribed")}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center border-b border-background/20 pb-2 max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("footer.newsletterPlaceholder")}
                    className="flex-1 bg-transparent font-body text-sm text-background placeholder:text-background/40 focus:outline-none"
                    required
                  />
                  <button type="submit" className="ml-4 text-background/60 hover:text-background transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 md:gap-x-12 gap-y-12">
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">{t("footer.navigate")}</h3>
                <nav className="flex flex-col gap-2">
                  <Link to="/" className="font-body text-sm text-background/70 hover:text-background transition-colors">{t("nav.dashboard")}</Link>
                  <Link to="/properties" className="font-body text-sm text-background/70 hover:text-background transition-colors">{t("nav.properties")}</Link>
                  <Link to="/market" className="font-body text-sm text-background/70 hover:text-background transition-colors">{t("nav.market")}</Link>
                  <Link to="/billing" className="font-body text-sm text-background/70 hover:text-background transition-colors">{t("nav.billing")}</Link>
                  <Link to="/assistant" className="font-body text-sm text-background/70 hover:text-background transition-colors">{t("nav.assistant")}</Link>
                </nav>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">{t("footer.categories")}</h3>
                <nav className="flex flex-col gap-2">
                  <Link to="/market?city=Riyadh" className="font-body text-sm text-background/70 hover:text-background transition-colors">الرياض</Link>
                  <Link to="/market?city=Jeddah" className="font-body text-sm text-background/70 hover:text-background transition-colors">جدة</Link>
                  <Link to="/market?city=Dammam" className="font-body text-sm text-background/70 hover:text-background transition-colors">الدمام</Link>
                  <Link to="/market?city=Mecca" className="font-body text-sm text-background/70 hover:text-background transition-colors">مكة</Link>
                </nav>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">{t("footer.contact")}</h3>
                <address className="not-italic flex flex-col gap-2 font-body text-sm text-background/70">
                  <span>الرياض، المملكة العربية السعودية</span>
                  <a href="mailto:hello@aimadar.com" className="hover:text-background transition-colors mt-1">hello@aimadar.com</a>
                </address>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">{t("footer.follow")}</h3>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">Instagram</a>
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">X</a>
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">LinkedIn</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10 py-6 pb-10 md:pb-8 bg-foreground w-full">
        <div className="px-[2%]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start gap-4">
            <Link to="/" className="font-display text-xl font-light tracking-editorial order-first text-white">
              MADAR <span style={{ color: "#FFCBA4" }}>مدار</span>
            </Link>
            <span className="font-body text-xs text-background/40 mx-auto">
              {t("footer.rights")}
            </span>
            <div className="flex gap-4 lg:ml-0 self-center lg:self-auto">
              <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</Link>
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Terms &amp; Conditions</Link>
              <Link to="/accessibility" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}