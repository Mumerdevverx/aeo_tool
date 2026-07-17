import React from "react";
import { Clock, ShieldAlert, Award, TrendingUp, Zap, HelpCircle, AlertCircle, ArrowUpRight } from "lucide-react";

export default function Roadmap({ auditedData }) {
  const roadmap = auditedData ? auditedData.roadmap : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Search Visibility Roadmap</h1>
        <p className="text-slate-400 mt-1">Structured schedule outlining step-by-step implementations to grow LLM search presence.</p>
      </div>

      {roadmap ? (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Implementation Cycle</span>
                <span className="text-lg font-bold text-white">{roadmap.timeline_weeks || "4 Weeks"}</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Expected Visibility Improvement</span>
                <span className="text-lg font-bold text-emerald-400">{roadmap.expected_score_improvement || "+15% AI Score"}</span>
              </div>
            </div>
          </div>

          {/* Timeline Layout */}
          <div className="relative pl-6 md:pl-8 border-l border-slate-800 space-y-8 py-2">
            
            {/* Step 1: Immediate Fixes */}
            <div className="relative space-y-3">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[35px] top-1 h-4 w-4 rounded-full bg-rose-500 border-4 border-slate-950 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-extrabold tracking-wider bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                    Stage 1
                  </span>
                  <h3 className="text-base font-bold text-white">Immediate Critical Fixes</h3>
                </div>
                <p className="text-xs text-slate-400">Address code-level crawlability blocks or SSL issues immediately to re-enable scans.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-w-2xl">
                {roadmap.immediate_fixes.map((item, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/5 border border-rose-900/15 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Quick Wins */}
            <div className="relative space-y-3">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[35px] top-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-extrabold tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                    Stage 2
                  </span>
                  <h3 className="text-base font-bold text-white">Quick Optimization Wins</h3>
                </div>
                <p className="text-xs text-slate-400">Implement low-effort schema adjustments or metadata headers to improve visibility metrics.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-w-2xl">
                {roadmap.quick_wins.map((item, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/5 border border-emerald-900/15 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: High Impact */}
            <div className="relative space-y-3">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[35px] top-1 h-4 w-4 rounded-full bg-indigo-500 border-4 border-slate-950 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400 font-extrabold tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                    Stage 3
                  </span>
                  <h3 className="text-base font-bold text-white">High Impact Enhancements</h3>
                </div>
                <p className="text-xs text-slate-400">Implement FAQ systems and semantic answers blocks to target large AI question queries.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-w-2xl">
                {roadmap.high_impact.map((item, idx) => (
                  <div key={idx} className="p-3 bg-indigo-950/5 border border-indigo-900/15 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0"></span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Long Term */}
            <div className="relative space-y-3">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[35px] top-1 h-4 w-4 rounded-full bg-cyan-500 border-4 border-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cyan-400 font-extrabold tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                    Stage 4
                  </span>
                  <h3 className="text-base font-bold text-white">Long Term Content & Authority</h3>
                </div>
                <p className="text-xs text-slate-400">Construct semantic content structures, link assets, and reviews for domain authority.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-w-2xl">
                {roadmap.long_term.map((item, idx) => (
                  <div key={idx} className="p-3 bg-cyan-950/5 border border-cyan-900/15 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0"></span> {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Roadmap Calculated</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Please run an audit scan on a website URL to construct a priority timeline roadmap.</p>
          </div>
        </div>
      )}
    </div>
  );
}
