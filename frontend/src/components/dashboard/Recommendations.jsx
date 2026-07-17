import { AlertTriangle, Play, HelpCircle, Briefcase, FileText, CheckCircle2 } from "lucide-react";

export default function Recommendations({ auditedData }) {
  const recommendations = auditedData ? auditedData.recommendations : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Recommendation Engine</h1>
        <p className="text-slate-400 mt-1">Prioritized list of optimization actions sorted by highest potential AI mention improvements.</p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Title & Priority Badge */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} PRIORITY
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{rec.issue}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl block">
                      {rec.gain}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1 uppercase">EST. GAIN</span>
                  </div>
                </div>

                {/* Info block grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 text-slate-300">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                      <HelpCircle className="w-3.5 h-3.5" /> Why AI Cares
                    </span>
                    <p className="leading-relaxed font-medium">{rec.why_ai_cares}</p>
                  </div>
                  
                  <div className="space-y-1 text-slate-300">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                      <Briefcase className="w-3.5 h-3.5" /> Business Impact
                    </span>
                    <p className="leading-relaxed font-medium">{rec.business_impact}</p>
                  </div>
                </div>

                {/* Affected Pages */}
                {rec.affected_pages && rec.affected_pages.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                      <FileText className="w-3.5 h-3.5" /> Affected URLs
                    </span>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {rec.affected_pages.map((page, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 font-mono text-[10.5px]">
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Implementation steps */}
                <div className="space-y-2 pt-2">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                    <Play className="w-3.5 h-3.5" /> Implementation Steps
                  </span>
                  <ol className="space-y-2.5 pl-1">
                    {rec.implementation_steps.map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs text-slate-300 font-medium">
                        <span className="h-5 w-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Recommendations Generated</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Please run an audit scan on a website URL to trigger recommendations from our prioritized AI model engine.</p>
          </div>
        </div>
      )}
    </div>
  );
}
