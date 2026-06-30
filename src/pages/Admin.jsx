import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { ShieldCheck, Users, Activity, Zap, Server, Building2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  Free: 'bg-gray-50 text-gray-600',
  Basic: 'bg-blue-50 text-blue-600',
  Growth: 'bg-[#C8972A]/10 text-[#C8972A]',
  Pro: 'bg-[#D95F3B]/10 text-[#D95F3B]',
};

export default function Admin() {
  const { t, lang } = useLang();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1C1F2E]/5 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#1C1F2E]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1F2E]">{t('adminPanel')}</h1>
          <p className="text-sm text-[#1C1F2E]/50">{lang === 'ar' ? 'عمليات النظام الداخلية' : 'Internal system operations'}</p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'activeUsers', value: '523', icon: Users, color: '#D95F3B' },
          { key: 'totalProperties', value: '2,417', icon: Building2, color: '#C8972A' },
          { key: 'apiLatency', value: '42ms', icon: Zap, color: '#1C1F2E' },
          { key: 'uptime', value: '99.97%', icon: Server, color: '#D95F3B' },
        ].map(stat => (
          <div key={stat.key} className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}10` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-[#1C1F2E] font-heading">{stat.value}</div>
            <div className="text-xs text-[#1C1F2E]/50 mt-1">{t(stat.key)}</div>
          </div>
        ))}
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{lang === 'ar' ? 'المستخدمون النشطون حسب الساعة' : 'Active Users by Hour'}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={usageData}>
            <defs>
              <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D95F3B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D95F3B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C1F2E80', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1C1F2E', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            <Area type="monotone" dataKey="users" stroke="#D95F3B" strokeWidth={2} fill="url(#usageGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-[#1C1F2E]/5 p-6">
        <h2 className="font-heading font-semibold text-[#1C1F2E] mb-6">{t('subscribers')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1C1F2E]/5">
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium hidden sm:table-cell">{t('email')}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{lang === 'ar' ? 'الخطة' : 'Plan'}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium hidden sm:table-cell">{t('properties')}</th>
                <th className="text-start py-3 text-[#1C1F2E]/40 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr key={i} className="border-b border-[#1C1F2E]/5 last:border-0">
                  <td className="py-3 font-medium text-[#1C1F2E]">{sub.name}</td>
                  <td className="py-3 text-[#1C1F2E]/60 hidden sm:table-cell">{sub.email}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${planBadge[sub.plan]}`}>{sub.plan}</span>
                  </td>
                  <td className="py-3 text-[#1C1F2E]/60 hidden sm:table-cell">{sub.properties}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {sub.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'تجريبي' : 'Trial')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}