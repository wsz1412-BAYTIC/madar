import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MapPin, Tag, TrendingUp, LineChart, ArrowLeft, ArrowRight } from 'lucide-react';
import { deriveHostSignals } from '@/lib/hostInsights';

// Host investment/operational insight cards. Action-oriented guidance + CTAs
// into existing host tools (/market, /pricing-recommendations, /analytics).
// It displays NO occupancy/ADR/revenue figures and makes no official-data
// claims — it uses only safe own-data flags (deriveHostSignals) to tailor the
// occupancy card's wording. Real numbers and gating live on the linked pages.
export default function HostInsightsCards({ properties }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const { weakOccupancy } = deriveHostSignals(properties);

  const t = (a, e) => (ar ? a : e);
  const cardCls = `p-5 rounded-2xl border flex flex-col ${dark ? 'bg-card border-foreground/[0.06]' : 'bg-white border-[#0A0B10]/[0.06]'}`;
  const muted = dark ? 'text-foreground/60' : 'text-[#0A0B10]/60';
  const strong = dark ? 'text-foreground' : 'text-[#0A0B10]';

  const cards = [
    {
      key: 'market',
      Icon: MapPin,
      title: t('إشارة الطلب في السوق', 'Market demand signal'),
      body: t(
        'راجع مستوى الطلب حسب المدينة والحي لمعرفة المناطق الأعلى طلبًا قبل تعديل التسعير أو الإتاحة.',
        'Review demand by city & district to spot higher-demand areas before adjusting pricing or availability.'
      ),
      cta: { label: t('فتح صفحة السوق', 'Open Market'), to: '/market' },
      disclaimer: true,
    },
    {
      key: 'pricing',
      Icon: Tag,
      title: t('فرصة تسعير', 'Pricing opportunity'),
      body: t(
        'راجع تسعير وحداتك عبر أداة التسعير الذكي — قد يساعد تحديث السعر على تحسين الإيراد أو الإشغال.',
        'Review your unit pricing with the smart pricing tool — updating price may help revenue or occupancy.'
      ),
      cta: { label: t('مراجعة التسعير', 'Review pricing'), to: '/pricing-recommendations' },
      disclaimer: false,
    },
    {
      key: 'occupancy',
      Icon: TrendingUp,
      title: t('تحسين الإشغال', 'Occupancy improvement'),
      body: weakOccupancy
        ? t(
            'قد يشير ضعف الإشغال إلى الحاجة لمراجعة التسعير أو الصور أو الإتاحة أو الطلب في السوق. راجع أداء وحداتك للخطوة المناسبة.',
            'Weaker occupancy may call for reviewing pricing, photos, availability, or market demand. Check your unit performance for the right step.'
          )
        : t(
            'لتحسين الإشغال، يمكن مراجعة التسعير والصور والإتاحة والطلب في السوق. راجع أداء وحداتك لتحديد الأولوية.',
            'To improve occupancy, consider pricing, photos, availability, and market demand. Check your unit performance to prioritize.'
          ),
      cta: { label: t('مراجعة أداء الوحدة', 'Review unit performance'), to: '/analytics' },
      disclaimer: false,
    },
    {
      key: 'revenue',
      Icon: LineChart,
      title: t('خطوة لزيادة الإيراد', 'Revenue next step'),
      body: t(
        'ابدأ بخطوة واحدة: تحقّق من الطلب في السوق، ثم راجع التسعير وأداء وحداتك لتحديد أفضل إجراء.',
        'Start with one step: check market demand, then review pricing and your unit performance to pick the best action.'
      ),
      cta: { label: t('مراجعة أداء الوحدة', 'Review unit performance'), to: '/analytics' },
      disclaimer: false,
    },
  ];

  return (
    <div className="mt-8">
      <h2 className={`mb-4 font-heading text-lg font-bold ${strong}`}>{t('رؤى وإجراءات لزيادة العائد', 'Insights & actions to grow returns')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, Icon, title, body, cta, disclaimer }) => (
          <div key={key} className={cardCls}>
            <Icon className="h-5 w-5 text-[#D95F3B]" />
            <h3 className={`mt-3 font-heading font-bold ${strong}`}>{title}</h3>
            <p className={`mt-1 flex-1 text-sm leading-relaxed ${muted}`}>{body}</p>
            {disclaimer && (
              <p className={`mt-2 text-[11px] leading-relaxed ${dark ? 'text-foreground/40' : 'text-[#0A0B10]/40'}`}>
                {t('يعتمد هذا المؤشر على البيانات المتاحة داخل المنصة وقد لا يمثل السوق بالكامل.',
                   'This indicator is based on data available within the platform and may not represent the entire market.')}
              </p>
            )}
            <Link
              to={cta.to}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-foreground/[0.05] px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {cta.label}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
