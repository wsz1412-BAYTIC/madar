import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { madarApi } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "../components/PropertyCard";
import FeaturedCard from "../components/FeaturedCard";
import { ArrowUp, Plus, X, Link2, Loader2, Check, Building2 } from "lucide-react";

function AddPropertyModal({ open, onClose, onSaved }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [extraUrls, setExtraUrls] = useState([]);
  const [extraUrlInput, setExtraUrlInput] = useState("");

  const handlePreview = async () => {
    if (!url.trim()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await madarApi.previewProperty(url.trim());
      setPreview(data);
    } catch (err) {
      toast({ title: err.message || t("common.error"), variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  const handleAddExtraUrl = () => {
    if (!extraUrlInput.trim()) return;
    setExtraUrls((prev) => [...prev, extraUrlInput.trim()]);
    setExtraUrlInput("");
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const payload = {
        ...preview,
        platform_urls: [url, ...extraUrls],
      };
      await madarApi.createProperty(payload);
      toast({ title: t("common.save") });
      onSaved();
      handleClose();
    } catch (err) {
      toast({ title: err.message || t("common.error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setPreview(null);
    setExtraUrls([]);
    setExtraUrlInput("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="bg-background border border-border/50 w-full max-w-lg my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-display text-xl font-light">{t("properties.addTitle")}</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* URL input */}
              <div>
                <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                  {t("properties.urlLabel")}
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 border border-border/50 px-3">
                    <Link2 size={16} className="text-muted-foreground flex-shrink-0" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t("properties.urlPlaceholder")}
                      disabled={previewing || !!preview}
                      className="flex-1 bg-transparent py-3 font-body text-sm focus:outline-none disabled:opacity-50"
                      dir="ltr"
                    />
                  </div>
                  {!preview && (
                    <button
                      onClick={handlePreview}
                      disabled={previewing || !url.trim()}
                      className="ghost-btn text-xs whitespace-nowrap disabled:opacity-50"
                    >
                      {previewing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          {t("properties.previewing")}
                        </span>
                      ) : (
                        t("properties.preview")
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview results */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border/50 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Check size={16} />
                    <span className="font-body text-xs tracking-label uppercase">Imported</span>
                  </div>
                  {preview.title && (
                    <p className="font-display text-lg font-light">{preview.title}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 font-body text-sm text-muted-foreground">
                    {preview.bedrooms != null && (
                      <span>{t("properties.bedrooms")}: {preview.bedrooms}</span>
                    )}
                    {preview.guests != null && (
                      <span>{t("properties.guests")}: {preview.guests}</span>
                    )}
                    {preview.price != null && (
                      <span>{t("properties.price")}: {preview.price} {t("common.sar")}</span>
                    )}
                    {preview.rating != null && (
                      <span>{t("properties.rating")}: {preview.rating}</span>
                    )}
                    {preview.city && <span>{preview.city}</span>}
                  </div>
                  {preview.amenities && preview.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {preview.amenities.slice(0, 6).map((a, i) => (
                        <span key={i} className="font-body text-xs px-2 py-1 border border-border/50 text-muted-foreground">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Extra platform URLs */}
              {preview && (
                <div>
                  <label className="block font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
                    {t("properties.addAnotherUrl")}
                  </label>
                  {extraUrls.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {extraUrls.map((u, i) => (
                        <div key={i} className="flex items-center justify-between border border-border/50 px-3 py-2">
                          <span className="font-body text-xs text-muted-foreground truncate flex-1" dir="ltr">{u}</span>
                          <button
                            onClick={() => setExtraUrls((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-foreground ml-2"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={extraUrlInput}
                      onChange={(e) => setExtraUrlInput(e.target.value)}
                      placeholder={t("properties.urlPlaceholder")}
                      className="flex-1 bg-transparent border border-border/50 px-3 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                      dir="ltr"
                    />
                    <button
                      onClick={handleAddExtraUrl}
                      disabled={!extraUrlInput.trim()}
                      className="ghost-btn text-xs whitespace-nowrap disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {preview && (
              <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                <button onClick={handleClose} className="ghost-btn text-xs">
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="ghost-btn text-xs disabled:opacity-50 bg-foreground text-background border-foreground hover:bg-foreground/80"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      {t("common.save")}
                    </span>
                  ) : (
                    t("properties.save")
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PropertySearch() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await madarApi.getProperties();
      setProperties(Array.isArray(data) ? data : data?.properties || []);
    } catch (err) {
      toast({ title: err.message || t("common.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return properties;
    const q = search.toLowerCase();
    return properties.filter((p) =>
      `${p.title || ""} ${p.city || ""} ${p.neighborhood || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [properties, search]);

  return (
    <>
      <div className="pt-32 pb-24 px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <h1 className="font-display text-display-lg font-light mt-3">
            {t("properties.title")}
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="ghost-btn text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            {t("properties.add")}
          </button>
        </motion.div>

        {/* Search bar */}
        <div className="mb-12">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("properties.searchPlaceholder")}
            className="w-full bg-transparent border-b border-border py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Building2 size={32} className="text-muted-foreground mx-auto mb-6" strokeWidth={1} />
            <p className="font-display text-display-sm font-light text-muted-foreground">
              {t("properties.noResults")}
            </p>
            <p className="font-body text-sm text-muted-foreground mt-3">
              {t("properties.noResultsHint")}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="ghost-btn inline-block mt-8 text-xs"
            >
              {t("properties.add")}
            </button>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <FeaturedCard property={filtered[0]} />

            {filtered.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filtered.slice(1).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddPropertyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadProperties}
      />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="lg:hidden fixed bottom-8 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} className="text-foreground" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}