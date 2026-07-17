import React, { useState } from "react";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie
} from "recharts";
import { 
  TrendingUp, Users, ArrowUpRight, Cpu, Star, HeartHandshake, Database, Globe
} from "lucide-react";

export default function CompetitorVoice({ voiceData, onAnalyze }) {
  const [brandUrl, setBrandUrl] = useState(voiceData?.brand_url || "");
  const [compA, setCompA] = useState("");
  const [compB, setCompB] = useState("");
  const [compC, setCompC] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandUrl.trim()) return;

    setLoading(true);
    const list = [];
    if (compA.trim()) list.push(compA.trim());
    if (compB.trim()) list.push(compB.trim());
    if (compC.trim()) list.push(compC.trim());

    await onAnalyze({
      brand_url: brandUrl.trim(),
      competitors: list
    });
    setLoading(false);
  };

  const shareOfVoice = voiceData ? voiceData.share_of_voice : [];

  // Pie chart colors
  const COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#34d399"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Competitor Share of Voice</h1>
        <p className="text-slate-400 mt-1">Audit and compare your brand's citation frequency, ranking, and authority relative to primary competitors.</p>
      </div>

      {/* Inputs Form */}
      <div className="glass-panel p-5 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Your Brand URL</label>
              <input
                type="text"
                placeholder="e.g. helpscout.com"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Competitor A</label>
              <input
                type="text"
                placeholder="e.g. zendesk.com"
                value={compA}
                onChange={(e) => setCompA(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Competitor B</label>
              <input
                type="text"
                placeholder="e.g. intercom.com"
                value={compB}
                onChange={(e) => setCompB(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase">Competitor C</label>
              <input
                type="text"
                placeholder="e.g. freshworks.com"
                value={compC}
                onChange={(e) => setCompC(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !brandUrl.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-indigo-500/20"
            >
              {loading ? "Calculating voice data..." : "Run Voice Analysis"}
            </button>
          </div>
        </form>
      </div>

      {shareOfVoice.length > 0 ? (
        <div className="space-y-6">
          {/* Comparison Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {shareOfVoice.map((brand, idx) => (
              <div key={brand.name} className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {brand.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Rank #{brand.ranking}</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{brand.mention_percentage}%</span>
                    <span className="text-slate-500 text-xs font-semibold">Share of Voice</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-800 text-[10px] text-slate-400 font-bold uppercase text-center">
                  <div>
                    <span className="text-xs text-white font-extrabold block mb-0.5">{brand.visibility_score}</span>
                    AI Score
                  </div>
                  <div>
                    <span className="text-xs text-white font-extrabold block mb-0.5">{brand.ai_mentions}</span>
                    Mentions
                  </div>
                  <div>
                    <span className="text-xs text-white font-extrabold block mb-0.5">{brand.citation_count}</span>
                    Citations
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Share charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pie Chart Share percentage */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Mention distribution (%)</h3>
                <p className="text-xs text-slate-400">Total brand citation share across prompt categories.</p>
              </div>

              <div className="h-[200px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shareOfVoice}
                      dataKey="mention_percentage"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={45}
                      fill="#8884d8"
                      paddingAngle={4}
                    >
                      {shareOfVoice.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart comparisons */}
            <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Metrics Comparison Grid</h3>
                <p className="text-xs text-slate-400">Comparing visibility index vs citation volume per brand.</p>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shareOfVoice} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }} />
                    <Bar dataKey="visibility_score" fill="#6366f1" radius={[4, 4, 0, 0]} name="AI Visibility Index" />
                    <Bar dataKey="ai_mentions" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Citations Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80">
          <div className="h-16 w-16 bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Voice Analysis Checked</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Please enter your domain URL and competitor domains above to compare search share of voice stats.</p>
          </div>
        </div>
      )}
    </div>
  );
}
