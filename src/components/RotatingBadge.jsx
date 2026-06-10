import { motion } from "framer-motion";

export default function RotatingBadge({ text = "NEW LISTING • NEW LISTING • NEW LISTING • " }) {
  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-4 w-20 h-20 md:w-28 md:h-28 pointer-events-none z-10">
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <path
          id="circlePath"
          d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="none"
        />
        <text style={{ fontSize: "10.5px", fontFamily: "var(--font-body)", letterSpacing: "0.18em", fill: "white", fontWeight: 500, textTransform: "uppercase" }}>
          <textPath href="#circlePath" startOffset="0%">
            {text}
          </textPath>
        </text>
        {/* Center dot */}
        <circle cx="50" cy="50" r="5" fill="white" opacity="0.9" />
      </motion.svg>
    </div>
  );
}