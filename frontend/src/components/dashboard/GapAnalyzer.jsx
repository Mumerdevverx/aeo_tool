import React, { useState } from "react";
import { Star, ShieldAlert, BadgeAlert, HelpCircle, Lightbulb, CheckCircle, AlertTriangle, Info, Filter } from "lucide-react";

export default function GapAnalyzer({ auditedData }) {
  const [filterPriority, setFilterPriority] = useState("ALL");
  const gaps = auditedData ? auditedData.gaps : [];

  const filteredGaps = gaps.filter(gap => {
    if (filterPriority === "ALL") return true;
    return (gap.priority || "MEDIUM").toUpperCase() === filterPriority;
  });

  const getPriorityBadge = (priority) => {
    const p = (priority || "MEDIUM").toUpperCase();
    switch (p) {
      case "HIGH":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 font-black";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold";
      case "LOW":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-medium";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const renderStars = (count = 3) => {
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

  const getDifficultyColor = (diff = "Medium") => {
    switch (diff.toLowerCase()) {
      case "easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Visibility Gap Analyzer</h1>
          <p className="text-slate-400 mt-1">Clear breakdown of missing search & AEO signals with priority fixes for humans and AI agents.</p>
        </div>

        {/* Priority Filter Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority:
          </span>
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                filterPriority === p
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filteredGaps.length > 0 ? (
        <div className="space-y-4">
          {filteredGaps.map((gap, index) => {
            const fixText = gap.fix || gap.suggested_fix || "No specific fix steps provided.";
            const priorityText = (gap.priority || "MEDIUM").toUpperCase();

            return (
              <div 
                key={index} 
                className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 shadow-lg"
              >
                {/* Top Row: Title, Category & Priority Badges */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] border tracking-wide uppercase ${getPriorityBadge(priorityText)}`}>
                        {priorityText} PRIORITY
                      </span>
                      {gap.category && (
                        <span className="text-xs text-indigo-400 font-semibold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                          {gap.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{gap.issue}</h3>
                    <p className="text-xs text-slate-300">{gap.explanation}</p>
                  </div>
                  
                  {/* Right Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {gap.impact_stars && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                        <span className="font-semibold text-slate-500">Impact:</span>
                        {renderStars(gap.impact_stars)}
                      </div>
                    )}
                    {gap.difficulty && (
                      <span className={`px-2.5 py-1 rounded-xl font-bold border text-[11px] ${getDifficultyColor(gap.difficulty)}`}>
                        {gap.difficulty}
                      </span>
                    )}
                    {gap.gain && (
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-extrabold text-[11px]">
                        Gain: {gap.gain}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2-Column Human-Friendly Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Why AI Engine Cares */}
                  <div className="p-4 bg-indigo-950/25 border border-indigo-900/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Why Answer Engines Care:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-normal">
                      {gap.why_ai_cares || "AI engines use structured data and clear text hierarchy to evaluate trust, extract quotes, and cite URLs."}
                    </p>
                  </div>

                  {/* Right: How to Fix */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Lightbulb className="w-4 h-4 text-emerald-400" />
                      <span>Actionable Step-by-Step Fix:</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {fixText}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Priority Gaps Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">No audit gaps match the selected priority filter. Perform a site scan to view new issues.</p>
          </div>
        </div>
      )}
    </div>
  );
}
