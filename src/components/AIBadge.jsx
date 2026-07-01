import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIBadge({ confidence = 'medium', tooltipEn = 'AI-Generated', tooltipAr = 'محتوى مولد بالذكاء الاصطناعي', showLabel = false }) {
  const confidenceColor = {
    low: 'from-orange-500/30 to-orange-600/20 text-orange-600 border-orange-500/30',
    medium: 'from-amber-500/30 to-amber-600/20 text-amber-600 border-amber-500/30',
    high: 'from-green-500/30 to-green-600/20 text-green-600 border-green-500/30',
  };

  const confidenceLabel = {
    low: 'Low confidence',
    medium: 'Medium confidence',
    high: 'High confidence',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${confidenceColor[confidence]} border text-xs font-medium`}>
        <Zap className="w-3.5 h-3.5" />
        {showLabel && <span>AI</span>}
      </div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-[#0A0B10] text-white text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 z-50"
      >
        <p className="font-medium">{tooltipEn}</p>
        <p className="text-white/60 text-xs">{confidenceLabel[confidence]}</p>
      </motion.div>
    </motion.div>
  );
}

export function AIRecommendationCard({ title, children, confidence = 'medium', disclaimer = true }) {
  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-orange-50/40 to-amber-50/40 border border-orange-200/40">
      <div className="absolute top-4 right-4">
        <AIBadge confidence={confidence} showLabel />
      </div>

      <div className="pr-20 mb-4">
        <h3 className="font-heading font-bold text-[#0A0B10] text-lg">{title}</h3>
      </div>

      <div className="text-[#0A0B10]/70 text-sm leading-relaxed mb-4">{children}</div>

      {disclaimer && (
        <div className="text-xs text-[#0A0B10]/50 border-t border-orange-200/30 pt-3 mt-4">
          <p>
            <span className="font-medium">Disclaimer:</span> AI-generated recommendations are predictions, not guarantees. Review before acting. See our{' '}
            <a href="/ai-disclaimer" className="text-[#D95F3B] hover:underline">
              AI Disclaimer
            </a>
            {' '}for more.
          </p>
        </div>
      )}
    </div>
  );
}