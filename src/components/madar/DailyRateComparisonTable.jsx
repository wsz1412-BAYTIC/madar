import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const dailyRateData = [
  { date: 'Jul 1', day: 'Tue', yourRate: 320, competitor1: 350, competitor2: 310, competitor3: 330, trend: 'stable', occupancy: '85%' },
  { date: 'Jul 2', day: 'Wed', yourRate: 320, competitor1: 345, competitor2: 315, competitor3: 335, trend: 'up', occupancy: '88%' },
  { date: 'Jul 3', day: 'Thu', yourRate: 330, competitor1: 360, competitor2: 320, competitor3: 340, trend: 'down', occupancy: '82%' },
  { date: 'Jul 4', day: 'Fri', yourRate: 450, competitor1: 480, competitor2: 420, competitor3: 460, trend: 'up', occupancy: '95%' },
  { date: 'Jul 5', day: 'Sat', yourRate: 480, competitor1: 520, competitor2: 450, competitor3: 500, trend: 'up', occupancy: '98%' },
  { date: 'Jul 6', day: 'Sun', yourRate: 460, competitor1: 500, competitor2: 440, competitor3: 480, trend: 'stable', occupancy: '92%' },
  { date: 'Jul 7', day: 'Mon', yourRate: 340, competitor1: 370, competitor2: 330, competitor3: 350, trend: 'down', occupancy: '80%' },
  { date: 'Jul 8', day: 'Tue', yourRate: 350, competitor1: 380, competitor2: 340, competitor3: 360, trend: 'up', occupancy: '86%' },
];

export default function DailyRateComparisonTable() {
  const { lang } = useLang();
  const [expandedRow, setExpandedRow] = useState(null);

  const sar = lang === 'ar' ? 'ر.س' : 'SAR';

  const getTrendColor = (yourRate, avgCompetitor) => {
    const diff = yourRate - avgCompetitor;
    if (diff > 20) return 'text-emerald-400';
    if (diff < -20) return 'text-red-400';
    return 'text-[#0F6BA8]';
  };

  const getDifference = (yourRate, avgCompetitor) => {
    const diff = yourRate - avgCompetitor;
    const percent = ((diff / avgCompetitor) * 100).toFixed(1);
    return { diff: Math.abs(diff), percent: Math.abs(percent), isLower: diff < 0 };
  };

  const headers = [
    { key: 'date', labelEn: 'Date', labelAr: 'التاريخ' },
    { key: 'your', labelEn: 'Your Rate', labelAr: 'سعرك' },
    { key: 'comp1', labelEn: 'Competitor 1', labelAr: 'منافس 1' },
    { key: 'comp2', labelEn: 'Competitor 2', labelAr: 'منافس 2' },
    { key: 'comp3', labelEn: 'Competitor 3', labelAr: 'منافس 3' },
    { key: 'avg', labelEn: 'Avg Market', labelAr: 'متوسط السوق' },
    { key: 'position', labelEn: 'Position', labelAr: 'المركز' },
    { key: 'occupancy', labelEn: 'Occupancy', labelAr: 'الإشغال' },
  ];

  return (
    <FadeIn delay={0.5}>
      <div className="relative glass rounded-3xl p-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ADDFF1]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-heading font-semibold text-foreground text-lg">
              {lang === 'ar' ? 'مقارنة الأسعار اليومية' : 'Daily Rate Comparison'}
            </h2>
            <p className="text-xs text-foreground/40 mt-2">
              {lang === 'ar'
                ? 'قارن أسعارك اليومية مع أسعار المنافسين في نفس الحي'
                : 'Compare your daily rates against competitor pricing in the same neighborhood'}
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/[0.06]">
                  {headers.map(header => (
                    <th
                      key={header.key}
                      className="px-4 py-3 text-left font-medium text-foreground/60 whitespace-nowrap"
                    >
                      {lang === 'ar' ? header.labelAr : header.labelEn}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyRateData.map((row, idx) => {
                  const avgCompetitor = (row.competitor1 + row.competitor2 + row.competitor3) / 3;
                  const diff = getDifference(row.yourRate, avgCompetitor);
                  const isHighest = row.yourRate >= row.competitor1 && row.yourRate >= row.competitor2 && row.yourRate >= row.competitor3;
                  const isLowest = row.yourRate <= row.competitor1 && row.yourRate <= row.competitor2 && row.yourRate <= row.competitor3;

                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-foreground/[0.03] hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{row.date}</span>
                          <span className="text-xs text-foreground/40">{row.day}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#1B84C4]">{row.yourRate} {sar}</span>
                      </td>
                      <td className="px-4 py-4 text-foreground/70">{row.competitor1} {sar}</td>
                      <td className="px-4 py-4 text-foreground/70">{row.competitor2} {sar}</td>
                      <td className="px-4 py-4 text-foreground/70">{row.competitor3} {sar}</td>
                      <td className="px-4 py-4 text-[#0F6BA8]">{avgCompetitor.toFixed(0)} {sar}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(row.yourRate, avgCompetitor)}`}>
                          {diff.isLower ? (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              {diff.percent}%
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              +{diff.percent}%
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {isHighest && (
                          <span className="inline-block px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/20">
                            {lang === 'ar' ? 'الأعلى' : 'Highest'}
                          </span>
                        )}
                        {isLowest && (
                          <span className="inline-block px-2.5 py-1 bg-blue-500/15 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">
                            {lang === 'ar' ? 'الأقل' : 'Lowest'}
                          </span>
                        )}
                        {!isHighest && !isLowest && (
                          <span className="inline-block px-2.5 py-1 bg-[#ADDFF1]/15 text-[#0F6BA8] text-xs font-medium rounded-full border border-[#ADDFF1]/20">
                            {lang === 'ar' ? 'متوسط' : 'Mid'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-foreground/70 font-medium">{row.occupancy}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {dailyRateData.map((row, idx) => {
              const avgCompetitor = (row.competitor1 + row.competitor2 + row.competitor3) / 3;
              const diff = getDifference(row.yourRate, avgCompetitor);
              const isHighest = row.yourRate >= row.competitor1 && row.yourRate >= row.competitor2 && row.yourRate >= row.competitor3;
              const isLowest = row.yourRate <= row.competitor1 && row.yourRate <= row.competitor2 && row.yourRate <= row.competitor3;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-foreground/[0.06] rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors"
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <p className="font-medium text-foreground">{row.date}</p>
                          <p className="text-xs text-foreground/40">{row.day}</p>
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-[#1B84C4]">{row.yourRate} {sar}</p>
                          <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${getTrendColor(row.yourRate, avgCompetitor)}`}>
                            {diff.isLower ? (
                              <>
                                <TrendingDown className="w-3 h-3" />
                                {diff.percent}%
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3" />
                                +{diff.percent}%
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {isHighest && (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/20">
                            {lang === 'ar' ? 'الأعلى' : 'Highest'}
                          </span>
                        )}
                        {isLowest && (
                          <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">
                            {lang === 'ar' ? 'الأقل' : 'Lowest'}
                          </span>
                        )}
                        {!isHighest && !isLowest && (
                          <span className="px-2 py-0.5 bg-[#ADDFF1]/15 text-[#0F6BA8] text-xs font-medium rounded-full border border-[#ADDFF1]/20">
                            {lang === 'ar' ? 'متوسط' : 'Mid'}
                          </span>
                        )}
                        <span className="text-xs text-foreground/50 ml-auto">{row.occupancy}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/40 transition-transform ${expandedRow === idx ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedRow === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-foreground/[0.06] px-4 py-3 bg-foreground/[0.02] space-y-2 text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="text-foreground/60">{lang === 'ar' ? 'منافس 1' : 'Competitor 1'}:</span>
                          <span className="text-foreground">{row.competitor1} {sar}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">{lang === 'ar' ? 'منافس 2' : 'Competitor 2'}:</span>
                          <span className="text-foreground">{row.competitor2} {sar}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">{lang === 'ar' ? 'منافس 3' : 'Competitor 3'}:</span>
                          <span className="text-foreground">{row.competitor3} {sar}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-foreground/[0.06] font-medium">
                          <span className="text-[#0F6BA8]">{lang === 'ar' ? 'متوسط السوق' : 'Market Avg'}:</span>
                          <span className="text-foreground">{avgCompetitor.toFixed(0)} {sar}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-foreground/[0.06]">
            {[
              {
                labelEn: 'Avg Your Rate',
                labelAr: 'متوسط سعرك',
                value: (dailyRateData.reduce((sum, r) => sum + r.yourRate, 0) / dailyRateData.length).toFixed(0),
              },
              {
                labelEn: 'Avg Market',
                labelAr: 'متوسط السوق',
                value: (dailyRateData.reduce((sum, r) => sum + ((r.competitor1 + r.competitor2 + r.competitor3) / 3), 0) / dailyRateData.length).toFixed(0),
              },
              {
                labelEn: 'Highest Rate',
                labelAr: 'أعلى سعر',
                value: Math.max(...dailyRateData.map(r => r.yourRate)),
              },
              {
                labelEn: 'Lowest Rate',
                labelAr: 'أقل سعر',
                value: Math.min(...dailyRateData.map(r => r.yourRate)),
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]"
              >
                <p className="text-xs text-foreground/50 mb-1">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
                <p className="text-lg font-bold text-foreground">{stat.value} {sar}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}