import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { landingT, LOGO_URL } from "@/lib/landing-i18n";

export default function LandingFooter() {
  const { lang } = useLanguage();
  const t = landingT[lang];
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t["footer.product"],
      links: [
        { label: t["nav.features"], href: "#features" },
        { label: t["nav.pricing"], href: "#pricing" },
        { label: t["nav.cities"], href: "#cities" },
      ],
    },
    {
      title: t["footer.legal"],
      links: [
        { label: lang === "ar" ? "الخصوصية" : "Privacy", to: "/privacy" },
        { label: lang === "ar" ? "الشروط" : "Terms", to: "/terms" },
        { label: lang === "ar" ? "إمكانية الوصول" : "Accessibility", to: "/accessibility" },
      ],
    },
  ];

  return (
    <footer className="bg-[#050810] border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-[5%] md:px-[4%] py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + tagline */}
          <div className="md:col-span-2">
            <img
              src={LOGO_URL}
              alt="MADAR"
              style={{ mixBlendMode: "screen" }}
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
                {col.links.map((link) =>
                  link.href ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/55 hover:text-white transition-colors font-body"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-white/55 hover:text-white transition-colors font-body"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-body">
            © {year} MADAR · {t["footer.rights"]}
          </p>
        </div>
      </div>
    </footer>
  );
}