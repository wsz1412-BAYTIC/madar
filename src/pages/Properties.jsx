import React, { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { parseListingUrl, IMPORT_UNAVAILABLE } from '@/lib/listingImport';
import { Plus, X, Link2, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/madar/Motion';
import PropertyCardWithSelection from '@/components/madar/PropertyCardWithSelection';
import BulkActionsToolbar from '@/components/madar/BulkActionsToolbar';
import { StatusChangeModal, AddLabelsModal, ArchiveConfirmModal, ActionResultsModal } from '@/components/madar/BulkActionModals';
import FloorplanVisualizer from '@/components/madar/FloorplanVisualizer';
import PropertiesFilter from '@/components/madar/PropertiesFilter';
import AddPropertyWizard from '@/components/madar/AddPropertyWizard';

const mockProperties = [
  { id: 1, name: 'Luxury Villa', nameAr: 'فيلا فاخرة', city: 'Riyadh', cityAr: 'الرياض', bedrooms: 4, bathrooms: 3, guests: 8, price: 850, status: 'active', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop', occupancy: 0.85, tags: ['premium', 'family-friendly'] },
  { id: 2, name: 'Modern Studio', nameAr: 'استوديو عصري', city: 'Jeddah', cityAr: 'جدة', bedrooms: 1, bathrooms: 1, guests: 2, price: 320, status: 'active', platform: 'Gatherin', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop', occupancy: 0.35, tags: ['budget-friendly'] },
  { id: 3, name: 'Family Home', nameAr: 'منزل عائلي', city: 'KAEC', cityAr: 'كاوست', bedrooms: 3, bathrooms: 2, guests: 6, price: 600, status: 'active', platform: 'Booking.com', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop', occupancy: 0.65, tags: ['family-friendly', 'corporate'] },
  { id: 4, name: 'Penthouse Suite', nameAr: 'جناح بنتهاوس', city: 'Dammam', cityAr: 'الدمام', bedrooms: 2, bathrooms: 2, guests: 4, price: 720, status: 'paused', platform: 'Airbnb', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop', occupancy: 0.55, tags: ['business', 'luxury'] },
];

export default function Properties() {
  const { t, lang } = useLang();
  const [showWizard, setShowWizard] = useState(false);
  const [showImport, setShowImport] = useState(false);
  // Properties created through the wizard in this session (real entity rows),
  // shown ahead of the demo data.
  const [myProperties, setMyProperties] = useState([]);
  const [importUrl, setImportUrl] = useState('');
  // Local preview result: {valid, platform, url} | {valid:false, error} | null
  const [importPreview, setImportPreview] = useState(null);
  const [wizardInitial, setWizardInitial] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ cities: [], tags: [], performance: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

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

  const allProperties = useMemo(() => [...myProperties, ...mockProperties], [myProperties]);

  // Apply filters
  const filteredProperties = useMemo(() => {
    const list = allProperties.filter(prop => {
      if (statusFilter !== 'all' && prop.status !== statusFilter) return false;
      return true;
    }).filter(prop => {
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

    const sorters = {
      'price-desc': (a, b) => b.price - a.price,
      'price-asc': (a, b) => a.price - b.price,
      'occupancy-desc': (a, b) => (b.occupancy || 0) - (a.occupancy || 0),
      'occupancy-asc': (a, b) => (a.occupancy || 0) - (b.occupancy || 0),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
    };
    return sorters[sortBy] ? [...list].sort(sorters[sortBy]) : list;
  }, [allProperties, selectedFilters, statusFilter, sortBy]);

  // Preview validates the pasted link locally — the legacy POST
  // /properties/import endpoint never existed (it returned a raw 405
  // "Method Not Allowed"), and there is no scraping backend yet. Instead of
  // failing, we detect the platform, say so honestly, and hand off to the
  // manual wizard with platform + URL prefilled.
  const handlePreview = (e) => {
    e.preventDefault();
    setImportPreview(parseListingUrl(importUrl));
  };

  const continueManually = () => {
    if (!importPreview?.valid) return;
    setWizardInitial({ platform: importPreview.platform, platformUrl: importPreview.url });
    setShowImport(false);
    setImportPreview(null);
    setImportUrl('');
    setShowWizard(true);
  };

  const closeImport = () => {
    setShowImport(false);
    setImportPreview(null);
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
    setSelectedProps(new Set(allProperties.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedProps(new Set());
  };

  // Bulk Action Handlers
  const handleExport = async () => {
    setActionLoading(true);
    try {
      const selected = allProperties.filter(p => selectedProps.has(p.id));
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
        const prop = allProperties.find(p => p.id === propId);
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
        const prop = allProperties.find(p => p.id === propId);
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
        const prop = allProperties.find(p => p.id === propId);
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
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('myProperties')}</h1>
            <p className="text-sm text-foreground/40 mt-1">{allProperties.length} {lang === 'ar' ? 'عقار' : 'properties'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} title={lang === 'ar' ? 'استيراد عبر رابط' : 'Import via link'} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-all">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'استيراد' : 'Import'}</span>
            </button>
            <button onClick={() => setShowWizard(true)} className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#D95F3B]/30 transition-all overflow-hidden">
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t('addProperty')}</span>
              <div className="absolute inset-0 bg-foreground/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </div>
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
            onClick={closeImport}
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
                <h2 className="font-heading font-semibold text-foreground">{t('importListing')}</h2>
                <button onClick={closeImport} aria-label={lang === 'ar' ? 'إغلاق' : 'Close'} className="p-1 hover:bg-foreground/5 rounded-lg"><X className="w-4 h-4 text-foreground/40" /></button>
              </div>
              <p className="text-sm text-foreground/40 mb-4">{t('pasteUrl')}</p>
              <form onSubmit={handlePreview} className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-foreground/25" />
                  <input
                    value={importUrl}
                    onChange={e => { setImportUrl(e.target.value); setImportPreview(null); }}
                    placeholder="https://ar.airbnb.com/rooms/1573422907379"
                    dir="ltr"
                    className={`w-full ps-10 pe-4 py-3 rounded-xl bg-foreground/[0.04] border text-sm text-foreground placeholder-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/20 focus:border-[#D95F3B]/50 ${importPreview && !importPreview.valid ? 'border-danger/60' : 'border-foreground/[0.08]'}`}
                    required
                  />
                </div>

                {importPreview && !importPreview.valid && (
                  <p className="text-xs text-danger">{lang === 'ar' ? importPreview.error.ar : importPreview.error.en}</p>
                )}

                {importPreview?.valid ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-success/15 text-success">
                        {importPreview.platform}
                      </span>
                      <span className="text-xs text-foreground/45 truncate" dir="ltr">{importPreview.url}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/25">
                      <Info className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground/70">
                        {lang === 'ar' ? IMPORT_UNAVAILABLE.ar : IMPORT_UNAVAILABLE.en}
                      </p>
                    </div>
                    <button type="button" onClick={continueManually} className="w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2">
                      {lang === 'ar' ? 'المتابعة يدويًا' : 'Continue manually'}
                      {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2">
                    {lang === 'ar' ? 'معاينة' : 'Preview'}
                  </button>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-step Add Property wizard (creates a real UserProperty row) */}
      <AddPropertyWizard
        open={showWizard}
        initial={wizardInitial}
        onClose={() => { setShowWizard(false); setWizardInitial(null); }}
        onCreated={(created) => {
          // Map the entity row onto the card display shape and show it first.
          setMyProperties(prev => [{
            id: created.id || `local-${Date.now()}`,
            name: created.name,
            nameAr: created.name,
            city: created.city,
            cityAr: created.city,
            district: created.district,
            bedrooms: created.bedrooms,
            bathrooms: created.bathrooms,
            guests: created.guests,
            price: created.nightlyPrice,
            status: created.status,
            platform: created.platform,
            image: created.images?.[0] || null,
            occupancy: 0,
            tags: [],
          }, ...prev]);
        }}
      />

      {/* Floorplan Visualizer */}
      <FadeIn delay={0.1}>
        <FloorplanVisualizer />
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <PropertiesFilter
          properties={allProperties}
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

      {/* Status + sort controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2" role="group" aria-label={lang === 'ar' ? 'تصفية حسب الحالة' : 'Filter by status'}>
          {[
            { key: 'all', en: 'All', ar: 'الكل' },
            { key: 'active', en: 'Active', ar: 'نشط' },
            { key: 'paused', en: 'Paused', ar: 'متوقف' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              aria-pressed={statusFilter === s.key}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.key
                  ? 'bg-gradient-to-r from-[#D95F3B] to-[#C8972A] text-white border-transparent shadow-sm'
                  : 'bg-foreground/[0.03] text-foreground/60 border-foreground/[0.08] hover:text-foreground hover:border-foreground/20'
              }`}
            >
              {lang === 'ar' ? s.ar : s.en}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-foreground/50">
          <span>{lang === 'ar' ? 'ترتيب حسب' : 'Sort by'}</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface border border-foreground/[0.1] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#D95F3B]/30"
          >
            <option value="default">{lang === 'ar' ? 'الافتراضي' : 'Default'}</option>
            <option value="price-desc">{lang === 'ar' ? 'السعر: الأعلى أولاً' : 'Price: high → low'}</option>
            <option value="price-asc">{lang === 'ar' ? 'السعر: الأدنى أولاً' : 'Price: low → high'}</option>
            <option value="occupancy-desc">{lang === 'ar' ? 'الإشغال: الأعلى أولاً' : 'Occupancy: high → low'}</option>
            <option value="occupancy-asc">{lang === 'ar' ? 'الإشغال: الأدنى أولاً' : 'Occupancy: low → high'}</option>
            <option value="name">{lang === 'ar' ? 'الاسم' : 'Name'}</option>
          </select>
        </label>
      </div>

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
            <p className="text-foreground/60 text-sm">
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