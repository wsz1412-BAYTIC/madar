import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Building2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

export default function ServicesOverview() {
  const { t, lang } = useLanguage();

  const services = [
    {
      icon: TrendingUp,
      title: lang === "ar" ? "تسعير ذكي" : "Smart Pricing",
      description:
        lang === "ar"
          ? "توصيات أسعار يومية مدعومة بالذكاء الاصطناعي لكل عقار على كل منصة."
          : "AI-powered daily pricing recommendations for each property across every platform.",
    },
    {
      icon: BarChart3,
      title: lang === "ar" ? "تحليل المنافسين" : "Competitor Analysis",
      description:
        lang === "ar"
          ? "قارن أسعارك مع المنافسين في منطقتك واكتشف فرص زيادة الإيرادات."
          : "Compare your prices with competitors in your area and discover revenue opportunities.",
    },
    {
      icon: Building2,
      title: lang === "ar" ? "مقارنة متعددة المنصات" : "Multi-Platform Sync",
      description:
        lang === "ar"
          ? "اربط عقاراً واحداً عبر Airbnb و Gatherin و Booking.com وقارن الأسعار."
          : "Link one property across Airbnb, Gatherin, and Booking.com and compare prices.",
    },
    {
      icon: Globe,
      title: lang === "ar" ? "رؤى السوق" : "Market Insights",
      description:
        lang === "ar"
          ? "بيانات السوق التفصيلية لكل مدينة لاتخاذ قرارات تسعير مستنيرة."
          : "Detailed market data for each city to make informed pricing decisions.",
    },
  ];

  return (
    <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <h2 className="font-display text-display-lg font-light mt-3">
            {t("dashboard.services")}
          </h2>
          <p className="font-body text-muted-foreground text-base mt-6 leading-snug max-w-md">
            {t("dashboard.servicesDesc")}
          </p>
          <Link to="/billing" className="ghost-btn inline-block mt-8 text-sm">
            {t("billing.upgrade")}
          </Link>
        </div>

        <div className="space-y-0">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="py-8 border-b border-border/90 first:border-t"
            >
              <div className="flex items-start gap-5">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.3 }}>
                  <service.icon size={20} className="text-accent mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl font-light mb-2">{service.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}