import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Gift, Copy, Check, Users, DollarSign, Clock } from 'lucide-react';
import { FadeIn } from '@/components/madar/Motion';

export default function Referral() {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const code = 'MADAR-HOST-7X2K';
  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrals = [
    { name: 'Ahmed K.', date: '2025-06-15', status: 'active', earned: 49.5 },
    { name: 'Sarah M.', date: '2025-05-28', status: 'active', earned: 99 },
    { name: 'Omar H.', date: '2025-05-10', status: 'pending', earned: 0 },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8972A]/20 to-[#D95F3B]/10 flex items-center justify-center border border-[#C8972A]/20">
            <Gift className="w-5 h-5 text-[#C8972A]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('referralProgram')}</h1>
            <p className="text-sm text-foreground/40">{t('referralDesc')}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D95F3B] to-[#C8972A]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-3">{t('yourCode')}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-foreground/15 backdrop-blur rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-wider text-white">
                {code}
              </div>
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-3 bg-foreground/20 rounded-xl hover:bg-foreground/30 transition-all text-sm font-medium text-white">
                {copied ? <><Check className="w-4 h-4" />{t('copied')}</> : <><Copy className="w-4 h-4" />{t('copyCode')}</>}
              </button>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'totalReferrals', value: '3', icon: Users, color: '#D95F3B' },
          { key: 'totalEarned', value: `148.5 ${sar}`, icon: DollarSign, color: '#C8972A' },
          { key: 'pendingPayout', value: `49.5 ${sar}`, icon: Clock, color: '#D95F3B' },
        ].map((stat, i) => (
          <FadeIn key={stat.key} delay={0.15 + i * 0.08}>
            <div className="glass rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-lg font-bold text-foreground font-heading">{stat.value}</div>
              <div className="text-xs text-foreground/40 mt-0.5">{t(stat.key)}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-foreground mb-4">{lang === 'ar' ? 'الإحالات الأخيرة' : 'Recent Referrals'}</h2>
          <div className="space-y-3">
            {referrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.04] hover:border-foreground/10 transition-all">
                <div>
                  <div className="font-medium text-sm text-foreground">{ref.name}</div>
                  <div className="text-xs text-foreground/30">{ref.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ref.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {ref.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معلق' : 'Pending')}
                  </span>
                  {ref.earned > 0 && <span className="text-sm font-semibold text-foreground">{ref.earned} {sar}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}