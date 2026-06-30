import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { madarApi } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import HeroSection from "../components/home/HeroSection";
import HighPriorityListings from "../components/home/HighPriorityListings";
import NeighborhoodExpertise from "../components/home/NeighborhoodExpertise";
import ServicesOverview from "../components/home/ServicesOverview";

export default function Home() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await madarApi.getLatestBriefs();
        setBriefs(Array.isArray(data) ? data : data?.briefs || []);
      } catch {
        setBriefs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        heroImage="https://media.base44.com/videos/public/6a0c3ea982f98940623f21f5/a0e02d2b4_Video_Back.mp4"
        briefs={briefs}
      />
      <HighPriorityListings briefs={briefs} />
      <div className="hairline max-w-[1400px] mx-auto" />
      <NeighborhoodExpertise />
      <ServicesOverview />
      <section className="w-full h-[280px] md:h-[600px] overflow-hidden relative">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0 w-full h-[140%] top-[-20%]"
          style={{ y: parallaxY }}
        >
          <img
            src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/6dda216cf_Base44_Templates_Gemini_3__Nano_Banana_Pro__2026-05-19_14-53-44.jpg"
            alt="Saudi Arabia skyline"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
    </div>
  );
}