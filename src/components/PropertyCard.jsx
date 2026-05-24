import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const rotateAnimation = {
  animate: { rotate: 360 },
  transition: { duration: 20, repeat: Infinity, ease: "linear" }
};

export default function PropertyCard({ property, size = "default" }) {
  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  const isLarge = size === "large";

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}>
        
        <div className={`relative overflow-hidden ${isLarge ? "aspect-[3/2] md:aspect-[16/9]" : "aspect-[4/3]"}`}>
          <img
            src={property.featured_image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
          
          {property.neighborhood === "Marina District" && property.property_type === "Waterfront" &&
          <motion.img src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/2d94e6f62_Badge_3.svg"

          alt="Badge"
          className="absolute top-2 right-2 w-16 h-16 md:top-4 md:right-4 md:w-24 md:h-24"
          style={{ filter: "contrast(1.1)" }}
          {...rotateAnimation} />

          }
          {isLarge &&
          <motion.img
            src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/601dd92f6_Badge_2.svg"
            alt="Badge"
            className="absolute top-3 right-3 w-[67px] h-[67px] md:top-6 md:right-6 md:w-32 md:h-32"
            {...rotateAnimation} />

          }
          {/* Gradient glass overlay — appears on hover, fades from black/60 at bottom to transparent */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)", backdropFilter: "blur(0px)" }} />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700 ease-out">
            <div className="flex items-end justify-between text-white">
              <span className="font-display text-2xl font-light">{formatPrice(property.price)}</span>
              <span className="font-body text-xs tracking-label uppercase">{property.sqft?.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-6">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {property.neighborhood || property.city} · {property.property_type}
          </p>
          <h3 className={`font-display font-light ${isLarge ? "text-display-sm" : "text-xl md:text-2xl"}`}>
            {property.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
            <span>{property.bedrooms} Bed</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{property.bathrooms} Bath</span>
            {property.garage > 0 &&
            <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{property.garage} Garage</span>
              </>
            }
          </div>
        </div>
      </motion.div>
    </Link>);

}