import { motion } from "framer-motion";

export default function AdvisorCard({ agent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}>
      
      <div className="aspect-[3/4] overflow-hidden mb-6">
        <img src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/fe5d3696b_Base44_Templates_Gemini_3__Nano_Banana_Pro__2026-05-20_18-42-53.png"

        alt={agent.name}
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        
      </div>
      <h3 className="font-display text-2xl font-light">{agent.name}</h3>
      <p className="font-body text-xs tracking-label uppercase text-accent mt-1 mb-4">
        {agent.title}
      </p>

      {agent.bio &&
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
          {agent.bio}
        </p>
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
    </motion.div>);

}