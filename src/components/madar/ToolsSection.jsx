import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/madar/Motion';
import { Brain, TrendingUp, Calculator, Network, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

const tools = [
  { icon: Brain, titleKey: 'tool1Title', descKey: 'tool1Desc', gradient: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
  { icon: TrendingUp, titleKey: 'tool2Title', descKey: 'tool2Desc', gradient: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
  { icon: Calculator, titleKey: 'tool3Title', descKey: 'tool3Desc', gradient: 'from-pink-500/20 to-purple-600/10', iconColor: 'text-pink-400', border: 'border-pink-500/20' },
  { icon: Network, titleKey: 'tool4Title', descKey: 'tool4Desc', gradient: 'from-orange-500/20 to-amber-600/10', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
  { icon: BarChart3, titleKey: 'tool5Title', descKey: 'tool5Desc', gradient: 'from-indigo-500/20 to-purple-600/10', iconColor: 'text-indigo-400', border: 'border-indigo-500/20' },
  { icon: ShieldCheck, titleKey: 'tool6Title', descKey: 'tool6Desc', gradient: 'from-slate-500/20 to-slate-600/10', iconColor: 'text-slate-300', border: 'border-slate-500/20' },
];

export default function ToolsSection() {
  const { t } = useLang();

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1B2A] border border-[#ADDFF1]/20 text-[#ADDFF1] text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />{t('toolsBadge')}
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06131F] mb-6 leading-tight">
            {t('toolsTitle')}
          </h2>
          <p className="text-[#06131F]/50 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('toolsSubtitle')}
          </p>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {tools.map((tool) => (
            <StaggerItem key={tool.titleKey}>
              <div className="group h-full p-7 rounded-3xl bg-[#0B1B2A] border border-white/[0.06] hover:border-white/15 hover:bg-[#13151C] transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} border ${tool.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <h3 className="font-heading font-bold text-[#F2F8FC] text-lg mb-3">{t(tool.titleKey)}</h3>
                <p className="text-[#F2F8FC]/60 text-sm leading-relaxed">{t(tool.descKey)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}