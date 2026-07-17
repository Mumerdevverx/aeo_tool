import React from "react";
import { 
  Sparkles, HelpCircle, FileText, ArrowRight, Lightbulb, 
  ExternalLink, Layers, ShieldCheck, HeartHandshake 
} from "lucide-react";

export default function OpportunityFinder({ opportunities }) {
  const getImpactColor = (imp) => {
    switch (imp.toUpperCase()) {
      case "HIGH": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "faq": return <HelpCircle className="w-5 h-5 text-indigo-400" />;
      case "schema": return <Layers className="w-5 h-5 text-indigo-400" />;
      case "entity": return <FileText className="w-5 h-5 text-indigo-400" />;
      case "citation": return <ExternalLink className="w-5 h-5 text-indigo-400" />;
      case "trust": return <HeartHandshake className="w-5 h-5 text-indigo-400" />;
      default: return <Lightbulb className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Opportunity Finder</h1>
        <p className="text-slate-400 mt-1">Discover organic gaps, missing structural pages, and schema triggers that AI crawlers scan for.</p>
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getTypeIcon(opp.type)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${getImpactColor(opp.impact)}`}>
                      {opp.impact} Potential
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-bold text-[9px]">
                      {opp.potential_gain}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white leading-snug">{opp.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{opp.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                <span>Configure Fix Operations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Opportunities Discovered</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Please run a website audit check to parse search crawler structures and locate new opportunities.</p>
          </div>
        </div>
      )}
    </div>
  );
}
