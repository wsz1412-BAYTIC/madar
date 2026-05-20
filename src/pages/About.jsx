import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

import InquiryForm from "../components/InquiryForm";
import { Award, Users, MapPin, Heart } from "lucide-react";

export default function About() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Agent.list("-created_date", 20);
      setAgents(data);
      setLoading(false);
    };
    load();
  }, []);

  const credentials = [
    { icon: Award, label: "Luxury Collection Specialist", year: "Since 2008" },
    { icon: Award, label: "Top 1% Nationwide", year: "2019 – Present" },
    { icon: Award, label: "Best Real Estate Agency", year: "City Awards 2023" },
    { icon: Award, label: "Diamond Circle of Excellence", year: "2020 – Present" },
  ];

  const impacts = [
    { icon: Heart, title: "Habitat for Humanity", description: "Annual partnership building homes for families in need across the metropolitan area." },
    { icon: Users, title: "Youth Mentorship", description: "Sponsoring internship programs for underrepresented students pursuing real estate careers." },
    { icon: MapPin, title: "Historic Preservation", description: "Active stewardship of the city's architectural heritage through restoration advocacy." },
  ];

  return (
    <div className="pt-32 pb-24">
      {/* Company Mission */}
      <section className="px-[2%] max-w-[1400px] mx-auto mb-24 md:mb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="font-display text-display-xl font-light mt-4 mb-8">
            A Legacy of<br />
            <span className="italic">Distinction</span>
          </h1>
          <p className="font-body text-muted-foreground leading-[1.8] mb-6">
            For over two decades, Maison Estate has been the definitive authority in luxury real estate. 
            We don't simply list properties—we curate collections. Our philosophy is rooted in the belief 
            that finding the right home is an act of self-expression, one that deserves the same care 
            and sophistication as acquiring a masterwork of art.
          </p>
          <p className="font-body text-muted-foreground leading-[1.8]">
            Every client relationship begins with deep listening and culminates in life-changing results. 
            Our team of advisors brings an unmatched combination of market intelligence, negotiation expertise, 
            and an intimate understanding of the city's most coveted neighborhoods.
          </p>
        </motion.div>
      </section>

      <div className="hairline max-w-[1400px] mx-auto" />

      {/* Team Directory */}
      <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="font-display text-display-lg font-light mt-3">
            Meet the <span className="italic">Advisors</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            Each advisor brings a unique perspective shaped by years of experience 
            and a genuine passion for architecture and community.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="aspect-[3/4] overflow-hidden mb-6">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <h3 className="font-display text-2xl font-light">{agent.name}</h3>
                <p className="font-body text-xs tracking-label uppercase text-accent mt-1 mb-4">{agent.title}</p>
                
                {agent.bio && (
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{agent.bio}</p>
                )}

                <div className="space-y-2 text-sm font-body">
                  {agent.years_experience && (
                    <p className="text-muted-foreground">{agent.years_experience} Years Experience</p>
                  )}
                  {agent.total_sales_volume && (
                    <p className="text-muted-foreground">{agent.total_sales_volume} in Sales</p>
                  )}
                </div>

                {agent.notable_sales?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">Notable Sales</p>
                    {agent.notable_sales.map((sale, j) => (
                      <p key={j} className="font-body text-sm text-foreground/70">{sale}</p>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-1 font-body text-xs text-muted-foreground">
                  {agent.email && <p>{agent.email}</p>}
                  {agent.phone && <p>{agent.phone}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="hairline max-w-[1400px] mx-auto" />

      {/* Credentials & Awards */}
      <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3">
              Credentials &<br />
              <span className="italic">Awards</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-6 leading-relaxed max-w-md">
              Our commitment to excellence has been recognized by the industry's 
              most prestigious organizations.
            </p>
          </div>
          <div className="space-y-0">
            {credentials.map((cred, i) => (
              <motion.div
                key={cred.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="py-6 border-b border-border/50 first:border-t flex items-center gap-5"
              >
                <cred.icon size={20} className="text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-display text-lg font-light">{cred.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{cred.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-24 md:py-40 bg-secondary/30">
        <div className="px-[2%] max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-display-lg font-light mt-3">
              Community <span className="italic">Impact</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {impacts.map((impact, i) => (
              <motion.div
                key={impact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center"
              >
                <impact.icon size={28} className="mx-auto text-accent mb-4" />
                <h3 className="font-display text-xl font-light mb-3">{impact.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{impact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Inquiry */}
      <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3 mb-6">
              Begin Your<br />
              <span className="italic">Journey</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              Whether you're seeking your next residence or considering listing your property, 
              we're here to guide you with the expertise and discretion you deserve.
            </p>
          </div>
          <div className="border border-border/50 p-8">
            <InquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}