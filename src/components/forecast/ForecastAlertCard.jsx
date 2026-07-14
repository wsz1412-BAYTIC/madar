import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle, TrendingDown, ChevronDown, ChevronUp, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForecastAlertCard({
  alert,
  onSnooze,
  onDismiss,
  onResolve,
  isExpanded,
  onToggleExpand,
}) {
  const { lang } = useLang();
  const { theme } = useTheme();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return theme === 'dark'
          ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30 text-[#FF6B6B]'
          : 'bg-[#FF6B6B]/5 border-[#FF6B6B]/30 text-[#FF6B6B]';
      case 'medium':
        return theme === 'dark'
          ? 'bg-[#FFB800]/10 border-[#FFB800]/30 text-[#FFB800]'
          : 'bg-[#FFB800]/5 border-[#FFB800]/30 text-[#FFB800]';
      default:
        return theme === 'dark'
          ? 'bg-[#6B7280]/10 border-[#6B7280]/30 text-[#6B7280]'
          : 'bg-[#6B7280]/5 border-[#6B7280]/30 text-[#6B7280]';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return theme === 'dark' ? 'text-[#0F6BA8]' : 'text-[#1B84C4]';
      case 'medium':
        return theme === 'dark' ? 'text-[#FFB800]' : 'text-[#FF9900]';
      default:
        return theme === 'dark' ? 'text-[#6B7280]' : 'text-[#9CA3AF]';
    }
  };

  const bgColor = theme === 'dark'
    ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${bgColor} rounded-xl overflow-hidden transition-all`}
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className={`w-full p-5 hover:bg-foreground/[0.03] transition-colors text-left flex items-start justify-between`}
      >
        <div className="flex-1 flex items-start gap-4">
          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-sm ${
                theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
              }`}>
                {alert.propertyName}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
            }`}>
              {lang === 'ar'
                ? `${Math.round(alert.forecastedOccupancy * 100)}% المتوقع مقابل ${Math.round(alert.targetOccupancy * 100)}% الهدف`
                : `${Math.round(alert.forecastedOccupancy * 100)}% forecasted vs ${Math.round(alert.targetOccupancy * 100)}% target`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className={`w-5 h-5 flex-shrink-0 ${
            theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
          }`} />
        ) : (
          <ChevronDown className={`w-5 h-5 flex-shrink-0 ${
            theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
          }`} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-t ${
            theme === 'dark' ? 'border-foreground/[0.06]' : 'border-[#06131F]/10'
          }`}
        >
          <div className="p-5 space-y-5">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'الاشغال المتوقعة' : 'Forecasted'}</p>
                <p className="font-heading font-bold text-lg text-[#1B84C4]">
                  {Math.round(alert.forecastedOccupancy * 100)}%
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'متوسط السوق' : 'Market Avg'}</p>
                <p className="font-heading font-bold text-lg text-[#0F6BA8]">
                  {Math.round(alert.marketOccupancy * 100)}%
                </p>
              </div>
            </div>

            {/* Confidence Score */}
            <div className={`p-4 rounded-lg ${
              theme === 'dark'
                ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
                : 'bg-background/5 border border-[#06131F]/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'دقة التنبؤ' : 'Forecast Confidence'}</p>
                <span className={`text-xs font-bold ${getConfidenceColor(alert.forecast.confidence)}`}>
                  {alert.forecast.confidence === 'high' ? '↑ High' :
                    alert.forecast.confidence === 'medium' ? '→ Medium' : '↓ Low'}
                </span>
              </div>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
              }`}>
                {lang === 'ar'
                  ? 'بناءً على البيانات التاريخية والسوق والأحداث المحلية'
                  : 'Based on historical data, market trends, and local events'}
              </p>
            </div>

            {/* Revenue at Risk */}
            {alert.revenueAtRisk && (
              <div className={`p-4 rounded-lg border-l-4 border-[#FF6B6B] ${
                theme === 'dark'
                  ? 'bg-[#FF6B6B]/5'
                  : 'bg-[#FF6B6B]/5'
              }`}>
                <p className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'الإيرادات المعرضة للخطر' : 'Potential Revenue Loss'}</p>
                <p className="font-heading font-bold text-lg text-[#FF6B6B]">
                  {alert.revenueAtRisk.estimatedRevenueLoss.toLocaleString()} SAR
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-foreground/40' : 'text-[#06131F]/40'
                }`}>
                  {lang === 'ar'
                    ? `خسارة متوقعة لـ ${alert.revenueAtRisk.lostBookingDays} أيام حجز`
                    : `Estimated ${alert.revenueAtRisk.lostBookingDays} lost booking days`}
                </p>
              </div>
            )}

            {/* Main Factors */}
            <div>
              <p className={`text-xs font-medium mb-3 ${
                theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
              }`}>{lang === 'ar' ? 'العوامل الرئيسية' : 'Key Factors'}</p>
              <div className="space-y-2">
                {alert.mainFactors?.map((factor, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-xs p-2 rounded ${
                    theme === 'dark'
                      ? 'bg-foreground/[0.02]'
                      : 'bg-background/3'
                  }`}>
                    <TrendingDown className="w-3 h-3 text-[#1B84C4]" />
                    <span className={
                      theme === 'dark' ? 'text-foreground/70' : 'text-[#06131F]/70'
                    }>
                      {factor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {alert.recommendations && alert.recommendations.length > 0 && (
              <div>
                <p className={`text-xs font-medium mb-3 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'الإجراءات الموصى بها' : 'Recommended Actions'}</p>
                <div className="space-y-2">
                  {alert.recommendations.slice(0, 3).map((rec, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-3 rounded border ${
                        rec.priority === 'high'
                          ? theme === 'dark'
                            ? 'bg-[#1B84C4]/5 border-[#1B84C4]/30'
                            : 'bg-[#1B84C4]/5 border-[#1B84C4]/30'
                          : theme === 'dark'
                            ? 'bg-foreground/[0.02] border-foreground/[0.06]'
                            : 'bg-background/3 border-[#06131F]/10'
                      }`}
                    >
                      <p className={`font-medium mb-1 ${
                        theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
                      }`}>
                        {rec.action}
                      </p>
                      <p className={
                        theme === 'dark' ? 'text-foreground/60' : 'text-[#06131F]/60'
                      }>
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forecast Period */}
            <div className={`text-xs p-3 rounded ${
              theme === 'dark'
                ? 'bg-foreground/[0.02] border border-foreground/[0.06]'
                : 'bg-background/5 border border-[#06131F]/10'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3" />
                <span className={
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }>
                  {alert.forecast.forecastPeriod}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-foreground/[0.06]">
              <button
                onClick={() => onSnooze(alert.id)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-foreground/[0.04] text-foreground hover:bg-foreground/10'
                    : 'bg-background/5 text-[#06131F] hover:bg-background/10'
                }`}
              >
                <Clock className="w-3 h-3" />
                {lang === 'ar' ? 'أرجل' : 'Snooze'}
              </button>
              <button
                onClick={() => onResolve(alert.id)}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-gradient-to-r from-[#00548C] to-[#003152] text-white hover:shadow-lg transition-all"
              >
                {lang === 'ar' ? 'حل' : 'Resolve'}
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-foreground/5'
                    : 'hover:bg-background/5'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function Calendar({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}