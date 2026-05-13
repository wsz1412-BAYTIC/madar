import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters, { priceRanges } from "../components/PropertyFilters";

import { motion } from "framer-motion";

export default function PropertySearch() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const initType = urlParams.get("type") || "All Types";
  const initLocation = urlParams.get("location") || "All Locations";
  const initPrice = urlParams.get("price") || "Any Price";

  const [filters, setFilters] = useState({
    type: initType,
    price: initPrice,
    beds: "Any Beds",
    location: initLocation,
    search: "",
  });

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Property.list("-created_date", 50);
      setProperties(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.type !== "All Types" && p.property_type !== filters.type) return false;
      if (filters.location !== "All Locations" && p.neighborhood !== filters.location && p.city !== filters.location) return false;
      
      if (filters.price !== "Any Price") {
        const range = priceRanges.find((r) => r.label === filters.price);
        if (range && (p.price < range.min || p.price >= range.max)) return false;
      }
      
      if (filters.beds !== "Any Beds") {
        const minBeds = parseInt(filters.beds);
        if (p.bedrooms < minBeds) return false;
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = `${p.title} ${p.city} ${p.neighborhood} ${p.address} ${p.property_type}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [properties, filters]);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-display-lg font-light mt-3 mb-12">
          The <span className="italic">Collection</span>
        </h1>
      </motion.div>

      <PropertyFilters filters={filters} onChange={setFilters} total={filtered.length} />

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-display-sm font-light text-muted-foreground">No properties match your criteria</p>
          <p className="font-body text-sm text-muted-foreground mt-3">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12">
          {filtered.map((property, i) => (
            <div key={property.id} className={i % 5 === 0 ? "md:col-span-2" : ""}>
              <PropertyCard property={property} size={i % 5 === 0 ? "large" : "default"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}