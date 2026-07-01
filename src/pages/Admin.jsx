import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { ShieldCheck, Users, Zap, Server, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const usageData = [
  { hour: '00', users: 12 }, { hour: '04', users: 5 }, { hour: '08', users: 45 },
  { hour: '12', users: 78 }, { hour: '16', users: 92 }, { hour: '20', users: 65 },
];

const subscribers = [
  { name: 'Ahmed Al-Salem', email: 'ahmed@email.com', plan: 'Pro', properties: 12, status: 'active' },
  { name: 'Fatima Al-Rashid', email: 'fatima@email.com', plan: 'Growth', properties: 7, status: 'active' },
  { name: 'Mohammed Hassan', email: 'moh@email.com', plan: 'Basic', properties: 2, status: 'active' },
  { name: 'Nora Al-Qahtani', email: 'nora@email.com', plan: 'Growth', properties: 5, status: 'trial' },
  { name: 'Khalid Ibrahim', email: 'khalid@email.com', plan: 'Free', properties: 1, status: 'active' },
];

const planBadge = {
  Free: 'bg-white/5 text-[#F7F5F0]/50',
  Basic: 'bg-blue-500/10 text-blue-400',
  Growth: 'bg-[#C8972A]/10 text-[#C8972A]',
  Pro: 'bg-[#D95F3B]/10 text-[#D95F3B]',
};

export default function Admin() {
  const { t, lang } = useLang();

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
            <ShieldCheck className="w-5 h-5 text-[#F7F5F0]/70" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('adminPanel')}</h1>
            <p className="text-sm text-[#F7F5F0]/40">{lang === 'ar' ? 'عمليات النظام الداخلية' : 'Internal system operations'}</p>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
        {[
          { key: 'activeUsers', value: '523', icon: Users, color: '#D95F3B' },
          { key: 'totalProperties', value: '2,417', icon: Building2, color: '#C8972A' },
          { key: 'apiLatency', value: '42ms', icon: Zap, color: '#D95F3B' },
          { key: 'uptime', value: '99.97%', icon: Server, color: '#C8972A' },
        ].map(stat => (
          <StaggerItem key={stat.key}>
            <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-[#F7F5F0] font-heading">{stat.value}</div>
              <div className="text-xs text-[#F7F5F0]/40 mt-1">{t(stat.key)}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{lang === 'ar' ? 'المستخدمون النشطون حسب الساعة' : 'Active Users by Hour'}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={usageData}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D95F3B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D95F3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(247,245,240,0.3)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#14161D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F7F5F0', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Area type="monotone" dataKey="users" stroke="#D95F3B" strokeWidth={2} fill="url(#usageGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[#F7F5F0] mb-6">{t('subscribers')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium hidden sm:table-cell">{t('email')}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{lang === 'ar' ? 'الخطة' : 'Plan'}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium hidden sm:table-cell">{t('properties')}</th>
                  <th className="text-start py-3 text-[#F7F5F0]/30 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3 font-medium text-[#F7F5F0]">{sub.name}</td>
                    <td className="py-3 text-[#F7F5F0]/50 hidden sm:table-cell">{sub.email}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${planBadge[sub.plan]}`}>{sub.plan}</span>
                    </td>
                    <td className="py-3 text-[#F7F5F0]/50 hidden sm:table-cell">{sub.properties}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {sub.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'تجريبي' : 'Trial')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}