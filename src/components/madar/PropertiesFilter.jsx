import React, { useMemo, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PropertiesFilter({
  properties,
  onFilter,
  selectedFilters,
}) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique cities
  const cities = useMemo(() => {
    return [...new Set(properties.map(p => p.city))].sort();
  }, [properties]);

  // Extract unique tags from properties
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    properties.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [properties]);

  // Performance metrics options
  const performanceMetrics = [
    { value: 'high-occupancy', label: lang === 'ar' ? 'اشغال عالية (>70%)' : 'High Occupancy (>70%)' },
    { value: 'medium-occupancy', label: lang === 'ar' ? 'اشغال متوسطة (40-70%)' : 'Medium Occupancy (40-70%)' },
    { value: 'low-occupancy', label: lang === 'ar' ? 'اشغال منخفضة (<40%)' : 'Low Occupancy (<40%)' },
    { value: 'high-price', label: lang === 'ar' ? 'سعر مرتفع (>600 SAR)' : 'High Price (>600 SAR)' },
    { value: 'medium-price', label: lang === 'ar' ? 'سعر متوسط (300-600 SAR)' : 'Medium Price (300-600 SAR)' },
    { value: 'low-price', label: lang === 'ar' ? 'سعر منخفض (<300 SAR)' : 'Low Price (<300 SAR)' },
  ];

  const handleCityToggle = (city) => {
    const newFilters = { ...selectedFilters };
    if (!newFilters.cities) newFilters.cities = [];
    
    if (newFilters.cities.includes(city)) {
      newFilters.cities = newFilters.cities.filter(c => c !== city);
    } else {
      newFilters.cities.push(city);
    }
    
    onFilter(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newFilters = { ...selectedFilters };
    if (!newFilters.tags) newFilters.tags = [];
    
    if (newFilters.tags.includes(tag)) {
      newFilters.tags = newFilters.tags.filter(t => t !== tag);
    } else {
      newFilters.tags.push(tag);
    }
    
    onFilter(newFilters);
  };

  const handlePerformanceToggle = (metric) => {
    const newFilters = { ...selectedFilters };
    if (!newFilters.performance) newFilters.performance = [];
    
    if (newFilters.performance.includes(metric)) {
      newFilters.performance = newFilters.performance.filter(m => m !== metric);
    } else {
      newFilters.performance.push(metric);
    }
    
    onFilter(newFilters);
  };

  const clearFilters = () => {
    onFilter({ cities: [], tags: [], performance: [] });
  };

  const activeFilterCount = (selectedFilters.cities?.length || 0) + 
                            (selectedFilters.tags?.length || 0) + 
                            (selectedFilters.performance?.length || 0);

  const bgCard = theme === 'dark'
    ? 'bg-foreground/[0.03] border border-foreground/[0.06]'
    : 'bg-[#EFF6FA] border border-[#06131F]/10';

  const bgActive = theme === 'dark'
    ? 'bg-[#1B84C4]/20 border-[#1B84C4]/50'
    : 'bg-[#1B84C4]/10 border-[#1B84C4]/30';

  const textColor = theme === 'dark' ? 'text-foreground' : 'text-[#06131F]';
  const textMuted = theme === 'dark' ? 'text-foreground/50' : 'text-[#06131F]/50';

  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${bgCard} ${
          activeFilterCount > 0 ? bgActive : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${theme === 'dark' ? 'text-[#1B84C4]' : 'text-[#1B84C4]'}`} />
          <span className={`font-medium text-sm ${textColor}`}>
            {lang === 'ar' ? 'تصفية العقارات' : 'Filter Properties'}
          </span>
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 rounded-full bg-[#0F6BA8] text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <X className={`w-5 h-5 transform rotate-45 ${textMuted}`} />
        </motion.div>
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-6 space-y-6 overflow-hidden ${bgCard}`}
          >
            {/* Cities */}
            <div>
              <h3 className={`text-sm font-bold mb-3 ${textColor}`}>
                {lang === 'ar' ? 'المدن' : 'Cities'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => handleCityToggle(city)}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                      selectedFilters.cities?.includes(city)
                        ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                        : theme === 'dark'
                          ? 'bg-foreground/[0.05] text-foreground/70 hover:bg-foreground/10'
                          : 'bg-background/5 text-[#06131F]/70 hover:bg-background/10'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className={`text-sm font-bold mb-3 ${textColor}`}>
                {lang === 'ar' ? 'مقاييس الأداء' : 'Performance Metrics'}
              </h3>
              <div className="space-y-2">
                {performanceMetrics.map(metric => (
                  <label
                    key={metric.value}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      selectedFilters.performance?.includes(metric.value)
                        ? bgActive
                        : theme === 'dark'
                          ? 'hover:bg-foreground/[0.05]'
                          : 'hover:bg-background/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.performance?.includes(metric.value) || false}
                      onChange={() => handlePerformanceToggle(metric.value)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#1B84C4]"
                    />
                    <span className={`text-sm ml-2 ${textColor}`}>
                      {metric.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            {availableTags.length > 0 && (
              <div>
                <h3 className={`text-sm font-bold mb-3 ${textColor}`}>
                  {lang === 'ar' ? 'التسميات المخصصة' : 'Custom Tags'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                        selectedFilters.tags?.includes(tag)
                          ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                          : theme === 'dark'
                            ? 'bg-foreground/[0.05] text-foreground/70 hover:bg-foreground/10'
                            : 'bg-background/5 text-[#06131F]/70 hover:bg-background/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className={`w-full py-2 text-xs font-medium rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                    : 'text-[#06131F]/70 hover:text-[#06131F] hover:bg-background/5'
                }`}
              >
                {lang === 'ar' ? 'مسح التصفيات' : 'Clear Filters'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}