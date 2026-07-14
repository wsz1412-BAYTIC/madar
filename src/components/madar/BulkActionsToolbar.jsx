import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/contexts/LanguageContext';
import { Download, Archive, Tag, Layers, AlertCircle, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function BulkActionsToolbar({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onClearSelection,
  onExport,
  onChangeStatus,
  onAddLabels,
  onArchive,
  isLoading,
  allSelected
}) {
  const { t, lang, isRTL } = useLang();
  const [showActions, setShowActions] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-strong rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-foreground/60">
              {selectedCount} {lang === 'ar' ? 'من' : 'of'} {totalCount} {lang === 'ar' ? 'عقار محدد' : 'selected'}
            </p>
          </div>
          {!allSelected && selectedCount > 0 && (
            <button
              onClick={onSelectAll}
              className="text-xs text-[#1B84C4] hover:text-[#1B84C4] underline transition-colors"
            >
              {lang === 'ar' ? 'تحديد الكل' : 'Select All'}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors text-foreground/50 hover:text-foreground"
            title={lang === 'ar' ? 'إلغاء التحديد' : 'Clear selection'}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Quick Actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-foreground/[0.04] border border-foreground/[0.08] hover:bg-foreground/[0.08] rounded-lg text-sm text-foreground transition-all disabled:opacity-50"
            >
              {lang === 'ar' ? 'إجراءات' : 'Actions'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-48 glass-strong rounded-xl p-2 z-50`}
                >
                  <button
                    onClick={() => { onExport(); setShowActions(false); }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'ar' ? 'تصدير البيانات' : 'Export Data'}
                  </button>

                  <button
                    onClick={() => { onChangeStatus(); setShowActions(false); }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {lang === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                  </button>

                  <button
                    onClick={() => { onAddLabels(); setShowActions(false); }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Tag className="w-4 h-4" />
                    {lang === 'ar' ? 'إضافة تسميات' : 'Add Labels'}
                  </button>

                  <button
                    onClick={() => { onAddLabels(); setShowActions(false); }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Layers className="w-4 h-4" />
                    {lang === 'ar' ? 'تعيين الفئات' : 'Assign Categories'}
                  </button>

                  <div className="border-t border-foreground/[0.06] my-1" />

                  <button
                    onClick={() => { onArchive(); setShowActions(false); }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    {lang === 'ar' ? 'أرشفة' : 'Archive'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}