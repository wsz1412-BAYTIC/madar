import React, { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FadeIn } from '@/components/madar/Motion';
import ForecastAlertCard from '@/components/forecast/ForecastAlertCard';
import NotificationPreferences from '@/components/forecast/NotificationPreferences';
import {
  calculateForecast,
  generateAlertRecommendations,
  calculateAlertSeverity,
  estimateRevenueAtRisk,
} from '@/lib/forecastEngine';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, Filter, Settings } from 'lucide-react';

// Mock properties
const mockProperties = [
  {
    id: '1',
    name: 'Luxury Villa - Riyadh',
    city: 'Riyadh',
    type: 'villa',
    currentPrice: 380,
    minimumStay: 2,
    blockedDates: 1,
    occupancyTarget: 0.75,
  },
  {
    id: '2',
    name: 'Modern Studio - Jeddah',
    city: 'Jeddah',
    type: 'apartment',
    currentPrice: 220,
    minimumStay: 1,
    blockedDates: 0,
    occupancyTarget: 0.65,
  },
  {
    id: '3',
    name: 'Beachfront Chalet - Khobar',
    city: 'Khobar',
    type: 'chalet',
    currentPrice: 450,
    minimumStay: 3,
    blockedDates: 2,
    occupancyTarget: 0.80,
  },
];

// Mock market data
const mockMarketData = {
  '1': {
    avgOccupancy: 0.68,
    competitorAvg: 0.65,
    avgPrice: 350,
    priceRange: { min: 300, max: 450 },
    confidence: 0.85,
  },
  '2': {
    avgOccupancy: 0.60,
    competitorAvg: 0.58,
    avgPrice: 240,
    priceRange: { min: 180, max: 300 },
    confidence: 0.80,
  },
  '3': {
    avgOccupancy: 0.72,
    competitorAvg: 0.70,
    avgPrice: 420,
    priceRange: { min: 350, max: 520 },
    confidence: 0.88,
  },
};

// Mock historical data
const mockHistoricalData = {
  '1': {
    avgOccupancy: 0.70,
    trend: 0.05,
    confidence: 0.9,
  },
  '2': {
    avgOccupancy: 0.55,
    trend: -0.1,
    confidence: 0.75,
  },
  '3': {
    avgOccupancy: 0.75,
    trend: 0.02,
    confidence: 0.88,
  },
};

// Mock events
const mockEvents = [
  { date: '2025-07-23', importance: 0.8, name: 'National Day' },
  { date: '2025-07-15', importance: 0.6, name: 'Summer Season Peak' },
];

// Mock lead time data
const mockLeadTimeData = {
  '1': { bookingRate: 0.45, daysBooked: 12, confidence: 0.8 },
  '2': { bookingRate: 0.35, daysBooked: 8, confidence: 0.7 },
  '3': { bookingRate: 0.50, daysBooked: 15, confidence: 0.85 },
};

export default function OccupancyForecast() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const { entitlements, userPlan } = useSubscription();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [resolvedAlerts, setResolvedAlerts] = useState(new Set());
  const [showPreferences, setShowPreferences] = useState(false);

  // Check feature access
  const hasAccess = useMemo(() => {
    return entitlements?.occupancyForecasting === true || userPlan?.slug === 'pro';
  }, [entitlements, userPlan]);

  // Generate forecasts and alerts
  const alerts = useMemo(() => {
    if (!hasAccess) return [];

    // Filter properties by subscription plan
    const maxProps = entitlements?.maxProperties || 1;
    const availableProperties = mockProperties.slice(0, maxProps);

    const generatedAlerts = availableProperties
      .map(property => {
        const forecast = calculateForecast(
          property,
          mockHistoricalData[property.id],
          mockMarketData[property.id],
          mockEvents,
          mockLeadTimeData[property.id]
        );

        const severity = calculateAlertSeverity(
          forecast.forecastedOccupancy,
          property.occupancyTarget,
          forecast.confidence
        );

        if (!severity) return null;

        const recommendations = generateAlertRecommendations(
          forecast,
          property,
          mockMarketData[property.id]
        );

        const revenueAtRisk = estimateRevenueAtRisk(
          property,
          forecast,
          property.occupancyTarget
        );

        const mainFactors = [];
        if (forecast.factors.historical.trend < -0.05) mainFactors.push('Declining historical trend');
        if (forecast.factors.market.seasonal < 1) mainFactors.push('Off-season period');
        if (forecast.factors.competitor.priceCompetitiveness < 0.9) mainFactors.push('Overpriced vs competitors');
        if (forecast.factors.leadTime.daysBooked < 10) mainFactors.push('Low advance bookings');

        return {
          id: `alert-${property.id}-${Date.now()}`,
          propertyId: property.id,
          propertyName: property.name,
          city: property.city,
          forecastedOccupancy: forecast.forecastedOccupancy,
          targetOccupancy: property.occupancyTarget,
          marketOccupancy: mockMarketData[property.id].avgOccupancy,
          severity,
          forecast,
          recommendations: recommendations.slice(0, 5),
          revenueAtRisk,
          mainFactors: mainFactors.slice(0, 3),
          timestamp: new Date(),
        };
      })
      .filter(Boolean);

    return generatedAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [hasAccess, entitlements]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (dismissedAlerts.has(alert.id) || resolvedAlerts.has(alert.id)) return false;
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high') return alert.severity === 'high';
      if (selectedFilter === 'medium') return alert.severity === 'medium';
      if (selectedFilter === 'low') return alert.severity === 'low';
      return alert.city === selectedFilter;
    });
  }, [alerts, selectedFilter, dismissedAlerts, resolvedAlerts]);

  if (!hasAccess) {
    return (
      <div className={`p-8 rounded-xl text-center ${
        theme === 'dark'
          ? 'bg-white/[0.03] border border-white/[0.06]'
          : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
      }`}>
        <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${
          theme === 'dark' ? 'text-[#D95F3B]' : 'text-[#D95F3B]'
        }`} />
        <h2 className={`font-heading font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
        }`}>
          {lang === 'ar' ? 'ميزة غير متاحة' : 'Feature Not Available'}
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
        }`}>
          {lang === 'ar'
            ? 'تنبيهات الاشغال المتقدمة متاحة فقط في خطة Pro'
            : 'Advanced occupancy forecasting is available in Pro plan'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`font-heading text-3xl font-bold ${
              theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
            }`}>
              {lang === 'ar' ? 'تنبيهات الاشغال' : 'Occupancy Forecast Alerts'}
            </h1>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`}>
              {lang === 'ar'
                ? 'راقب توقعات الاشغال لـ 30 يوم القادمة مع توصيات ذكية'
                : 'Monitor 30-day occupancy forecasts with AI-powered recommendations'}
            </p>
          </div>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`p-3 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-white/[0.04] hover:bg-white/10'
                : 'bg-[#0A0B10]/5 hover:bg-[#0A0B10]/10'
            }`}
          >
            <Settings className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
            }`} />
          </button>
        </div>
      </FadeIn>

      {/* Preferences Panel */}
      <AnimatePresence>
        {showPreferences && (
          <FadeIn delay={0.1}>
            <NotificationPreferences
              onSave={(prefs) => {
                // In real app, save to backend
                console.log('Saved preferences:', prefs);
              }}
            />
          </FadeIn>
        )}
      </AnimatePresence>

      {/* Filters & Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Alert Count Stats */}
          {[
            {
              label: lang === 'ar' ? 'الكل' : 'All',
              value: filteredAlerts.length,
              filter: 'all',
              color: 'text-[#F7F5F0]',
            },
            {
              label: lang === 'ar' ? 'عالي' : 'High',
              value: alerts.filter(a => a.severity === 'high').length,
              filter: 'high',
              color: 'text-[#FF6B6B]',
            },
            {
              label: lang === 'ar' ? 'متوسط' : 'Medium',
              value: alerts.filter(a => a.severity === 'medium').length,
              filter: 'medium',
              color: 'text-[#FFB800]',
            },
            {
              label: lang === 'ar' ? 'منخفض' : 'Low',
              value: alerts.filter(a => a.severity === 'low').length,
              filter: 'low',
              color: 'text-[#6B7280]',
            },
          ].map(stat => (
            <button
              key={stat.filter}
              onClick={() => setSelectedFilter(stat.filter)}
              className={`p-4 rounded-lg transition-all ${
                selectedFilter === stat.filter
                  ? 'ring-2 ring-[#D95F3B] ' + (
                    theme === 'dark'
                      ? 'bg-white/[0.08] border border-[#D95F3B]/50'
                      : 'bg-[#0A0B10]/10 border border-[#D95F3B]/50'
                  )
                  : theme === 'dark'
                    ? 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
                    : 'bg-[#F2EFE8] border border-[#0A0B10]/10 hover:bg-[#0A0B10]/5'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
              }`}>
                {stat.label}
              </p>
              <p className={`font-heading font-bold text-2xl ${stat.color}`}>
                {stat.value}
              </p>
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <FadeIn delay={0.2}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map(alert => (
                <ForecastAlertCard
                  key={alert.id}
                  alert={alert}
                  isExpanded={expandedAlert === alert.id}
                  onToggleExpand={() => setExpandedAlert(
                    expandedAlert === alert.id ? null : alert.id
                  )}
                  onSnooze={(id) => {
                    // In real app, set snooze timer
                    console.log('Snoozed:', id);
                  }}
                  onDismiss={(id) => {
                    setDismissedAlerts(new Set([...dismissedAlerts, id]));
                  }}
                  onResolve={(id) => {
                    setResolvedAlerts(new Set([...resolvedAlerts, id]));
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2}>
          <div className={`p-12 rounded-xl text-center ${
            theme === 'dark'
              ? 'bg-white/[0.03] border border-white/[0.06]'
              : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
          }`}>
            <p className={`text-lg font-medium ${
              theme === 'dark' ? 'text-[#F7F5F0]' : 'text-[#0A0B10]'
            }`}>
              {lang === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}
            </p>
            <p className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-[#F7F5F0]/50' : 'text-[#0A0B10]/50'
            }`}>
              {lang === 'ar'
                ? 'جميع عقاراتك تحقق أهدافها في الاشغال'
                : 'All your properties are meeting occupancy targets'}
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}