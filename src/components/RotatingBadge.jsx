import { motion } from "framer-motion";

export default function RotatingBadge() {
  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-4 w-20 h-20 md:w-28 md:h-28 pointer-events-none z-10">
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="50" r="50" fill="#FFFFA3" />
        <defs>
          <path
            id="circlePath"
            d="M 50,50 m -33,0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0"
          />
        </defs>
        <text style={{ fontSize: "9px", fontFamily: "var(--font-body)", fill: "hsl(0, 0%, 10%)", fontWeight: 500, letterSpacing: "2.8px" }}>
          <textPath href="#circlePath">
            NEW LISTING · NEW LISTING · 
          </textPath>
        </text>
      </motion.svg>
    </div>
  );
}