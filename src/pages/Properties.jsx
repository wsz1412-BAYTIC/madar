import React, { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Plus, Loader2, X, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';
import PropertyCardWithSelection from '@/components/madar/PropertyCardWithSelection';
import BulkActionsToolbar from '@/components/madar/BulkActionsToolbar';
import { StatusChangeModal, AddLabelsModal, ArchiveConfirmModal, ActionResultsModal } from '@/components/madar/BulkActionModals';
import FloorplanVisualizer from '@/components/madar/FloorplanVisualizer';
import PropertiesFilter from '@/components/madar/PropertiesFilter';

const mockProperties = [
  { id: 1, name: 'Luxury Villa', nameAr: 'فيلا فاخرة', city: 'Riyadh', cityAr: 'الرياض', bedrooms: 4, bathrooms: 3, guests: 8, price: 850, status: 'active', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop', occupancy: 0.85, tags: ['premium', 'family-friendly'] },
  { id: 2, name: 'Modern Studio', nameAr: 'استوديو عصري', city: 'Jeddah', cityAr: 'جدة', bedrooms: 1, bathrooms: 1, guests: 2, price: 320, status: 'active', platform: 'Gatherin', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop', occupancy: 0.35, tags: ['budget-friendly'] },
  { id: 3, name: 'Family Home', nameAr: 'منزل عائلي', city: 'KAEC', cityAr: 'كاوست', bedrooms: 3, bathrooms: 2, guests: 6, price: 600, status: 'active', platform: 'Booking.com', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop', occupancy: 0.65, tags: ['family-friendly', 'corporate'] },
  { id: 4, name: 'Penthouse Suite', nameAr: 'جناح بنتهاوس', city: 'Dammam', cityAr: 'الدمام', bedrooms: 2, bathrooms: 2, guests: 4, price: 720, status: 'paused', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop', occupancy: 0.55, tags: ['business', 'luxury'] },
];

export default function Properties() {
  const { t, lang } = useLang();
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ cities: [], tags: [], performance: [] });

  // Bulk Management State
  const [selectedProps, setSelectedProps] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResults, setActionResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsTitle, setResultsTitle] = useState('');
  const [resultsDescription, setResultsDescription] = useState('');
  const [isResultsSuccess, setIsResultsSuccess] = useState(true);

  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Apply filters
  const filteredProperties = useMemo(() => {
    return mockProperties.filter(prop => {
      // City filter
      if (selectedFilters.cities?.length > 0 && !selectedFilters.cities.includes(prop.city)) {
        return false;
      }

      // Tags filter
      if (selectedFilters.tags?.length > 0) {
        const hasTag = selectedFilters.tags.some(tag => prop.tags?.includes(tag));
        if (!hasTag) return false;
      }

      // Performance filter
      if (selectedFilters.performance?.length > 0) {
        const occupancy = prop.occupancy || 0;
        const price = prop.price || 0;
        const matchesPerf = selectedFilters.performance.some(perf => {
          if (perf === 'high-occupancy' && occupancy > 0.7) return true;
          if (perf === 'medium-occupancy' && occupancy >= 0.4 && occupancy <= 0.7) return true;
          if (perf === 'low-occupancy' && occupancy < 0.4) return true;
          if (perf === 'high-price' && price > 600) return true;
          if (perf === 'medium-price' && price >= 300 && price <= 600) return true;
          if (perf === 'low-price' && price < 300) return true;
          return false;
        });
        if (!matchesPerf) return false;
      }

      return true;
    });
  }, [selectedFilters]);

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/properties/import', { url: importUrl });
      setShowImport(false);
      setImportUrl('');
    } catch { }
    setImporting(false);
  };

  // Selection Handlers
  const togglePropertySelection = (propId) => {
    const newSelected = new Set(selectedProps);
    if (newSelected.has(propId)) {
      newSelected.delete(propId);
    } else {
      newSelected.add(propId);
    }
    setSelectedProps(newSelected);
  };

  const selectAllProperties = () => {
    setSelectedProps(new Set(mockProperties.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedProps(new Set());
  };

  // Bulk Action Handlers
  const handleExport = async () => {
    setActionLoading(true);
    try {
      const selected = mockProperties.filter(p => selectedProps.has(p.id));
      const csvContent = [
        ['ID', 'Name', 'City', 'Bedrooms', 'Bathrooms', 'Guests', 'Price', 'Status', 'Platform'].join(','),
        ...selected.map(p => [p.id, p.name, p.city, p.bedrooms, p.bathrooms, p.guests, p.price, p.status, p.platform].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `properties_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();

      setResultsTitle(lang === 'ar' ? 'تم التصدير بنجاح' : 'Export Successful');
      setResultsDescription(`${selected.length} ${lang === 'ar' ? 'عقار تم تصديره' : 'properties exported'}`);
      setIsResultsSuccess(true);
      setActionResults([{
        name: lang === 'ar' ? 'تصدير البيانات' : 'Data Export',
        message: `${selected.length} ${lang === 'ar' ? 'عقار' : 'properties'}`,
        success: true
      }]);
      setShowResultsModal(true);
      clearSelection();
    } catch (error) {
      setResultsTitle(lang === 'ar' ? 'فشل التصدير' : 'Export Failed');
      setIsResultsSuccess(false);
      setActionResults([{ name: 'Export', message: error.message, success: false }]);
      setShowResultsModal(true);
    }
    setActionLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const results = [];
      for (const propId of selectedProps) {
        const prop = mockProperties.find(p => p.id === propId);
        results.push({
          name: prop.name,
          message: `${lang === 'ar' ? 'تم تحديث الحالة إلى' : 'Status updated to'} ${newStatus}`,
          success: true
        });
      }

      setResultsTitle(lang === 'ar' ? 'تم تحديث الحالة' : 'Status Updated');
      setIsResultsSuccess(true);
      setActionResults(results);
      setShowResultsModal(true);
      clearSelection();
      setShowStatusModal(false);
    } catch (error) {
      setResultsTitle(lang === 'ar' ? 'خطأ في التحديث' : 'Update Failed');
      setIsResultsSuccess(false);
      setActionResults([{ name: 'Status Update', message: error.message, success: false }]);
      setShowResultsModal(true);
    }
    setActionLoading(false);
  };

  const handleAddLabels = async (labels) => {
    setActionLoading(true);
    try {
      const results = [];
      for (const propId of selectedProps) {
        const prop = mockProperties.find(p => p.id === propId);
        results.push({
          name: prop.name,
          message: `${lang === 'ar' ? 'تم إضافة التسميات:' : 'Added labels:'} ${labels.join(', ')}`,
          success: true
        });
      }

      setResultsTitle(lang === 'ar' ? 'تم إضافة التسميات' : 'Labels Added');
      setIsResultsSuccess(true);
      setActionResults(results);
      setShowResultsModal(true);
      clearSelection();
      setShowLabelsModal(false);
    } catch (error) {
      setResultsTitle(lang === 'ar' ? 'خطأ في الإضافة' : 'Add Failed');
      setIsResultsSuccess(false);
      setActionResults([{ name: 'Add Labels', message: error.message, success: false }]);
      setShowResultsModal(true);
    }
    setActionLoading(false);
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const results = [];
      for (const propId of selectedProps) {
        const prop = mockProperties.find(p => p.id === propId);
        results.push({
          name: prop.name,
          message: lang === 'ar' ? 'تم الأرشفة' : 'Archived',
          success: true
        });
      }

      setResultsTitle(lang === 'ar' ? 'تم أرشفة العقارات' : 'Properties Archived');
      setIsResultsSuccess(true);
      setActionResults(results);
      setShowResultsModal(true);
      clearSelection();
      setShowArchiveModal(false);
    } catch (error) {
      setResultsTitle(lang === 'ar' ? 'خطأ في الأرشفة' : 'Archive Failed');
      setIsResultsSuccess(false);
      setActionResults([{ name: 'Archive', message: error.message, success: false }]);
      setShowResultsModal(true);
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F7F5F0]">{t('myProperties')}</h1>
            <p className="text-sm text-[#F7F5F0]/40 mt-1">{mockProperties.length} {lang === 'ar' ? 'عقار' : 'properties'}</p>
          </div>
          <button onClick={() => setShowImport(true)} className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all overflow-hidden">
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t('addProperty')}</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      </FadeIn>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-[#F7F5F0]">{t('importListing')}</h2>
                <button onClick={() => setShowImport(false)} className="p-1 hover:bg-white/5 rounded-lg"><X className="w-4 h-4 text-[#F7F5F0]/40" /></button>
              </div>
              <p className="text-sm text-[#F7F5F0]/40 mb-4">{t('pasteUrl')}</p>
              <form onSubmit={handleImport} className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F7F5F0]/25" />
                  <input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://airbnb.com/rooms/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F7F5F0] placeholder-[#F7F5F0]/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50"
                    required
                  />
                </div>
                <button type="submit" disabled={importing} className="w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('importing')}</> : t('import')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floorplan Visualizer */}
      <FadeIn delay={0.1}>
        <FloorplanVisualizer />
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <PropertiesFilter
          properties={mockProperties}
          selectedFilters={selectedFilters}
          onFilter={setSelectedFilters}
        />
      </FadeIn>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedProps.size}
        totalCount={filteredProperties.length}
        onSelectAll={() => setSelectedProps(new Set(filteredProperties.map(p => p.id)))}
        onClearSelection={clearSelection}
        onExport={handleExport}
        onChangeStatus={() => setShowStatusModal(true)}
        onAddLabels={() => setShowLabelsModal(true)}
        onArchive={() => setShowArchiveModal(true)}
        isLoading={actionLoading}
        allSelected={selectedProps.size === filteredProperties.length}
      />

      {/* Properties Grid */}
      <div>
        {filteredProperties.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop, i) => (
              <PropertyCardWithSelection
                key={prop.id}
                prop={prop}
                index={i}
                isSelected={selectedProps.has(prop.id)}
                onSelect={() => togglePropertySelection(prop.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#F7F5F0]/60 text-sm">
              {lang === 'ar' ? 'لا توجد عقارات تطابق التصفيات المختارة' : 'No properties match the selected filters'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
        isLoading={actionLoading}
        selectedCount={selectedProps.size}
      />

      <AddLabelsModal
        isOpen={showLabelsModal}
        onClose={() => setShowLabelsModal(false)}
        onConfirm={handleAddLabels}
        isLoading={actionLoading}
        selectedCount={selectedProps.size}
      />

      <ArchiveConfirmModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
        isLoading={actionLoading}
        selectedCount={selectedProps.size}
      />

      <ActionResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={actionResults}
        isSuccess={isResultsSuccess}
        title={resultsTitle}
        description={resultsDescription}
      />
    </div>
  );
}