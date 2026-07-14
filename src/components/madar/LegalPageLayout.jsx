import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { POLICY_VERSIONS, POLICY_UPDATED, LAWYER_REVIEW_NOTICE } from '@/config/legal';
import { Scale, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';

// Shared shell for every legal/compliance page: bilingual title, policy
// version + last-updated stamp, the mandatory "draft for Saudi counsel
// review" banner, and theme-token styling so light/dark both work.
export default function LegalPageLayout({ content }) {
  const { lang, isRTL } = useLang();
  const L = (v) => (lang === 'ar' ? v.ar : v.en);
  const version = POLICY_VERSIONS[content.key] || '1.0';
  const updated = POLICY_UPDATED[content.key] || '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <FadeIn>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B84C4]/15 to-[#ADDFF1]/10 flex items-center justify-center border border-[#1B84C4]/15">
              <Scale className="w-4 h-4 text-[#1B84C4]" />
            </div>
            <h1 className="font-heading text-3xl font-bold">{L(content.title)}</h1>
          </div>
          <p className="text-xs text-foreground/45 mb-6 nums">
            {lang === 'ar' ? `الإصدار ${version} · آخر تحديث: ${updated}` : `Version ${version} · Last updated: ${updated}`}
          </p>

          {/* Draft-for-counsel banner — required on every legal page */}
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-warning/10 border border-warning/25 mb-8">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/70 leading-relaxed">{L(LAWYER_REVIEW_NOTICE)}</p>
          </div>

          {content.intro && (
            <p className="text-sm text-foreground/70 leading-relaxed mb-8">{L(content.intro)}</p>
          )}

          <div className="space-y-8">
            {content.sections.map((section, i) => (
              <section key={section.id || i}>
                <h2 className="font-heading text-lg font-semibold mb-2 nums">
                  {i + 1}. {L(section.heading)}
                </h2>
                {L(section.body).split('\n\n').map((para, j) => (
                  <p key={j} className="text-sm text-foreground/65 leading-relaxed mb-2.5 whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-foreground/[0.08]">
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm text-[#1B84C4] hover:underline">
              {lang === 'ar' ? 'للاستفسارات والشكاوى وطلبات البيانات' : 'Questions, complaints & data requests'}
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </FadeIn>
      </main>
      <ComprehensiveFooter />
    </div>
  );
}
