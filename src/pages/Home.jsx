import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import HighPriorityListings from "../components/home/HighPriorityListings";
import NeighborhoodExpertise from "../components/home/NeighborhoodExpertise";
import ServicesOverview from "../components/home/ServicesOverview";
import AgentHighlights from "../components/home/AgentHighlights";
import ClientStories from "../components/home/ClientStories";
import MarketInsights from "../components/home/MarketInsights";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, a, t, b] = await Promise.all([
        base44.entities.Property.filter({ is_high_priority: true }, "-created_date", 6),
        base44.entities.Agent.filter({ is_featured: true }, "-created_date", 3),
        base44.entities.Testimonial.list("-created_date", 5),
        base44.entities.BlogPost.list("-created_date", 3),
      ]);
      setProperties(p);
      setAgents(a);
      setTestimonials(t);
      setPosts(b);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <HeroSection heroImage="https://media.base44.com/images/public/69db45a7fc9eedd006e6060b/aedf3beaf_generated_8932e4c7.png" />
      <HighPriorityListings properties={properties} />
      <div className="hairline max-w-[1400px] mx-auto" />
      <NeighborhoodExpertise />
      <ServicesOverview />
      <div className="hairline max-w-[1400px] mx-auto" />
      <AgentHighlights agents={agents} />
      <ClientStories testimonials={testimonials} />
      <div className="hairline max-w-[1400px] mx-auto" />
      <MarketInsights posts={posts} />
    </div>
  );
}