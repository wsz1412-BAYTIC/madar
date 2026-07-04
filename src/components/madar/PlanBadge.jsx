import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { planBadge } from '@/lib/trialManagement';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';

// Plan badge shown next to the customer's name: "Growth Trial · 14 days",
// "Growth · Paid", "Free", "Trial Expired" — bilingual, theme-token colors.
const STYLES = {
  growth_trial: 'bg-[#C8972A]/15 text-[#C8972A] border-[#C8972A]/30',
  paid: 'bg-success/15 text-success border-success/30',
  trial_expired: 'bg-danger/10 text-danger border-danger/30',
  free: 'bg-foreground/[0.06] text-foreground/60 border-foreground/[0.12]',
};

const ICONS = {
  growth_trial: Sparkles,
  paid: CheckCircle2,
  trial_expired: Clock,
  free: null,
};

export default function PlanBadge({ subscription, className = '' }) {
  const { lang } = useLang();
  const badge = planBadge(subscription, new Date(), lang);
  const Icon = ICONS[badge.key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap nums ${STYLES[badge.key]} ${className}`}
      title={badge.label}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {badge.label}
    </span>
  );
}
