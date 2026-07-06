import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { Megaphone, Sparkles, Wrench, Bug } from 'lucide-react';
import { publicFeed, label, localizedUpdate } from '@/lib/siteUpdates';

const TYPE_ICON = { feature: Sparkles, improvement: Wrench, fix: Bug, announcement: Megaphone };

// Public page. It only ever renders publicFeed(), which returns published,
// sanitized entries (no drafts, no is_published flag). The SiteUpdate entity
// RLS additionally filters drafts server-side for non-admins, so this is
// defense-in-depth.
export default function PlatformUpdates() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.entities.SiteUpdate.list('-date', 200)
      .then((rows) => setFeed(publicFeed(rows || [])))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const t = (ar, en) => (isRTL ? ar : en);
  const dark = theme === 'dark';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={dark ? 'min-h-screen bg-[#0A0B10] text-white' : 'min-h-screen bg-[#F2EFE8] text-[#0A0B10]'}>
      <PublicNavbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D95F3B]/10">
            <Megaphone className="h-6 w-6 text-[#D95F3B]" />
          </div>
          <h1 className="font-heading text-4xl font-bold">{t('تحديثات المنصة', 'Platform Updates')}</h1>
          <p className="mt-2 opacity-60">{t('أحدث الميزات والتحسينات في مدار.', 'The latest features and improvements in Madar.')}</p>
        </header>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className={`h-24 animate-pulse rounded-2xl ${dark ? 'bg-white/5' : 'bg-black/5'}`} />)}</div>
        ) : error ? (
          <p className="py-16 text-center opacity-60">{t('تعذر تحميل التحديثات حاليًا.', 'Updates are unavailable right now.')}</p>
        ) : feed.length === 0 ? (
          <p className="py-16 text-center opacity-60">{t('لا توجد تحديثات منشورة بعد.', 'No updates published yet.')}</p>
        ) : (
          <ol className="space-y-4">
            {feed.map((raw) => {
              const u = localizedUpdate(raw, lang);
              const Icon = TYPE_ICON[u.type] || Sparkles;
              return (
                <li key={u.id} className={`rounded-2xl border p-5 ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D95F3B]/10 px-2.5 py-0.5 text-xs text-[#D95F3B]">
                      <Icon className="h-3.5 w-3.5" />{label(u.type, lang)}
                    </span>
                    <span className="text-xs opacity-50">{u.date ? new Date(u.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{u.title}</h2>
                  {u.description && <p className="mt-1 text-sm opacity-70">{u.description}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </main>
      <ComprehensiveFooter />
    </div>
  );
}
