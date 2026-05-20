import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import HighPriorityListings from "../components/home/HighPriorityListings";
import NeighborhoodExpertise from "../components/home/NeighborhoodExpertise";
import ServicesOverview from "../components/home/ServicesOverview";
import AgentHighlights from "../components/home/AgentHighlights";
import ClientStories from "../components/home/ClientStories";


export default function Home() {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, a, t] = await Promise.all([
      base44.entities.Property.filter({ is_high_priority: true }, "-created_date", 6),
      base44.entities.Agent.filter({ is_featured: true }, "-created_date", 3),
      base44.entities.Testimonial.list("-created_date", 5)]
      );
      setProperties(p);
      setAgents(a);
      setTestimonials(t);
      setLoading(false);
    };
    load();
  }, []);

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>);

  }

  return (
    <div>
      <HeroSection heroImage="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/afe81cf6b_Base44Templates_Gemini3NanoBananaPro_2026-05-19_14-55-54.png" />
      <HighPriorityListings properties={properties} />
      <div className="hairline max-w-[1400px] mx-auto" />
      <NeighborhoodExpertise />
      <ServicesOverview />
      <div className="hairline max-w-[1400px] mx-auto" />
      <AgentHighlights agents={agents} />
      <section className="w-full h-[500px] md:h-[600px] overflow-hidden relative">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0 w-full h-[130%] top-[-15%]"
          style={{ y: parallaxY }}
        >
          <img
            src="https://media.base44.com/images/public/69db45a7fc9eedd006e6060b/20f7e06fd_generated_image.png"
            alt="Modern kitchen design"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
      <ClientStories testimonials={testimonials} />
    </div>);

}