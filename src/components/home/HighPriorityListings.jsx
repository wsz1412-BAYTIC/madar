import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BriefCard from "../BriefCard";
import { useLanguage } from "@/lib/LanguageContext";

export default function HighPriorityListings({ briefs }) {
  const { t } = useLanguage();

  if (!briefs || briefs.length === 0) {
    return (
      <section id="listings" className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-16 px-[2%]">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3">
              {t("dashboard.featured")}
            </h2>
          </div>
        </div>
        <div className="text-center py-24">
          <p className="font-display text-display-sm font-light text-muted-foreground">
            {t("dashboard.noBriefs")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="listings" className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-16 px-[2%]">
        <div>
          <h2 className="font-display text-display-lg font-light mt-3">
            {t("dashboard.featured")}
          </h2>
        </div>
        <Link
          to="/properties"
          className="hidden md:block font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors"
        >
          {t("dashboard.viewAll")} →
        </Link>
      </div>

      {briefs[0] && (
        <div className="mb-6 md:mb-8">
          <BriefCard brief={briefs[0]} size="large" />
        </div>
      )}

      {briefs.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {briefs.slice(1, 4).map((brief, i) => (
            <BriefCard key={brief.property_id || brief.id || i} brief={brief} />
          ))}
        </div>
      )}

      <div className="mt-12 md:hidden text-center">
        <Link to="/properties" className="ghost-btn inline-block">
          {t("dashboard.viewAll")}
        </Link>
      </div>
    </section>
  );
}