import React, { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FadeIn } from '@/components/madar/Motion';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import MasterCalendarView from '@/components/calendar/MasterCalendarView';
import DateDetailModal from '@/components/calendar/DateDetailModal';
import CalendarAlertsPanel from '@/components/calendar/CalendarAlertsPanel';
import { AnimatePresence } from 'framer-motion';

// Mock property data
const mockProperties = [
  { id: '1', name: 'Luxury Villa - Riyadh', city: 'Riyadh', type: 'villa', platform: 'Airbnb' },
  { id: '2', name: 'Modern Studio - Jeddah', city: 'Jeddah', type: 'apartment', platform: 'Booking.com' },
  { id: '3', name: 'Beachfront Chalet - Khobar', city: 'Khobar', type: 'chalet', platform: 'Airbnb' },
];

// Generate mock calendar data for the current month
const generateCalendarData = () => {
  const data = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rand = Math.random();
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    // Higher demand on weekends
    const baseDemand = isWeekend ? 0.7 : 0.5;
    const occupancyRate = Math.min(100, Math.round((baseDemand + rand * 0.4) * 100));

    // Demand levels
    let demand = 'low';
    if (occupancyRate > 70) demand = 'high';
    else if (occupancyRate > 40) demand = 'medium';

    // Pricing logic
    const basePrice = 250;
    const demandMultiplier = occupancyRate > 70 ? 1.4 : occupancyRate > 40 ? 1.1 : 0.8;
    const currentPrice = Math.round(basePrice * demandMultiplier);
    const recommendedPrice = Math.round(basePrice * (baseDemand + rand * 0.3) * 1.3);
    const competitorPrice = Math.round(basePrice * demandMultiplier * 0.95);

    const priceAlert = recommendedPrice > currentPrice * 1.2
      ? 'Underpriced - opportunity to increase'
      : currentPrice > recommendedPrice * 1.2
        ? 'Overpriced - may reduce bookings'
        : null;

    const hasAlert = priceAlert !== null || (day > 1 && day < daysInMonth && occupancyRate < 20);

    data[dateStr] = {
      date: dateStr,
      day,
      occupancy: occupancyRate,
      demand,
      currentPrice,
      recommendedPrice,
      competitorPrice,
      localDemand: rand > 0.7 ? 'Event (Jeddah Season)' : 'Normal',
      revenueOpportunity: Math.max(0, recommendedPrice - currentPrice),
      priceAlert,
      hasAlert,
      bookings: Math.ceil((occupancyRate / 100) * 3),
    };
  }

  return data;
};

export default function BookingCalendar() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const { entitlements } = useSubscription();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDateData, setSelectedDateData] = useState(null);

  const calendarData = useMemo(() => generateCalendarData(), []);

  // Generate alerts from calendar data
  const alerts = useMemo(() => {
    const alertsList = [];
    Object.values(calendarData).forEach(day => {
      if (day.demand === 'high' && day.currentPrice < day.recommendedPrice * 0.8) {
        alertsList.push({
          type: 'underpriced',
          title: lang === 'ar' ? 'سعر منخفض جداً' : 'Significantly Underpriced',
          description: `${day.date}: ${lang === 'ar' ? 'طلب عالي' : 'High demand'} - ${day.currentPrice} SAR vs ${day.recommendedPrice} SAR`,
          impact: `+${day.revenueOpportunity} SAR`,
        });
      }
      if (day.demand === 'low' && day.currentPrice > day.recommendedPrice * 1.2) {
        alertsList.push({
          type: 'overpriced',
          title: lang === 'ar' ? 'سعر مرتفع جداً' : 'Significantly Overpriced',
          description: `${day.date}: ${lang === 'ar' ? 'طلب منخفض' : 'Low demand'} - ${day.currentPrice} SAR vs ${day.recommendedPrice} SAR`,
          impact: `${lang === 'ar' ? 'قد يقلل الحجوزات' : 'May reduce bookings'}`,
        });
      }
    });
    return alertsList.slice(0, 5); // Show top 5 alerts
  }, [calendarData, lang]);

  // Filter properties based on subscription
  const availableProperties = useMemo(() => {
    const maxProperties = entitlements?.maxProperties || 1;
    return mockProperties.slice(0, maxProperties);
  }, [entitlements]);

  const cities = useMemo(() => [...new Set(availableProperties.map(p => p.city))], [availableProperties]);
  const platforms = useMemo(() => [...new Set(availableProperties.map(p => p.platform))], [availableProperties]);
  const propertyTypes = useMemo(() => [...new Set(availableProperties.map(p => p.type))], [availableProperties]);

  const handleDateClick = (dateData) => {
    if (dateData) setSelectedDateData(dateData);
  };

  const handleApprovePricing = (dateData) => {
    // Simulate approval
    setSelectedDateData(null);
    // In a real app, this would call an API
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`font-heading text-3xl font-bold ${
              theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
            }`}>
              {lang === 'ar' ? 'التقويم الرئيسي' : 'Master Calendar'}
            </h1>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
            }`}>
              {lang === 'ar'
                ? 'راقب الاشغال والأسعار والطلب عبر جميع عقاراتك'
                : 'Monitor occupancy, pricing, and demand across all properties'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            theme === 'dark'
              ? 'bg-[#1B84C4]/10 text-[#1B84C4] border border-[#1B84C4]/30'
              : 'bg-[#1B84C4]/5 text-[#1B84C4] border border-[#1B84C4]/30'
          }`}>
            {lang === 'ar' ? 'عقار واحد متاح' : `${availableProperties.length} properties available`}
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <CalendarFilters
          selectedProperty={selectedProperty}
          onPropertyChange={setSelectedProperty}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          properties={availableProperties}
          cities={cities}
          platforms={platforms}
          propertyTypes={propertyTypes}
        />
      </FadeIn>

      {/* Legend */}
      <FadeIn delay={0.15}>
        <CalendarLegend />
      </FadeIn>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <MasterCalendarView
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            view="month"
            calendarData={calendarData}
            onDateClick={handleDateClick}
          />
        </FadeIn>

        {/* Alerts Panel */}
        <FadeIn delay={0.25}>
          <CalendarAlertsPanel alerts={alerts} />
        </FadeIn>
      </div>

      {/* Summary Stats */}
      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: lang === 'ar' ? 'متوسط الاشغال' : 'Avg Occupancy',
              value: '62%',
              color: 'bg-[#0F6BA8]',
            },
            {
              label: lang === 'ar' ? 'متوسط السعر' : 'Avg Price',
              value: '285 SAR',
              color: 'bg-[#0F6BA8]',
            },
            {
              label: lang === 'ar' ? 'فرص الإيرادات' : 'Revenue Opportunities',
              value: '8,540 SAR',
              color: 'bg-[#6B7280]',
            },
            {
              label: lang === 'ar' ? 'التنبيهات النشطة' : 'Active Alerts',
              value: alerts.length,
              color: 'bg-[#FF6B6B]',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
                  : 'bg-[#EFF6FA] border border-[#06131F]/10'
              }`}
            >
              <p className={`text-xs font-medium mb-2 ${
                theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
              }`}>
                {stat.label}
              </p>
              <p className={`font-heading font-bold text-2xl ${
                theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
              }`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Date Detail Modal */}
      <AnimatePresence>
        {selectedDateData && (
          <DateDetailModal
            dateData={selectedDateData}
            onClose={() => setSelectedDateData(null)}
            onApprovePricing={handleApprovePricing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}