import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import AdminNav from '@/components/admin/AdminNav';
import AdminStats from '@/components/admin/AdminStats';
import AdminOpsSummary from '@/components/admin/AdminOpsSummary';
import AdminOverview from '@/components/admin/AdminOverview';
import { Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Admin access is gated solely on User.role === "admin" (canonical;
        // matches the entity RLS admin clause). The AdminUser table is not
        // used for access control. This is a secondary defense — the route
        // is already wrapped in <AdminRoute> — and the real boundary is RLS.
        if (currentUser?.role !== 'admin') {
          setError('unauthorized');
          setLoading(false);
          return;
        }

        setAdmin(currentUser);

        // Load admin stats
        const users = await base44.entities.User.list();
        const subscriptions = await base44.entities.UserSubscription.list();
        const properties = await base44.entities.UserProperty.list();
        
        setStats({
          totalUsers: users.length,
          activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
          freeUsers: users.length - subscriptions.length,
          totalProperties: properties.length,
          monthlyRevenue: subscriptions
            .filter(s => s.status === 'active')
            .reduce((sum, s) => sum + (s.price || 0), 0),
        });

        setLoading(false);
      } catch (err) {
        console.error('Admin access error:', err);
        setError('error');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error === 'unauthorized') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark' ? 'bg-background' : 'bg-white'
      }`}>
        <div className={`text-center p-8 rounded-2xl border max-w-md ${
          theme === 'dark'
            ? 'bg-card border-red-700/30'
            : 'bg-red-50 border-red-200'
        }`}>
          <Lock className={`w-12 h-12 mx-auto mb-4 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`} />
          <h1 className={`text-xl font-bold mb-2 ${
            theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
          }`}>
            {lang === 'ar' ? 'وصول مرفوض' : 'Access Denied'}
          </h1>
          <p className={`text-sm mb-6 ${
            theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60'
          }`}>
            {lang === 'ar' 
              ? 'ليس لديك الصلاحيات اللازمة للوصول إلى لوحة تحكم المسؤولين'
              : 'You do not have permission to access the admin dashboard'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${
      theme === 'dark' ? 'bg-background' : 'bg-white'
    }`}>
      {/* Admin Sidebar */}
      <AdminNav admin={admin} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`p-6 sm:p-8 ${
          theme === 'dark' ? 'bg-background' : 'bg-[#F2EFE8]'
        }`}>
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl sm:text-4xl font-heading font-bold mb-2 ${
              theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
            }`}>
              {lang === 'ar' ? 'لوحة تحكم المسؤول' : 'Admin Dashboard'}
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-foreground/60' : 'text-[#0A0B10]/60'
            }`}>
              {lang === 'ar' 
                ? `مرحباً ${admin?.role || 'المسؤول'}, إدارة منصة Madar`
                : `Welcome ${admin?.role || 'Admin'}, manage the Madar platform`}
            </p>
          </div>

          {/* Stats */}
          {stats && <AdminStats stats={stats} />}

          {/* Operational summary (requests / alerts / updates) + quick links */}
          <AdminOpsSummary />

          {/* Overview */}
          <AdminOverview admin={admin} />
        </div>
      </main>
    </div>
  );
}