import { useLanguage } from "@/lib/LanguageContext";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const { lang } = useLanguage();

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="bg-[#080B14] min-h-screen overflow-x-hidden"
    >
      <LandingNavbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  );
}