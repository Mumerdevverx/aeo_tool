import React from "react";
import { Star, ShieldAlert, BadgeAlert, Layers, HelpCircle, Lightbulb } from "lucide-react";

export default function GapAnalyzer({ auditedData }) {
  const gaps = auditedData ? auditedData.gaps : [];

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${
              i < count 
                ? "text-amber-400 fill-amber-400" 
                : "text-slate-700 fill-slate-800"
            }`} 
          />
        ))}
      </div>
    );
  };

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case "easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Visibility Gap Analyzer</h1>
        <p className="text-slate-400 mt-1">Deep analysis explaining why AI engines might omit your content and cite competitors instead.</p>
      </div>

      {gaps.length > 0 ? (
        <div className="space-y-4">
          {gaps.map((gap, index) => (
            <div key={index} className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800/80 hover:border-indigo-500/20 transition-all duration-300">
              
              {/* Header: Title, Gain, Priority Badges */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <h3 className="text-base font-bold text-white">{gap.issue}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{gap.explanation}</p>
                </div>
                
                {/* Meta stats badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                    <span className="font-semibold text-slate-500">Impact:</span>
                    {renderStars(gap.impact_stars)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl font-bold border text-[11px] ${getDifficultyColor(gap.difficulty)}`}>
                    {gap.difficulty}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-extrabold text-[11px]">
                    Visibility Gain: {gap.gain}
                  </span>
                </div>
              </div>

              {/* Body: AI logic block and suggestion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Left: Why AI model cares */}
                <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <HelpCircle className="w-4 h-4" />
                    Why AI Engines Care:
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">{gap.why_ai_cares}</p>
                </div>

                {/* Right: Suggested fix */}
                <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Lightbulb className="w-4 h-4" />
                    How to Fix / Implement:
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">{gap.suggested_fix}</p>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <BadgeAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Audit Gaps Analyzed</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Please run an audit scan on a website URL to extract search gaps and AI indexing issues.</p>
          </div>
        </div>
      )}
    </div>
  );
}
