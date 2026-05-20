import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function AdvisorsSection() {
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

  return (
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

      {loading ?
      <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {agents.map((agent, i) =>
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}>
          
              <div className="aspect-[3/4] overflow-hidden mb-6">
                <img src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/3a57cd7cc_Base44_Templates_Gemini_3__Nano_Banana_Pro__2026-05-20_18-42-49.png"

            alt={agent.name}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            
              </div>
              <h3 className="font-display text-2xl font-light">{agent.name}</h3>
              <p className="font-body text-xs tracking-label uppercase text-accent mt-1 mb-4">{agent.title}</p>
              
              {agent.bio &&
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{agent.bio}</p>
          }

              <div className="space-y-2 text-sm font-body">
                {agent.years_experience &&
            <p className="text-muted-foreground">{agent.years_experience} Years Experience</p>
            }
                {agent.total_sales_volume &&
            <p className="text-muted-foreground">{agent.total_sales_volume} in Sales</p>
            }
              </div>

              <div className="mt-4 space-y-1 font-body text-xs text-muted-foreground">
                {agent.email && <p>{agent.email}</p>}
                {agent.phone && <p>{agent.phone}</p>}
              </div>
            </motion.div>
        )}
        </div>
      }
    </section>);

}