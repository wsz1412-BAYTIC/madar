import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DateDetailModal({ dateData, onClose, onApprovePricing }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const [isApproving, setIsApproving] = useState(false);

  if (!dateData) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise(r => setTimeout(r, 300));
    onApprovePricing(dateData);
    setIsApproving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-md w-full rounded-2xl p-6 ${
          theme === 'dark'
            ? 'bg-surface border border-foreground/[0.08]'
            : 'bg-white border border-[#06131F]/10'
        }`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className={`font-heading font-bold text-xl mb-6 ${
          theme === 'dark' ? 'text-foreground' : 'text-[#06131F]'
        }`}>
          {dateData.date}
        </h2>

        <div className="space-y-5 mb-6">
          {/* Occupancy */}
          <div>
            <p className={`text-xs font-medium mb-1 ${
              theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
            }`}>{lang === 'ar' ? 'مستوى الاشغال' : 'Occupancy Level'}</p>
            <div className="w-full bg-foreground/[0.05] rounded-lg h-2">
              <div
                className="bg-gradient-to-r from-[#00548C] to-[#003152] h-2 rounded-lg"
                style={{ width: `${dateData.occupancy}%` }}
              />
            </div>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-foreground/70' : 'text-[#06131F]/70'
            }`}>{dateData.occupancy}%</p>
          </div>

          {/* Pricing Section */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
              : 'bg-[#EFF6FA] border border-[#06131F]/10'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-medium mb-2 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'السعر الحالي' : 'Current Price'}</p>
                <p className="font-heading font-bold text-lg text-[#1B84C4]">{dateData.currentPrice} SAR</p>
              </div>
              <div>
                <p className={`text-xs font-medium mb-2 ${
                  theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
                }`}>{lang === 'ar' ? 'السعر الموصى به' : 'Recommended'}</p>
                <p className={`font-heading font-bold text-lg ${theme === 'dark' ? 'text-[#7CC4E8]' : 'text-[#0F6BA8]'}`}>{dateData.recommendedPrice} SAR</p>
              </div>
            </div>
            {dateData.priceAlert && (
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-foreground/[0.06]">
                <AlertCircle className="w-4 h-4 text-[#1B84C4] mt-0.5 flex-shrink-0" />
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-[#1B84C4]/80' : 'text-[#1B84C4]'
                }`}>{dateData.priceAlert}</p>
              </div>
            )}
          </div>

          {/* Competitor & Events */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={`text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
              }`}>{lang === 'ar' ? 'متوسط المنافسين' : 'Competitors Avg'}</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-foreground/70' : 'text-[#06131F]/70'
              }`}>{dateData.competitorPrice} SAR</p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
              }`}>{lang === 'ar' ? 'الطلب المحلي' : 'Local Demand'}</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-foreground/70' : 'text-[#06131F]/70'
              }`}>{dateData.localDemand}</p>
            </div>
          </div>

          {/* Revenue Opportunity */}
          <div>
            <p className={`text-xs font-medium mb-2 ${
              theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50'
            }`}>{lang === 'ar' ? 'فرصة الإيرادات' : 'Revenue Opportunity'}</p>
            <p className="font-heading font-bold text-lg text-[#0F6BA8]">+{dateData.revenueOpportunity} SAR</p>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-foreground/40' : 'text-[#06131F]/40'
            }`}>{lang === 'ar' ? 'إيرادات إضافية محتملة' : 'Potential additional revenue'}</p>
          </div>
        </div>

        {/* Action Button */}
        {dateData.recommendedPrice !== dateData.currentPrice && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-[#1B84C4]/20 disabled:opacity-50"
          >
            {isApproving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-foreground/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {lang === 'ar' ? 'الموافقة على السعر' : 'Approve Price'}
              </span>
            )}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}