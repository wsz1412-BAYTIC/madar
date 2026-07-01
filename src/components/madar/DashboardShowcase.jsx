import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn, ScaleIn } from '@/components/madar/Motion';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BedDouble, Star } from 'lucide-react';

export default function DashboardShowcase() {
  const { lang } = useLang();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#F2EFE8] overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D95F3B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0B10] border border-white/[0.08] text-[#C8972A] text-xs font-medium mb-6">
            {lang === 'ar' ? 'لوحة التحكم' : 'Product Dashboard'}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0B10] leading-[1.15] max-w-3xl mx-auto mb-4">
            {lang === 'ar' ? (
              <>كل بياناتك في <span className="text-gradient-gold">مكان واحد</span></>
            ) : (
              <>All your data in <span className="text-gradient-gold">one place</span></>
            )}
          </h2>
          <p className="text-[#0A0B10]/50 text-base max-w-xl mx-auto">
            {lang === 'ar'
              ? 'لوحة تحكم احترافية تجمع الإيرادات والإشغال والأسعار في واجهة واحدة واضحة'
              : 'A professional dashboard that brings revenue, occupancy, and pricing into one clear interface'}
          </p>
        </FadeIn>

        {/* Dashboard mockup */}
        <ScaleIn delay={0.2}>
          <div className="relative rounded-3xl bg-[#0A0B10] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D95F3B]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#C8972A]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-[#F7F5F0]/30 font-mono">app.madar.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 lg:p-8">
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: DollarSign, label: lang === 'ar' ? 'الإيرادات' : 'Revenue', value: 'SAR 48,200', change: '+12%', color: '#D95F3B' },
                  { icon: TrendingUp, label: lang === 'ar' ? 'الإشغال' : 'Occupancy', value: '74%', change: '+5%', color: '#C8972A' },
                  { icon: BedDouble, label: lang === 'ar' ? 'الإعلانات' : 'Listings', value: '8', change: '+2', color: '#D95F3B' },
                  { icon: Star, label: lang === 'ar' ? 'التقييم' : 'Rating', value: '4.9', change: '+0.2', color: '#C8972A' },
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="rounded-2xl glass p-4 border border-white/[0.06]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                        <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-[#F7F5F0]/60">{kpi.change}</span>
                    </div>
                    <div className="text-xl font-bold font-heading text-[#F7F5F0]">{kpi.value}</div>
                    <div className="text-[11px] text-[#F7F5F0]/40 mt-1">{kpi.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Chart mockup */}
              <div className="rounded-2xl glass border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-medium text-[#F7F5F0]">{lang === 'ar' ? 'الإيرادات عبر الزمن' : 'Revenue Over Time'}</div>
                    <div className="text-[11px] text-[#F7F5F0]/40 mt-0.5">{lang === 'ar' ? 'آخر 30 يوم' : 'Last 30 days'}</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D95F3B]" />
                    <span className="text-[11px] text-[#F7F5F0]/40">{lang === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
                  </div>
                </div>

                {/* Fake chart bars */}
                <div className="flex items-end justify-between gap-1.5 h-32">
                  {[40, 55, 45, 70, 60, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 rounded-t bg-gradient-to-t from-[#D95F3B]/40 to-[#C8972A]/60 min-h-[4px]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}