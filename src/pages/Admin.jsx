import React, { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Users, Building2, CreditCard, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';

const planBadge = {
  premium: 'bg-[#1B84C4]/10 text-[#1B84C4]',
  professional: 'bg-[#ADDFF1]/10 text-[#0F6BA8]',
  basic: 'bg-blue-500/10 text-blue-400',
  free: 'bg-foreground/5 text-foreground/50',
};

const statusBadge = {
  active: 'bg-emerald-500/10 text-emerald-400',
  trial: 'bg-amber-500/10 text-amber-400',
  pending: 'bg-amber-500/10 text-amber-400',
  cancelled: 'bg-red-500/10 text-red-400',
  suspended: 'bg-red-500/10 text-red-400',
  free: 'bg-foreground/5 text-foreground/50',
};

const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.round(n || 0));

export default function Admin() {
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState({ customers: [], stats: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(false);
        // Admin-scoped reads. Entity RLS returns all records only to an admin;
        // this page is behind AdminRoute + the RLS admin clause.
        const [users, subscriptions, properties, recommendations] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.UserSubscription.list(),
          base44.entities.UserProperty.list(),
          base44.entities.PriceRecommendation.list().catch(() => []),
        ]);
        if (cancelled) return;

        const subByUser = new Map(subscriptions.map((s) => [s.userId, s]));
        const propCountByUser = properties.reduce((acc, p) => {
          acc.set(p.userId, (acc.get(p.userId) || 0) + 1);
          return acc;
        }, new Map());

        const customers = users.map((u) => {
          const sub = subByUser.get(u.id);
          return {
            id: u.id,
            name: u.full_name || (lang === 'ar' ? 'بدون اسم' : 'Unnamed'),
            email: u.email || '—',
            plan: (sub?.planName || 'free').toLowerCase(),
            status: sub?.status || 'free',
            properties: propCountByUser.get(u.id) || 0,
          };
        });

        const stats = {
          totalUsers: users.length,
          totalProperties: properties.length,
          activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
          totalRecommendations: recommendations.length,
        };

        setData({ customers, stats });
      } catch (err) {
        if (!cancelled) setError(true);
        // eslint-disable-next-line no-console
        console.error('Failed to load admin data:', err?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const statTiles = data.stats
    ? [
        { key: 'totalUsers', label: t('activeUsers'), value: data.stats.totalUsers, icon: Users, color: '#1B84C4' },
        { key: 'totalProperties', label: t('totalProperties'), value: data.stats.totalProperties, icon: Building2, color: '#0F6BA8' },
        { key: 'activeSubscriptions', label: lang === 'ar' ? 'اشتراكات نشطة' : 'Active Subscriptions', value: data.stats.activeSubscriptions, icon: CreditCard, color: '#1B84C4' },
        { key: 'recommendations', label: lang === 'ar' ? 'التوصيات' : 'Recommendations', value: data.stats.totalRecommendations, icon: Sparkles, color: '#0F6BA8' },
      ]
    : [];

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-6xl mx-auto">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-foreground/[0.04] flex items-center justify-center border border-foreground/[0.06]">
            <ShieldCheck className="w-5 h-5 text-foreground/70" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('adminPanel')}</h1>
            <p className="text-sm text-foreground/40">{lang === 'ar' ? 'عمليات النظام الداخلية' : 'Internal system operations'}</p>
          </div>
        </div>
      </FadeIn>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-foreground/50 py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4" />
          {lang === 'ar' ? 'تعذر تحميل بيانات الإدارة.' : 'Failed to load admin data.'}
        </div>
      )}

      {!loading && !error && (
        <>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
            {statTiles.map((stat) => (
              <StaggerItem key={stat.key}>
                <div className="glass rounded-2xl p-5 hover:border-foreground/15 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold text-foreground font-heading">{fmt(stat.value)}</div>
                  <div className="text-xs text-foreground/40 mt-1">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.2}>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-foreground">{t('subscribers')}</h2>
                <span className="text-xs text-foreground/40">
                  {data.customers.length} {lang === 'ar' ? 'عميل' : 'customers'}
                </span>
              </div>

              {data.customers.length === 0 ? (
                <p className="text-sm text-foreground/40 py-6 text-center">
                  {lang === 'ar' ? 'لا يوجد عملاء بعد.' : 'No customers yet.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-foreground/[0.04]">
                        <th className="text-start py-3 text-foreground/30 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th className="text-start py-3 text-foreground/30 font-medium hidden sm:table-cell">{t('email')}</th>
                        <th className="text-start py-3 text-foreground/30 font-medium">{lang === 'ar' ? 'الخطة' : 'Plan'}</th>
                        <th className="text-start py-3 text-foreground/30 font-medium hidden sm:table-cell">{t('properties')}</th>
                        <th className="text-start py-3 text-foreground/30 font-medium">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customers.map((c) => (
                        <tr key={c.id} className="border-b border-foreground/[0.04] last:border-0">
                          <td className="py-3 font-medium text-foreground">{c.name}</td>
                          <td className="py-3 text-foreground/50 hidden sm:table-cell">{c.email}</td>
                          <td className="py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${planBadge[c.plan] || planBadge.free}`}>{c.plan}</span>
                          </td>
                          <td className="py-3 text-foreground/50 hidden sm:table-cell">{c.properties}</td>
                          <td className="py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[c.status] || statusBadge.free}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
