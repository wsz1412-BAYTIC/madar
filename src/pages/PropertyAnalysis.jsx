import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PublicNavbar from '@/components/madar/PublicNavbar';
import ComprehensiveFooter from '@/components/madar/ComprehensiveFooter';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PropertyAnalysis() {
  const { t, lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    city: '',
    type: '',
    bedrooms: '',
    guests: '',
    platform: '',
    currentPrice: '',
    occupancy: '',
  });
  const [showResults, setShowResults] = useState(false);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (formData.city && formData.type && formData.currentPrice && formData.occupancy) {
      setShowResults(true);
    }
  };

  const bgCard = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const bgInput = theme === 'dark'
    ? 'bg-white/[0.04] border border-white/[0.08] text-[#F2F8FC]'
    : 'bg-white border border-[#06131F]/10 text-[#06131F]';

  const textColor = theme === 'dark' ? 'text-[#F2F8FC]' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-[#F2F8FC]/60' : 'text-[#06131F]/60';

  const suggestions = [
    {
      type: lang === 'ar' ? 'السعر المقترح' : 'Recommended Price',
      current: '450 SAR',
      suggested: '520 SAR',
      increase: '+15.6%',
      reason: lang === 'ar' ? 'بناءً على مقارنة السوق' : 'Based on market comparison',
    },
    {
      type: lang === 'ar' ? 'فرصة الإيراد' : 'Revenue Opportunity',
      value: '12,500 SAR',
      period: lang === 'ar' ? 'شهرياً' : 'per month',
      reason: lang === 'ar' ? 'من خلال تحسين الأسعار' : 'Through price optimization',
    },
  ];

  const strengths = [
    lang === 'ar' ? 'موقع ممتاز في منطقة مطلوبة' : 'Excellent location in high-demand area',
    lang === 'ar' ? 'توفر المرافق الأساسية كاملة' : 'Complete basic amenities',
    lang === 'ar' ? 'سعر تنافسي نسبياً' : 'Relatively competitive pricing',
  ];

  const weaknesses = [
    lang === 'ar' ? 'إشغال أقل من متوسط السوق' : 'Below average occupancy rate',
    lang === 'ar' ? 'نقص في المرافق الإضافية' : 'Missing premium amenities',
    lang === 'ar' ? 'صور العقار بحاجة لتحديث' : 'Property images need update',
  ];

  if (showResults) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
        <PublicNavbar />
        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Header */}
            <FadeIn>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`font-heading text-4xl font-bold mb-2 ${textColor}`}>
                    {lang === 'ar' ? 'نتائج التحليل' : 'Analysis Results'}
                  </h1>
                  <p className={textMuted}>{lang === 'ar' ? 'عقارك في المدينة المختارة' : 'Your property in selected city'}</p>
                </div>
                <button
                  onClick={() => { setShowResults(false); setFormData({}); }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.04] text-[#F2F8FC] hover:bg-white/[0.08]'
                      : 'bg-[#06131F]/5 text-[#06131F] hover:bg-[#06131F]/10'
                  }`}
                >
                  {lang === 'ar' ? 'تحليل جديد' : 'New Analysis'}
                </button>
              </div>
            </FadeIn>

            {/* Key Suggestions */}
            <StaggerContainer>
              {suggestions.map((s, idx) => (
                <StaggerItem key={idx}>
                  <div className={`p-6 rounded-xl ${bgCard}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={`font-bold ${textColor}`}>{s.type}</h3>
                      {s.increase && <span className="text-green-500 font-bold">{s.increase}</span>}
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className={`text-sm ${textMuted}`}>{lang === 'ar' ? 'الحالي' : 'Current'}</p>
                        <p className={`font-heading font-bold text-2xl ${textColor}`}>{s.current}</p>
                      </div>
                      {s.suggested && (
                        <>
                          <ArrowRight className="w-6 h-6 text-[#1B84C4]" />
                          <div>
                            <p className={`text-sm ${textMuted}`}>{lang === 'ar' ? 'المقترح' : 'Suggested'}</p>
                            <p className={`font-heading font-bold text-2xl text-[#1B84C4]`}>{s.suggested}</p>
                          </div>
                        </>
                      )}
                      {s.period && (
                        <div>
                          <p className={`text-sm ${textMuted}`}>{s.period}</p>
                          <p className={`font-heading font-bold text-2xl text-[#0F6BA8]`}>{s.value}</p>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-4 ${textMuted}`}>{s.reason}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Strengths & Weaknesses */}
            <div className="grid lg:grid-cols-2 gap-8">
              <FadeIn delay={0.2}>
                <div className={`p-6 rounded-xl ${bgCard}`}>
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h2 className={`font-heading font-bold ${textColor}`}>
                      {lang === 'ar' ? 'نقاط القوة' : 'Strengths'}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className={`text-sm ${textColor}`}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className={`p-6 rounded-xl ${bgCard}`}>
                  <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-[#1B84C4]" />
                    <h2 className={`font-heading font-bold ${textColor}`}>
                      {lang === 'ar' ? 'فرص التحسين' : 'Areas to Improve'}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {weaknesses.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#0F6BA8] rounded-full mt-2 flex-shrink-0" />
                        <p className={`text-sm ${textColor}`}>{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Recommendations */}
            <FadeIn delay={0.4}>
              <div className={`p-6 rounded-xl ${bgCard}`}>
                <h2 className={`font-heading font-bold text-xl mb-6 ${textColor}`}>
                  {lang === 'ar' ? 'التوصيات العملية' : 'Actionable Recommendations'}
                </h2>
                <div className="space-y-4">
                  {[
                    { title: lang === 'ar' ? 'زيادة السعر تدريجياً' : 'Gradually Increase Price', desc: lang === 'ar' ? 'ارفع السعر 5% شهرياً حتى تصل للسعر المقترح' : 'Increase price by 5% monthly to reach recommended rate' },
                    { title: lang === 'ar' ? 'تحسين صور العقار' : 'Improve Property Images', desc: lang === 'ar' ? 'صور احترافية تزيد الحجوزات بحوالي 20%' : 'Professional photos increase bookings by ~20%' },
                    { title: lang === 'ar' ? 'أضف مرافق مميزة' : 'Add Premium Amenities', desc: lang === 'ar' ? 'مثل Wi-Fi فائق السرعة والقهوة المجانية' : 'Like high-speed Wi-Fi and complimentary coffee' },
                  ].map((r, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 border-[#1B84C4] ${
                      theme === 'dark'
                        ? 'bg-white/[0.02]'
                        : 'bg-[#06131F]/3'
                    }`}>
                      <p className={`font-medium mb-1 ${textColor}`}>{r.title}</p>
                      <p className={`text-sm ${textMuted}`}>{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn delay={0.5}>
              <div className={`p-12 rounded-2xl text-center ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-[#1B84C4]/10 to-[#ADDFF1]/5 border border-[#1B84C4]/30'
                  : 'bg-gradient-to-br from-[#1B84C4]/5 to-[#ADDFF1]/3 border border-[#1B84C4]/20'
              }`}>
                <h3 className={`font-heading text-2xl font-bold mb-4 ${textColor}`}>
                  {lang === 'ar' ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
                </h3>
                <p className={`mb-6 max-w-2xl mx-auto ${textMuted}`}>
                  {lang === 'ar'
                    ? 'انضم لآلاف المضيفين الذين يستخدمون مدار لتحسين إيراداتهم'
                    : 'Join thousands of hosts using Madar to boost their revenue'}
                </p>
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all"
                >
                  {lang === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                  <Arrow className="w-4 h-4" />
                </a>
              </div>
            </FadeIn>
          </div>
        </main>
        <ComprehensiveFooter />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
      <PublicNavbar />

      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <FadeIn>
            <div>
              <h1 className={`font-heading text-4xl sm:text-5xl font-bold mb-4 ${textColor}`}>
                {lang === 'ar' ? 'تحليل عقارك' : 'Analyze Your Property'}
              </h1>
              <p className={`text-lg ${textMuted}`}>
                {lang === 'ar'
                  ? 'أدخل بيانات عقارك واحصل على تحليل شامل وتوصيات مخصصة'
                  : 'Enter your property details and get comprehensive analysis with personalized recommendations'}
              </p>
            </div>
          </FadeIn>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-2xl ${bgCard} space-y-6`}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'المدينة' : 'City'}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput} placeholder-gray-400`}
                >
                  <option value="">{lang === 'ar' ? 'اختر المدينة' : 'Select city'}</option>
                  <option value="riyadh">Riyadh</option>
                  <option value="jeddah">Jeddah</option>
                  <option value="khobar">Khobar</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'نوع العقار' : 'Property Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                >
                  <option value="">{lang === 'ar' ? 'اختر النوع' : 'Select type'}</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="chalet">Chalet</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'عدد الغرف' : 'Bedrooms'}
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                  placeholder="2"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'عدد الضيوف' : 'Guest Capacity'}
                </label>
                <input
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleInputChange('guests', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                  placeholder="6"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'المنصة' : 'Platform'}
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                >
                  <option value="">{lang === 'ar' ? 'اختر المنصة' : 'Select platform'}</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="booking">Booking.com</option>
                  <option value="direct">Direct Bookings</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'السعر الحالي' : 'Current Price'} (SAR)
                </label>
                <input
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                  placeholder="450"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  {lang === 'ar' ? 'نسبة الإشغال الحالية' : 'Current Occupancy'} (%)
                </label>
                <input
                  type="number"
                  value={formData.occupancy}
                  onChange={(e) => handleInputChange('occupancy', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${bgInput}`}
                  placeholder="65"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.city || !formData.type || !formData.currentPrice || !formData.occupancy}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {lang === 'ar' ? 'ابدأ التحليل' : 'Analyze Now'}
              <Arrow className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Info */}
          <FadeIn delay={0.2}>
            <div className={`p-6 rounded-xl ${bgCard}`}>
              <p className={`text-sm ${textMuted}`}>
                {lang === 'ar'
                  ? '💡 التحليل يستغرق ثوانٍ قليلة. سيعطيك رؤية شاملة حول أداء عقارك وفرص تحسين الإيراد.'
                  : '💡 Analysis takes seconds. Get a comprehensive view of your property\'s performance and revenue opportunities.'}
              </p>
            </div>
          </FadeIn>
        </div>
      </main>

      <ComprehensiveFooter />
    </div>
  );
}