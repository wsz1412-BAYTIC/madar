import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PlanBadge from '@/components/madar/PlanBadge';
import FeatureGuard from '@/components/FeatureGuard';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import UpcomingBookings from '@/components/dashboard/UpcomingBookings';
import PropertyPerformance from '@/components/dashboard/PropertyPerformance';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, Home, Lock } from 'lucide-react';
import TransientAlert from '@/components/madar/TransientAlert';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const { subscription: subscriptionData, getPlanName } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Get user properties
        const userProps = await base44.entities.UserProperty.filter({ userId: currentUser.id });
        setProperties(userProps);

        // Calculate stats
        const totalRevenue = userProps.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
        const avgOccupancy = userProps.length > 0 
          ? (userProps.reduce((sum, p) => sum + (p.currentOccupancy || 0), 0) / userProps.length)
          : 0;
        const avgAdr = userProps.length > 0
          ? (userProps.reduce((sum, p) => sum + (p.averageAdr || 0), 0) / userProps.length)
          : 0;

        setStats({
          totalProperties: userProps.length,
          activeListings: userProps.filter(p => p.status === 'active').length,
          avgOccupancy: Math.round(avgOccupancy),
          avgAdr: Math.round(avgAdr),
          totalRevenue,
          monthRevenue: totalRevenue,
          lostOpportunities: Math.round(totalRevenue * 0.15),
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setErrors({
          en: 'Some data could not be refreshed — showing the latest available. Pull to retry or check back shortly.',
          ar: 'تعذر تحديث بعض البيانات — تُعرض آخر نسخة متاحة. حاول التحديث أو عد بعد قليل.',
        });
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [lang]);

  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const currentPlan = getPlanName();

  return (
      <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-background' : 'bg-[#F2EFE8]'
      }`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className={`text-3xl sm:text-4xl font-heading font-bold ${
              theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
            }`}>
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <PlanBadge subscription={subscriptionData} />
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60'
          }`}>
            {lang === 'ar' 
              ? `مرحباً ${user?.full_name || 'بك'}, هنا ملخص أداء عقاراتك`
              : `Welcome ${user?.full_name || 'back'}, here's your property performance overview`}
          </p>
        </div>

        {/* Data-load problems surface as a small floating notice — it
            auto-dismisses, has a close button, and never displaces the
            dashboard content, filters, or mobile controls. */}
        {errors && (
          <TransientAlert message={errors} tone="warning" onClose={() => setErrors(null)} />
        )}

        {/* Subscription Warning */}
        {subscriptionData?.status === 'cancelled' && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            theme === 'dark'
              ? 'bg-amber-950/20 border-amber-700/30'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            }`} />
            <div>
              <p className={`font-semibold ${
                theme === 'dark' ? 'text-amber-200' : 'text-amber-900'
              }`}>
                {lang === 'ar' ? 'الاشتراك ملغى' : 'Subscription Cancelled'}
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-amber-200/70' : 'text-amber-700'
              }`}>
                {lang === 'ar' 
                  ? 'الرجاء تجديد الاشتراك للوصول إلى جميع الميزات'
                  : 'Please renew your subscription to access all features'}
              </p>
            </div>
          </div>
        )}

        {/* Stats - Always shown */}
        {stats && (
          <DashboardStats 
            stats={stats}
            subscription={subscriptionData}
          />
        )}

        {/* Main Grid - Only show based on plan features */}
        <FeatureGuard feature="analytics.advancedCharts">
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart properties={properties} />
            </div>

            {/* Property Performance */}
            <div>
              <PropertyPerformance properties={properties} />
            </div>
          </div>

          {/* Alerts and Bookings */}
          <div className="grid lg:grid-cols-2 gap-6">
            <RecentAlerts properties={properties} />
            <UpcomingBookings properties={properties} />
          </div>
        </FeatureGuard>

        {/* Upsell for Free Plan Users */}
        {currentPlan === 'free' && (
          <div className={`mt-8 p-6 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-primary/10 border-primary/30'
              : 'bg-primary/5 border-primary/30'
          }`}>
            <div className="flex items-start gap-4">
              <Lock className={`w-6 h-6 flex-shrink-0 text-primary`} />
              <div className="flex-1">
                <h3 className={`font-heading font-bold mb-2 ${
                  theme === 'dark' ? 'text-primary' : 'text-primary'
                }`}>
                  {lang === 'ar' ? 'فتح ميزات متقدمة' : 'Unlock Advanced Features'}
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'dark' ? 'text-foreground/70' : 'text-[#0A0B10]/70'
                }`}>
                  {lang === 'ar' 
                    ? 'ترقيتك إلى Basic أو أعلى للوصول إلى التحليلات المتقدمة والتسعير الذكي'
                    : 'Upgrade to Basic or higher to access advanced analytics and smart pricing'}
                </p>
                <button
                  onClick={() => navigate('/plans')}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium"
                >
                  {lang === 'ar' ? 'عرض الخطط' : 'View Plans'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`mt-8 p-6 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-card border-foreground/[0.06]'
            : 'bg-white border-[#0A0B10]/[0.06]'
        }`}>
          <h2 className={`text-lg font-heading font-bold mb-4 ${
            theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
          }`}>
            {lang === 'ar' ? 'الخطوات التالية' : 'Next Steps'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/properties')}
              className={`p-4 rounded-lg text-left hover:bg-primary/5 transition-colors ${
                theme === 'dark'
                  ? 'border border-foreground/[0.06]'
                  : 'border border-[#0A0B10]/[0.06]'
              }`}
            >
              <Home className="w-5 h-5 mb-2 text-primary" />
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
              }`}>
                {lang === 'ar' ? 'إضافة عقار' : 'Add Property'}
              </p>
            </button>
            <FeatureGuard feature="analytics.advancedCharts">
              <button
                onClick={() => navigate('/analytics')}
                className={`p-4 rounded-lg text-left hover:bg-primary/5 transition-colors ${
                  theme === 'dark'
                    ? 'border border-foreground/[0.06]'
                    : 'border border-[#0A0B10]/[0.06]'
                }`}
              >
                <TrendingUp className="w-5 h-5 mb-2 text-primary" />
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
                }`}>
                  {lang === 'ar' ? 'التحليلات' : 'Analytics'}
                </p>
              </button>
            </FeatureGuard>
          </div>
        </div>
      </div>
  );
}