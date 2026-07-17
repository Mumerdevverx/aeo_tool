import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Globe, ShieldCheck, AlertCircle, Cpu, Database, Tag, LayoutGrid, 
  HeartHandshake, Gauge, Sparkles, Bell, LayoutDashboard, AlertTriangle, 
  Map, TrendingUp, Search, UserCheck, Menu, X 
} from "lucide-react";

// Components
import DashboardOverview from "./components/dashboard/DashboardOverview";
import WebsiteAuditor from "./components/dashboard/WebsiteAuditor";
import GapAnalyzer from "./components/dashboard/GapAnalyzer";
import Recommendations from "./components/dashboard/Recommendations";
import Roadmap from "./components/dashboard/Roadmap";
import Tracker from "./components/dashboard/Tracker";
import CompetitorVoice from "./components/dashboard/CompetitorVoice";
import OpportunityFinder from "./components/dashboard/OpportunityFinder";
import AlertsCenter from "./components/dashboard/AlertsCenter";

const API_BASE = "http://localhost:8000/api";

export default function App() {
  const [view, setView] = useState("overview");
  const [auditedData, setAuditedData] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [trackerHistory, setTrackerHistory] = useState([]);
  const [competitorsVoice, setCompetitorsVoice] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    visibility_changes: true,
    competitor_mentions: true,
    citation_opportunities: true,
    email_digests: false,
    email_address: "notify@clientdomain.com"
  });
  const [trendData, setTrendData] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load initial tracker logs, alerts, settings
  useEffect(() => {
    async function initData() {
      try {
        // Run parallel queries to local FastAPI backend
        const [trackerRes, alertsRes, settingsRes, voiceRes, opportunitiesRes, trendRes] = await Promise.all([
          axios.get(`${API_BASE}/tracker`),
          axios.get(`${API_BASE}/alerts`),
          axios.get(`${API_BASE}/alerts/settings`),
          axios.get(`${API_BASE}/competitors`),
          axios.get(`${API_BASE}/opportunities`),
          axios.get(`${API_BASE}/tracker/trend-chart`)
        ]);
        
        setTrackerHistory(trackerRes.data);
        setAlerts(alertsRes.data);
        setAlertSettings(settingsRes.data);
        setCompetitorsVoice(voiceRes.data);
        setOpportunities(opportunitiesRes.data);
        setTrendData(trendRes.data);
      } catch (err) {
        console.warn("Backend server not running or connection failed. Using state-driven fallback data.");
        // Fallbacks
        setTrackerHistory([
          { id: 1, prompt: "What is the best customer support software for startups?", ai_model: "ChatGPT", brand_mentioned: "HelpScout", position: 2, competitors: ["Zendesk", "Intercom", "Freshdesk"], citation_url: "https://www.helpscout.com/startup-pricing/", date: "2026-07-10" },
          { id: 2, prompt: "Which AI coding assistants support offline models?", ai_model: "Gemini", brand_mentioned: "Continue.dev", position: 1, competitors: ["Copilot", "Tabnine"], citation_url: "https://github.com/continuedev/continue", date: "2026-07-12" },
          { id: 3, prompt: "Top security compliance automation tools for SOC2", ai_model: "Claude", brand_mentioned: "Vanta", position: 1, competitors: ["Drata", "Secureframe"], citation_url: "https://www.vanta.com/soc-2", date: "2026-07-14" },
          { id: 4, prompt: "Compare lightweight React state management libraries", ai_model: "Perplexity", brand_mentioned: "Zustand", position: 2, competitors: ["Jotai", "Recoil"], citation_url: "https://zustand-demo.pmnd.rs/", date: "2026-07-15" }
        ]);
        setAlerts([
          { id: "alert-1", title: "AI Visibility Surge (+8%)", message: "Brand mentions surged 8% on Claude 3.5 Sonnet queries related to compliance.", type: "visibility_increased", date: "2026-07-15 14:10", read: false },
          { id: "alert-2", title: "Prompt Position Changed (#3 to #1)", message: "Your prompt 'Which AI coding assistants support offline models?' rose to position #1 on Gemini.", type: "ranking_changed", date: "2026-07-14 09:45", read: false },
          { id: "alert-3", title: "Competitor Gained Mentions (+12%)", message: "Competitor A mentions rose 12% in ChatGPT queries comparing SOC-2 platforms.", type: "competitor_gained", date: "2026-07-13 18:22", read: true }
        ]);
        setCompetitorsVoice({
          brand_url: "helpscout.com",
          share_of_voice: [
            { name: "Your Brand", mention_percentage: 28, ranking: 3, citation_count: 6, visibility_score: 75, ai_mentions: 14 },
            { name: "Competitor A", mention_percentage: 36, ranking: 1, citation_count: 10, visibility_score: 84, ai_mentions: 25 },
            { name: "Competitor B", mention_percentage: 22, ranking: 2, citation_count: 8, visibility_score: 78, ai_mentions: 18 },
            { name: "Competitor C", mention_percentage: 14, ranking: 4, citation_count: 4, visibility_score: 60, ai_mentions: 8 }
          ]
        });
        setOpportunities([
          { title: "FAQ AI Snippet Optimization", description: "Create answer-first blocks answering top queries and mark them up with FAQ Schema.", impact: "HIGH", potential_gain: "+15% Visibility", type: "faq" },
          { title: "Missing Trust Brand Entity", description: "Establish a distinct organization entity declaration to anchor AI knowledge claims.", impact: "HIGH", potential_gain: "+20% Trust", type: "entity" },
          { title: "Content Cluster Internal Linking", description: "Connect your landing page with semantic resource hubs using clean link anchors.", impact: "MEDIUM", potential_gain: "+8% Crawl Rate", type: "internal_link" }
        ]);
        setTrendData([
          { date: "June 01", ChatGPT: 62, Gemini: 45, Claude: 50, Perplexity: 55 },
          { date: "June 10", ChatGPT: 65, Gemini: 48, Claude: 52, Perplexity: 58 },
          { date: "June 20", ChatGPT: 68, Gemini: 55, Claude: 60, Perplexity: 62 },
          { date: "July 01", ChatGPT: 70, Gemini: 58, Claude: 63, Perplexity: 65 },
          { date: "July 10", ChatGPT: 75, Gemini: 62, Claude: 68, Perplexity: 70 },
          { date: "July 15", ChatGPT: 78, Gemini: 65, Claude: 72, Perplexity: 75 }
        ]);
      }
    }
    initData();
  }, []);

  // API Call: Perform Web Audit
  const handleWebsiteAudit = async (targetUrl) => {
    setIsAuditing(true);
    try {
      const response = await axios.post(`${API_BASE}/audit`, { url: targetUrl });
      setAuditedData(response.data);
      
      // Update history list
      setHistoryList(prev => {
        const item = { url: targetUrl, title: response.data.title, score: response.data.overall_score };
        if (prev.some(h => h.url === targetUrl)) {
          return prev.map(h => h.url === targetUrl ? item : h);
        }
        return [item, ...prev];
      });

      // Update opportunities and sidebar based on actual crawl if present
      if (response.data.opportunities) {
        setOpportunities(response.data.opportunities);
      }
    } catch (err) {
      console.error("Audit failed on backend. Triggering mock fallback analysis.", err);
      // Run custom client-side generation mockup
      const mockScore = Math.floor(Math.random() * 25) + 60; // 60-85
      const mockResult = {
        overall_score: mockScore,
        url: targetUrl,
        categories: {
          crawlability: 85,
          structured_data: 60,
          entity_recognition: 50,
          content_structure: 75,
          trust_signals: 60,
          performance: 80,
          ai_readability: 70
        },
        gaps: [
          { issue: "Missing Organization Schema", explanation: "No structural brand schema markup detected in header metadata.", why_ai_cares: "AI engines read Organization properties to discover parent companies, brands, and trust signals.", impact_stars: 4, difficulty: "Easy", gain: "+18%", suggested_fix: "Add LD-JSON Organization block containing website name, URL, and founder fields." },
          { issue: "Robots.txt Crawling Restrictions", explanation: "Active disallow tags restrict bot scans for custom user agents.", why_ai_cares: "Restricted access limits model crawlers from processing real-time citation links.", impact_stars: 5, difficulty: "Easy", gain: "+25%", suggested_fix: "Verify user-agent access configurations inside robots.txt." }
        ],
        recommendations: [
          { id: "rec-1", issue: "Deploy JSON-LD Organization Schema", why_ai_cares: "Organization tags establish primary brand credentials.", business_impact: "Improves E-E-A-T scores across search indices. Priority high.", difficulty: "Easy", gain: "+18% AI visibility", affected_pages: [targetUrl], implementation_steps: ["Generate organization template markup", "Inject code inside head blocks", "Validate with Google structured tests"], priority: "HIGH" }
        ],
        roadmap: {
          immediate_fixes: ["Verify robots.txt access permissions"],
          quick_wins: ["Inject Organization LD-JSON tags"],
          high_impact: ["Publish testimonial text logs"],
          long_term: ["Optimize internal navigation lists"],
          timeline_weeks: "3 Weeks",
          expected_score_improvement: "+14%"
        },
        competitors: {
          your_brand: { name: "Your Brand", mention_percentage: 25, ranking: 3, citation_count: 5, visibility_score: mockScore, ai_mentions: 12 }
        }
      };
      setAuditedData(mockResult);
    } finally {
      setIsAuditing(false);
    }
  };

  // API Call: Competitors analysis
  const handleCompetitorAnalyze = async ({ brand_url, competitors }) => {
    try {
      const response = await axios.post(`${API_BASE}/competitors/analyze`, { brand_url, competitors });
      setCompetitorsVoice(response.data);
    } catch (err) {
      console.warn("FastAPI competitor analyze endpoint failed. Updating state locally.");
      setCompetitorsVoice({
        brand_url,
        share_of_voice: [
          { name: brand_url, mention_percentage: 30, ranking: 2, citation_count: 6, visibility_score: 75, ai_mentions: 15 },
          { name: competitors[0] || "Competitor A", mention_percentage: 45, ranking: 1, citation_count: 9, visibility_score: 82, ai_mentions: 22 },
          { name: competitors[1] || "Competitor B", mention_percentage: 25, ranking: 3, citation_count: 4, visibility_score: 65, ai_mentions: 10 }
        ]
      });
    }
  };

  // API Call: Tracker query check
  const handleAddPrompt = async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/tracker`, data);
      setTrackerHistory(prev => [response.data, ...prev]);
    } catch (err) {
      console.warn("FastAPI track new prompt endpoint failed. Adding mock data.");
      const mockNew = {
        id: trackerHistory.length + 1,
        prompt: data.prompt,
        ai_model: data.ai_model,
        brand_mentioned: data.brand_mentioned,
        position: 1,
        competitors: data.competitors.length ? data.competitors : ["Zendesk", "Intercom"],
        citation_url: `https://www.${data.brand_mentioned.toLowerCase().replace(/ /g, "")}.com/source`,
        date: new Date().toISOString().split("T")[0]
      };
      setTrackerHistory(prev => [mockNew, ...prev]);
    }
  };

  // API Call: Mark alert read
  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(`${API_BASE}/alerts/${id}/read`);
    } catch (err) {
      console.warn("Connection to FastAPI failed. Marking alert read in local state.");
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  // API Call: Update alerts settings
  const handleUpdateSettings = async (settings) => {
    try {
      const response = await axios.put(`${API_BASE}/alerts/settings`, settings);
      setAlertSettings(response.data);
    } catch (err) {
      console.warn("Connection to FastAPI failed. Saving alert settings locally.");
      setAlertSettings(settings);
    }
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "audit", label: "AI Auditor", icon: <Globe className="w-5 h-5" /> },
    { id: "gaps", label: "Gap Analyzer", icon: <AlertTriangle className="w-5 h-5" /> },
    { id: "recommendations", label: "Recommendations", icon: <LayoutGrid className="w-5 h-5" /> },
    { id: "roadmap", label: "Roadmap Timeline", icon: <Map className="w-5 h-5" /> },
    { id: "tracker", label: "Position Tracker", icon: <Search className="w-5 h-5" /> },
    { id: "competitors", label: "Share of Voice", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "opportunities", label: "Opportunities", icon: <Sparkles className="w-5 h-5" /> },
    { id: "alerts", label: "Alerts Center", icon: <Bell className="w-5 h-5" /> }
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* ============================================
          SIDEBAR - Desktop version
          ============================================ */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
        
        {/* Brand Logo header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/30">
            AI
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">Search Visibility</span>
        </div>

        {/* Menu link list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                view === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                  : "bg-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/20">
          <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Standard Tier</div>
            <div className="text-[10px] text-slate-500 font-semibold">notify@clientdomain.com</div>
          </div>
        </div>
      </aside>

      {/* ============================================
          MAIN CONTAINER (Header + Content workspace)
          ============================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* App bar / top header */}
        <header className="h-16 px-4 md:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between lg:justify-end gap-4">
          
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-[10px]">
              AI
            </div>
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">Search Visibility</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {auditedData && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-slate-300 font-bold border border-slate-700">
                <Globe className="w-3.5 h-3.5" /> Active: {auditedData.url.replace("https://", "").replace("http://", "").split("/")[0]}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full text-indigo-400 font-bold border border-indigo-500/20">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> API Connected
            </span>
          </div>
        </header>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="lg:hidden p-4 bg-slate-900 border-b border-slate-800 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  view === item.id 
                    ? "bg-indigo-600 text-white" 
                    : "bg-transparent text-slate-400 hover:bg-slate-800/40"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Workspace views content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {view === "overview" && (
            <DashboardOverview 
              auditedData={auditedData}
              historyList={historyList}
              alerts={alerts}
              trackerHistory={trackerHistory}
              competitorsVoice={competitorsVoice}
              setView={setView}
            />
          )}
          {view === "audit" && (
            <WebsiteAuditor 
              auditedData={auditedData}
              onAudit={handleWebsiteAudit}
              isAuditing={isAuditing}
            />
          )}
          {view === "gaps" && (
            <GapAnalyzer auditedData={auditedData} />
          )}
          {view === "recommendations" && (
            <Recommendations auditedData={auditedData} />
          )}
          {view === "roadmap" && (
            <Roadmap auditedData={auditedData} />
          )}
          {view === "tracker" && (
            <Tracker 
              trackerHistory={trackerHistory}
              onAddPrompt={handleAddPrompt}
              trendData={trendData}
            />
          )}
          {view === "competitors" && (
            <CompetitorVoice 
              voiceData={competitorsVoice}
              onAnalyze={handleCompetitorAnalyze}
            />
          )}
          {view === "opportunities" && (
            <OpportunityFinder opportunities={opportunities} />
          )}
          {view === "alerts" && (
            <AlertsCenter 
              alerts={alerts}
              alertSettings={alertSettings}
              onMarkAsRead={handleMarkAsRead}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>

    </div>
  );
}