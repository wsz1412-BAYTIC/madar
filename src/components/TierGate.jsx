import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

/**
 * TierGate — wraps children and shows an upgrade prompt if the user's
 * tier is below the required level.
 *
 * Usage: <TierGate required="basic">...</TierGate>
 */
export default function TierGate({ required, children, title, description }) {
  const { hasTier } = useSubscription();
  const { t } = useLanguage();
  const accessible = hasTier(required);

  if (accessible) return children;

  return (
    <div className="py-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="flex flex-col items-center justify-center text-center py-16 border border-border/50">
        <Lock size={32} className="text-accent mb-6" strokeWidth={1} />
        <h2 className="font-display text-display-sm font-light mb-3">
          {title || t("market.upgrade")}
        </h2>
        <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
          {description || t("market.upgradeDesc")}
        </p>
        <Link to="/billing" className="ghost-btn inline-flex items-center gap-2 text-xs">
          {t("market.upgradeBtn")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}