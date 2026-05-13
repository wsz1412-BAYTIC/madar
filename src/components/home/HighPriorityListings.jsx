import { motion } from "framer-motion";
import PropertyCard from "../PropertyCard";
import { Link } from "react-router-dom";

export default function HighPriorityListings({ properties }) {
  if (!properties || properties.length === 0) return null;

  return (
    <section id="listings" className="py-24 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="font-display text-display-lg font-light mt-3">
            Featured Properties
          </h2>
        </div>
        <Link
          to="/properties"
          className="hidden md:block font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {properties.slice(0, 4).map((property, i) => (
          <div key={property.id} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
            <PropertyCard property={property} size={i === 0 ? "large" : "default"} />
          </div>
        ))}
      </div>

      <div className="mt-12 md:hidden text-center">
        <Link to="/properties" className="ghost-btn inline-block">
          View All Properties
        </Link>
      </div>
    </section>
  );
}