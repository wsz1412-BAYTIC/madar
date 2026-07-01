import React from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/madar/PropertyCard';

export default function PropertyCardWithSelection({ 
  prop, 
  index, 
  isSelected, 
  onSelect 
}) {
  return (
    <div className="relative group">
      {/* Selection Checkbox */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-3 left-3 z-20 bg-white/[0.04] border border-white/[0.12] rounded-lg p-1.5 backdrop-blur-sm"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded accent-[#D95F3B] cursor-pointer"
        />
      </motion.div>

      {/* Card with Selection Highlight */}
      <motion.div
        animate={{
          scale: isSelected ? 0.98 : 1,
          opacity: isSelected ? 0.9 : 1
        }}
        transition={{ duration: 0.2 }}
        className={`transition-all ${
          isSelected
            ? 'ring-2 ring-[#D95F3B]/50 rounded-2xl'
            : ''
        }`}
      >
        <PropertyCard prop={prop} index={index} />
      </motion.div>

      {/* Selection Indicator Badge */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 z-20 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-xs font-medium px-2 py-1 rounded-full"
        >
          ✓
        </motion.div>
      )}
    </div>
  );
}