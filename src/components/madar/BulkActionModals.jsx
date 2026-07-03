import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/contexts/LanguageContext';
import { Loader2, X, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

// Status Change Modal
export function StatusChangeModal({ isOpen, onClose, onConfirm, isLoading, selectedCount }) {
  const { t, lang, isRTL } = useLang();
  const [status, setStatus] = useState('active');

  const handleConfirm = () => {
    onConfirm(status);
    setStatus('active');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground text-lg">{lang === 'ar' ? 'تغيير الحالة' : 'Change Status'}</h2>
                <p className="text-sm text-foreground/40 mt-1">{selectedCount} {lang === 'ar' ? 'عقار' : 'properties'}</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-foreground/5 rounded-lg">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-foreground/60 block mb-2">{lang === 'ar' ? 'الحالة الجديدة' : 'New Status'}</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20"
                >
                  <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                  <option value="paused">{lang === 'ar' ? 'موقوف مؤقتاً' : 'Paused'}</option>
                  <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archived'}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium hover:bg-foreground/10 transition-colors disabled:opacity-50"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === 'ar' ? 'جاري التحديث' : 'Updating'}
                  </>
                ) : (
                  lang === 'ar' ? 'تأكيد' : 'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add Labels Modal
export function AddLabelsModal({ isOpen, onClose, onConfirm, isLoading, selectedCount }) {
  const { t, lang, isRTL } = useLang();
  const [labels, setLabels] = useState('');

  const handleConfirm = () => {
    onConfirm(labels.split(',').map(l => l.trim()).filter(l => l));
    setLabels('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground text-lg">{lang === 'ar' ? 'إضافة تسميات' : 'Add Labels'}</h2>
                <p className="text-sm text-foreground/40 mt-1">{selectedCount} {lang === 'ar' ? 'عقار' : 'properties'}</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-foreground/5 rounded-lg">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-foreground/60 block mb-2">{lang === 'ar' ? 'التسميات (مفصولة بفواصل)' : 'Labels (comma-separated)'}</label>
                <textarea
                  value={labels}
                  onChange={e => setLabels(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: فاخر، جديد، موصى به' : 'e.g. Premium, New, Featured'}
                  className="w-full px-4 py-3 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-foreground text-sm placeholder-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 resize-none"
                  rows="3"
                />
                <p className="text-xs text-foreground/40 mt-2">{lang === 'ar' ? 'أدخل التسميات مفصولة بفواصل' : 'Enter labels separated by commas'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium hover:bg-foreground/10 transition-colors disabled:opacity-50"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || !labels.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === 'ar' ? 'جاري الإضافة' : 'Adding'}
                  </>
                ) : (
                  lang === 'ar' ? 'تأكيد' : 'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Archive Confirmation Modal
export function ArchiveConfirmModal({ isOpen, onClose, onConfirm, isLoading, selectedCount }) {
  const { t, lang } = useLang();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FF6B6B]/10 rounded-lg mt-1">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-foreground text-lg">{lang === 'ar' ? 'تأكيد الأرشفة' : 'Confirm Archive'}</h2>
                  <p className="text-sm text-foreground/40 mt-1">{lang === 'ar' ? 'هذا الإجراء قابل للعكس' : 'This action is reversible'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-foreground/5 rounded-lg">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            <div className="bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-foreground">
                {lang === 'ar'
                  ? `سيتم أرشفة ${selectedCount} عقار. يمكنك استعادة هذه العقارات لاحقاً من القسم المؤرشف.`
                  : `${selectedCount} properties will be archived. You can restore them later from the archived section.`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium hover:bg-foreground/10 transition-colors disabled:opacity-50"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#FF6B6B] text-white text-sm font-medium hover:bg-[#FF5252] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === 'ar' ? 'جاري الأرشفة' : 'Archiving'}
                  </>
                ) : (
                  lang === 'ar' ? 'تأكيد الأرشفة' : 'Confirm Archive'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Results Modal
export function ActionResultsModal({ isOpen, onClose, results, isSuccess, title, description }) {
  const { t, lang } = useLang();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSuccess ? 'bg-[#51CF66]/10' : 'bg-[#FF6B6B]/10'}`}>
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-[#51CF66]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
                  )}
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-foreground text-lg">{title}</h2>
                  {description && <p className="text-sm text-foreground/40 mt-1">{description}</p>}
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-foreground/5 rounded-lg">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            {results && (
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {results.map((result, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm ${
                    result.success
                      ? 'bg-[#51CF66]/5 border border-[#51CF66]/20 text-foreground'
                      : 'bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 text-[#FF6B6B]'
                  }`}>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{result.message}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all"
            >
              {lang === 'ar' ? 'حسناً' : 'Done'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}