import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const locations = ["Any Location", "Pacific Heights", "Marina District", "Nob Hill", "Sea Cliff", "Russian Hill", "Presidio Heights"];
const types = ["Any Type", "Penthouse", "Waterfront", "Modernist", "Estate", "Townhouse", "Condo"];
const priceRanges = ["Any Price", "Under $2M", "$2M – $5M", "$5M – $10M", "$10M+"];

function SearchDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors border-b border-white/30 pb-1"
      >
        <span className="font-display text-lg md:text-xl italic">{value || label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white/60 backdrop-blur-xl border border-border shadow-lg min-w-[200px] z-10 rounded">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="block w-full text-left px-4 py-3 font-body text-sm text-foreground hover:bg-accent/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSection({ heroImage }) {
  const navigate = useNavigate();
  const [loc, setLoc] = useState("Any Location");
  const [type, setType] = useState("Any Type");
  const [price, setPrice] = useState("Any Price");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (loc !== "Any Location") params.set("location", loc);
    if (type !== "Any Type") params.set("type", type);
    if (price !== "Any Price") params.set("price", price);
    navigate(`/properties?${params.toString()}`);
  };

  const scrollToListings = () => {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center pb-16 md:pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="font-display text-display-xl text-white font-light mb-8 max-w-4xl leading-[0.8]">
            Welcome to Your<br />
            <span className="italic">Next Home</span>
          </h1>

          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex flex-wrap items-center gap-2 md:gap-3 text-white font-body text-sm bg-black/20 backdrop-blur-md px-6 py-3 rounded-full">
              <span className="text-white">I am looking for a</span>
              <SearchDropdown label="Type" options={types} value={type} onChange={setType} />
              <span className="text-white">in</span>
              <SearchDropdown label="Location" options={locations} value={loc} onChange={setLoc} />
              <span className="text-white">at the price of</span>
              <SearchDropdown label="Price" options={priceRanges} value={price} onChange={setPrice} />
            </div>

            <button onClick={handleSearch} className="ghost-btn-light">
              Search Properties
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}