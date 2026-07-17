import React, { useState } from "react";
import { 
  Globe, ShieldCheck, AlertCircle, ArrowRight, ShieldAlert, Cpu, 
  Database, Tag, LayoutGrid, HeartHandshake, Gauge, Sparkles, Loader2
} from "lucide-react";
import ReportDownload from "../toolone/ReportDownload";

export default function WebsiteAuditor({ auditedData, onAudit, isAuditing }) {
  const [url, setUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("crawlability");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAudit(url.trim());
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "crawlability": return <Globe className="w-5 h-5 text-indigo-400" />;
      case "structured_data": return <Database className="w-5 h-5 text-indigo-400" />;
      case "entity_recognition": return <Tag className="w-5 h-5 text-indigo-400" />;
      case "content_structure": return <LayoutGrid className="w-5 h-5 text-indigo-400" />;
      case "trust_signals": return <HeartHandshake className="w-5 h-5 text-indigo-400" />;
      case "performance": return <Gauge className="w-5 h-5 text-indigo-400" />;
      case "ai_readability": return <Sparkles className="w-5 h-5 text-indigo-400" />;
      default: return <Globe className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getScoreText = (score) => {
    if (score >= 90) return "Optimal";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Work";
    return "Critical";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Website Auditor</h1>
        <p className="text-slate-400 mt-1">Scan a URL to measure its crawlability, entity linkages, structured markup, and AI trust levels.</p>
      </div>

      {/* URL Scan Form */}
      <div className="glass-panel p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Globe className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="e.g. https://yourdomain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAuditing}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none transition disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isAuditing || !url.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Auditing Site...
              </>
            ) : (
              <>
                Analyze Website
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {isAuditing && (
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-spin">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">Crawling Target Domain</h3>
            <p className="text-xs text-slate-400 max-w-sm">Fetching robots.txt, canonical structure, parsing ld+json schemas, and auditing with Cohere AI model...</p>
          </div>
        </div>
      )}

      {/* Audit Results View */}
      {auditedData && !isAuditing && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sidebar Score Wheel & Categories */}
            <div className="glass-panel p-5 rounded-2xl space-y-6 flex flex-col justify-between">
              {/* Score Ring */}
              <div className="text-center space-y-2 py-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall AI Visibility</span>
                <div className="relative flex items-center justify-center py-2">
                  <div className="h-32 w-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
                    <span className="text-4xl font-extrabold text-white">{auditedData.overall_score}</span>
                    <span className="text-[10px] font-bold text-indigo-400 mt-0.5">GRADE {
                      auditedData.overall_score >= 90 ? "A" : auditedData.overall_score >= 75 ? "B" : auditedData.overall_score >= 60 ? "C" : auditedData.overall_score >= 40 ? "D" : "F"
                    }</span>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin opacity-40"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">This score indicates how easily AI crawlers find, read, trust, and cite this domain.</p>
              </div>

              {/* Category selection items */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Audited Modules</span>
                {Object.entries(auditedData.categories).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      selectedCategory === key
                        ? "bg-slate-900 border-indigo-500/40 text-white"
                        : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(key)}
                      <span className="text-xs font-bold capitalize">{key.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{val}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getScoreColor(val)}`}>
                        {getScoreText(val)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Module Deep Dive details */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {getCategoryIcon(selectedCategory)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{selectedCategory.replace("_", " ")} Audit</h3>
                    <p className="text-xs text-slate-400">Detailed tag inspection and code validation.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">{auditedData.categories[selectedCategory]}/100</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Module Score</div>
                </div>
              </div>

              {/* Module Content */}
              {selectedCategory === "crawlability" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Technical Crawling Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">SSL Protection</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safe HTTPS Protocol
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Robots.txt Crawl Control</div>
                      <div className="text-xs font-bold text-white">
                        {auditedData.gaps?.some(g => g.issue.includes("Robots")) ? (
                          <span className="text-rose-400 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Disallow active for AI Bots</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Allow directives configured</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Canonical URL Reference</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Found & Verified Matches
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Indexing Directives</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Index / Follow Configured
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === "structured_data" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">JSON-LD Microdata Detected</h4>
                  {auditedData.gaps?.some(g => g.issue.includes("Schema")) ? (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      Some expected microdata schemes are missing. Model agents might rely on fallback parsing.
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      All standard structural schemas detected successfully.
                    </div>
                  )}
                  <div className="space-y-2">
                    {["Organization", "FAQPage", "Article", "BreadcrumbList"].map((schema) => {
                      const isMissing = auditedData.gaps?.some(g => g.issue.includes("Schema") && g.explanation?.includes(schema));
                      return (
                        <div key={schema} className="p-3 bg-slate-900/30 border border-slate-800/60 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-300">{schema} schema</span>
                          {isMissing ? (
                            <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Missing</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Detected</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCategory === "entity_recognition" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Entity declarations and SameAs connections</h4>
                  <p className="text-xs text-slate-400">AI search models index websites as corporate entity maps. Connecting official handles is critical.</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">Organization / Brand Name</div>
                        <div className="text-[10px] text-slate-500">Ties facts to brand entity</div>
                      </div>
                      {auditedData.gaps?.some(g => g.issue.includes("Brand")) ? (
                        <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Not Set</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                      )}
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">Wikidata SameAs Links</div>
                        <div className="text-[10px] text-slate-500">Cross-reference authority link</div>
                      </div>
                      {auditedData.gaps?.some(g => g.issue.includes("SameAs")) ? (
                        <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Missing Links</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for other tabs */}
              {!["crawlability", "structured_data", "entity_recognition"].includes(selectedCategory) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Auditor Insight</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This module evaluates structural design rules optimized for neural search models. 
                    Having correct text hierarchy, clean content definitions, testimonials, fast load speed 
                    and clear accessibility ensures search scrapers don't timeout and index content with confidence.
                  </p>
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white">Recommendations affected:</div>
                    {auditedData.gaps
                      ?.filter(g => g.issue?.toLowerCase().includes(selectedCategory.split("_")[0]))
                      .map((g, i) => (
                        <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> {g.issue}
                        </div>
                      ))}
                    {auditedData.gaps?.filter(g => g.issue?.toLowerCase().includes(selectedCategory.split("_")[0]))?.length === 0 && (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Good job! No outstanding critical issues found for this module.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Report Download Section - Full Width Below */}
          <div className="mt-6">
            <ReportDownload 
              url={auditedData.url}
              grade={auditedData.overall_score >= 90 ? "A" : auditedData.overall_score >= 75 ? "B" : auditedData.overall_score >= 60 ? "C" : auditedData.overall_score >= 40 ? "D" : "F"}
              score={auditedData.overall_score}
              problems={auditedData.gaps?.map(g => `${g.impact_stars >= 4 ? '❌' : '⚠️'} ${g.issue}: ${g.suggested_fix}`) || []}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!auditedData && !isAuditing && (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Site Scanned Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Enter your website URL above to generate a complete AI visibility grading audit and PDF report.</p>
          </div>
        </div>
      )}
    </div>
  );
}