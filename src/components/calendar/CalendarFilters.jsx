import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Filter } from 'lucide-react';

export default function CalendarFilters({
  selectedProperty,
  onPropertyChange,
  selectedCity,
  onCityChange,
  selectedPlatform,
  onPlatformChange,
  selectedType,
  onTypeChange,
  properties,
  cities,
  platforms,
  propertyTypes,
}) {
  const { t, lang } = useLang();
  const { theme } = useTheme();

  const filterClass = `px-3 py-2 text-sm rounded-lg transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] text-[#F7F5F0] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20'
      : 'bg-[#0A0B10]/5 border border-[#0A0B10]/10 text-[#0A0B10] focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20'
  }`;

  return (
    <div className={`p-4 rounded-xl ${
      theme === 'dark'
        ? 'bg-white/[0.03] border border-white/[0.06]'
        : 'bg-[#F2EFE8] border border-[#0A0B10]/10'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4" />
        <h3 className="font-medium text-sm">{t('filters') || 'Filters'}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select value={selectedProperty} onChange={(e) => onPropertyChange(e.target.value)} className={filterClass}>
          <option value="">{t('allProperties') || 'All Properties'}</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedCity} onChange={(e) => onCityChange(e.target.value)} className={filterClass}>
          <option value="">{t('allCities') || 'All Cities'}</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedPlatform} onChange={(e) => onPlatformChange(e.target.value)} className={filterClass}>
          <option value="">{t('allPlatforms') || 'All Platforms'}</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={selectedType} onChange={(e) => onTypeChange(e.target.value)} className={filterClass}>
          <option value="">{t('allTypes') || 'All Types'}</option>
          {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
        </select>
      </div>
    </div>
  );
}