import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { mapUserProperty } from "@/lib/entityMappers";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "../components/PropertyCard";
import FeaturedCard from "../components/FeaturedCard";
import AddPropertyWizard from "@/components/AddPropertyWizard";
import { ArrowUp, Plus, Building2 } from "lucide-react";

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
      const entities = await base44.entities.UserProperty.list();
      setProperties((entities || []).map(mapUserProperty));
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

      <AddPropertyWizard
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadProperties}
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