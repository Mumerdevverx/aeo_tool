import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { 
  TrendingUp, Search, ShieldAlert, Award, ArrowUpRight, ArrowDownRight, 
  ExternalLink, Layers, CheckCircle2, Clock
} from "lucide-react";

export default function DashboardOverview({ 
  auditedData, 
  historyList, 
  alerts, 
  trackerHistory, 
  competitorsVoice,
  setView 
}) {
  // Compute numbers based on actual/mock state
  const totalAudits = historyList.length || 3;
  const activeAlerts = alerts.filter(a => !a.read).length || 2;
  const trackedPromptsCount = trackerHistory.length || 5;
  const averageVisibility = auditedData 
    ? auditedData.overall_score 
    : (historyList.reduce((acc, curr) => acc + curr.score, 0) / historyList.length) || 72;

  // Chart data
  const trendData = [
    { date: "June 01", ChatGPT: 62, Gemini: 45, Claude: 50, Perplexity: 55 },
    { date: "June 10", ChatGPT: 65, Gemini: 48, Claude: 52, Perplexity: 58 },
    { date: "June 20", ChatGPT: 68, Gemini: 55, Claude: 60, Perplexity: 62 },
    { date: "July 01", ChatGPT: 70, Gemini: 58, Claude: 63, Perplexity: 65 },
    { date: "July 10", ChatGPT: 75, Gemini: 62, Claude: 68, Perplexity: 70 },
    { date: "July 15", ChatGPT: Math.round(averageVisibility), Gemini: 65, Claude: 72, Perplexity: 75 }
  ];

  const distributionData = [
    { model: "ChatGPT", Score: 78, Mentions: 18 },
    { model: "Gemini", Score: 65, Mentions: 12 },
    { model: "Claude", Score: 72, Mentions: 16 },
    { model: "Perplexity", Score: 75, Mentions: 14 },
    { model: "AI Overviews", Score: 60, Mentions: 9 },
    { model: "Copilot", Score: 68, Mentions: 11 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Visibility Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time search engine visibility audit logs, model tracking, and threat monitoring.</p>
      </div>

      

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">AI Mention Trends</h3>
              <p className="text-xs text-slate-400">Tracked brand visibility scores across major LLM models.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> ChatGPT
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Claude
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Gemini
              </span>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClaude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="ChatGPT" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorChat)" />
                <Area type="monotone" dataKey="Claude" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClaude)" />
                <Area type="monotone" dataKey="Gemini" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGemini)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Mentions Chart */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Model Scores & Mentions</h3>
            <p className="text-xs text-slate-400">Current performance breakdown per AI platform.</p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="model" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="Score" fill="#818cf8" radius={[4, 4, 0, 0]} name="Score (0-100)" />
                <Bar dataKey="Mentions" fill="#34d399" radius={[4, 4, 0, 0]} name="Citation Vol" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dashboard Subgrids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Recommendations & Roadmap */}
        <div className="glass-panel p-5 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Priority Recommendations</h3>
              <p className="text-xs text-slate-400">Highest-impact fixes derived from recent audits.</p>
            </div>
            <button className="text-xs text-indigo-400 hover:underline font-bold" onClick={() => setView("recommendations")}>
              View All
            </button>
          </div>

          {auditedData && auditedData.recommendations ? (
            <div className="space-y-3">
              {auditedData.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold mt-1 ${
                    rec.priority === "HIGH" 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {rec.priority}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-white">{rec.issue}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{rec.why_ai_cares}</p>
                    <div className="text-[10px] text-indigo-400 font-semibold">{rec.gain}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-800 rounded-2xl text-center">
              <Layers className="w-10 h-10 text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-400">No Audits Performed Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Audit a website URL to discover high-priority AI visibility fixes here.</p>
              <button 
                className="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition"
                onClick={() => setView("audit")}
              >
                Go to Website Auditor
              </button>
            </div>
          )}
        </div>

        {/* Alerts Activity Log */}
        <div className="glass-panel p-5 rounded-2xl space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Security & Trend Alerts</h3>
              <p className="text-xs text-slate-400">AI crawler activity log and ranking changes.</p>
            </div>
            <button className="text-xs text-indigo-400 hover:underline font-bold" onClick={() => setView("alerts")}>
              Alerts Settings
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {alerts.slice(0, 4).map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3.5 rounded-xl border transition flex gap-3.5 ${
                  alert.read 
                    ? "bg-slate-900/20 border-slate-900/60" 
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="mt-0.5">
                  {alert.type === "visibility_increased" ? (
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  ) : alert.type === "ranking_changed" ? (
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Search className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.date.split(" ")[1]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
