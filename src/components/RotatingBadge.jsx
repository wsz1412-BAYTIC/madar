import { motion } from "framer-motion";

const REPEAT = "NEW LISTING   •   ";
const fullText = REPEAT.repeat(2);

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
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text style={{ fontSize: "9.5px", fontFamily: "var(--font-body)", fill: "hsl(0, 0%, 10%)", fontWeight: 500 }}>
          <textPath href="#circlePath" startOffset="0%">
            {fullText}
          </textPath>
        </text>
      </motion.svg>
    </div>
  );
}