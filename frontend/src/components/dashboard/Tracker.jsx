import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Search, PlusCircle, CheckCircle, AlertTriangle, Link, ArrowDown, 
  ArrowUp, Award, Calendar, ChevronRight, HelpCircle 
} from "lucide-react";
import axios from "axios";

export default function Tracker({ trackerHistory, onAddPrompt, trendData }) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("ChatGPT");
  const [brand, setBrand] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !brand.trim()) return;

    setIsAdding(true);
    const comps = competitors.split(",").map(c => c.trim()).filter(Boolean);
    await onAddPrompt({
      prompt: prompt.trim(),
      ai_model: model,
      brand_mentioned: brand.trim(),
      competitors: comps
    });

    // Reset fields
    setPrompt("");
    setBrand("");
    setCompetitors("");
    setIsAdding(false);
  };

  const getPositionBadge = (pos) => {
    if (pos === 1) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold";
    if (pos === 2 || pos === 3) return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold";
    if (pos > 3) return "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Visibility Tracker <span className="text-[10px] align-middle font-bold bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase ml-1.5">Premium</span></h1>
        <p className="text-slate-400 mt-1">Monitor brand mentions, position, and competitor citation shares across models over time.</p>
      </div>

      {/* Tracker Entry & Trend chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tracker Form */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 h-fit">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            Track Brand Query
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Search Query Prompt */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">LLM Search Prompt</label>
              <textarea
                rows={2}
                placeholder="e.g. What is the best customer support software for startups?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none resize-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Brand Term */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase">Brand to Monitor</label>
                <input
                  type="text"
                  placeholder="e.g. HelpScout"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
                />
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none cursor-pointer transition"
                >
                  {["ChatGPT", "Gemini", "Claude", "Perplexity", "Google AI Overviews", "Microsoft Copilot"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Competitor list */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Competitors (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Zendesk, Intercom, Freshdesk"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isAdding || !prompt.trim() || !brand.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isAdding ? "Checking AI mentions..." : "Add to Tracker"}
            </button>
          </form>
        </div>

        {/* Visibility line chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Model Visibility Trends</h3>
            <p className="text-xs text-slate-400">Weighted brand visibility over the last month across AI platforms.</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chatgpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }} />
                <Area type="monotone" dataKey="ChatGPT" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#chatgpt)" />
                <Area type="monotone" dataKey="Claude" stroke="#06b6d4" strokeWidth={2.5} fill="none" />
                <Area type="monotone" dataKey="Gemini" stroke="#f59e0b" strokeWidth={2.5} fill="none" />
                <Area type="monotone" dataKey="Perplexity" stroke="#34d399" strokeWidth={2.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tracker log table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/40">
          <h3 className="text-base font-bold text-white">Tracked Brand Mention Queries</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">AI Model</th>
                <th className="p-4">Prompt</th>
                <th className="p-4">Brand Mention Status</th>
                <th className="p-4">Competitors Tracked</th>
                <th className="p-4">Source Citation</th>
              </tr>
            </thead>
            <tbody>
              {trackerHistory.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-900/25 transition">
                  <td className="p-4 whitespace-nowrap text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {item.date}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-slate-200 font-bold">{item.ai_model}</td>
                  <td className="p-4 max-w-xs truncate text-slate-300 font-medium" title={item.prompt}>{item.prompt}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] ${getPositionBadge(item.position)}`}>
                      {item.position > 0 ? `Ranked #${item.position}` : "Not Cited"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {item.competitors.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded font-medium text-[9px]">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {item.citation_url ? (
                      <a href={item.citation_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold">
                        <Link className="w-3.5 h-3.5" /> Cite Link
                      </a>
                    ) : (
                      <span className="text-slate-600 font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
