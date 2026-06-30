import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Gift, Copy, Check, Users, DollarSign, Clock } from 'lucide-react';

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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C8972A]/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-[#C8972A]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('referralProgram')}</h1>
          <p className="text-sm text-[#1C1F2E]/50">{t('referralDesc')}</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-gradient-to-br from-[#D95F3B] to-[#C8972A] rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-2">{t('yourCode')}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-wider">
            {code}
          </div>
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all text-sm font-medium">
            {copied ? <><Check className="w-4 h-4" />{t('copied')}</> : <><Copy className="w-4 h-4" />{t('copyCode')}</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'totalReferrals', value: '3', icon: Users, color: '#D95F3B' },
          { key: 'totalEarned', value: `148.5 ${sar}`, icon: DollarSign, color: '#C8972A' },
          { key: 'pendingPayout', value: `49.5 ${sar}`, icon: Clock, color: '#1C1F2E' },
        ].map(stat => (
          <div key={stat.key} className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}10` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-lg font-bold text-[#1C1F2E] font-heading">{stat.value}</div>
            <div className="text-xs text-[#1C1F2E]/50 mt-0.5">{t(stat.key)}</div>
          </div>
        ))}
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-4">{lang === 'ar' ? 'الإحالات الأخيرة' : 'Recent Referrals'}</h2>
        <div className="space-y-3">
          {referrals.map((ref, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#F7F5F0] border border-[#1C1F2E]/5">
              <div>
                <div className="font-medium text-sm text-[#1C1F2E]">{ref.name}</div>
                <div className="text-xs text-[#1C1F2E]/40">{ref.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${ref.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {ref.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معلق' : 'Pending')}
                </span>
                {ref.earned > 0 && <span className="text-sm font-semibold text-[#1C1F2E]">{ref.earned} {sar}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}