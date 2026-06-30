import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, LOGO_URL_LIGHT } from "@/lib/landing-i18n";

export default function LandingFooter() {
  const { lang } = useLanguage();
  const t = landingT[lang];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const columns = [
    {
      title: t["footer.product"],
      links: [
        { label: t["nav.features"], action: () => scrollTo("features") },
        { label: t["nav.pricing"], action: () => scrollTo("pricing") },
        { label: t["nav.cities"], action: () => scrollTo("cities-anchor") },
      ],
    },
    {
      title: t["footer.company"],
      links: [
        { label: t["footer.about"], to: "/login" },
        { label: t["footer.contact"], to: "/login" },
      ],
    },
    {
      title: t["footer.legal"],
      links: [
        { label: t["footer.privacy"], to: "/privacy" },
        { label: t["footer.terms"], to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-[#1C1C20] border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%] py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + tagline */}
          <div>
            <img
              src={LOGO_URL_LIGHT}
              alt="MADAR"
              className="w-[140px] h-auto mb-4"
            />
            <p className="text-sm text-white/45 font-body max-w-xs leading-relaxed">
              {t["footer.tagline"]}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-wider text-white/35 font-body mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button
                        onClick={link.action}
                        className="text-sm text-white/55 hover:text-white transition-colors font-body"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-white/55 hover:text-white transition-colors font-body"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-white/30 font-body text-center">
            © 2026 مدار — {t["footer.rights"]}
          </p>
        </div>
      </div>
    </footer>
  );
}