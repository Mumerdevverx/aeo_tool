import React, { useState } from "react";
import { 
  Bell, CheckCircle2, ShieldCheck, Mail, ShieldAlert, Cpu, 
  TrendingUp, Search, ExternalLink, Settings, Save, Sparkles, Loader2 
} from "lucide-react";

export default function AlertsCenter({ 
  alerts, 
  alertSettings, 
  onMarkAsRead, 
  onUpdateSettings 
}) {
  const [visChanges, setVisChanges] = useState(alertSettings.visibility_changes);
  const [compMentions, setCompMentions] = useState(alertSettings.competitor_mentions);
  const [citOpps, setCitOpps] = useState(alertSettings.citation_opportunities);
  const [emailDigests, setEmailDigests] = useState(alertSettings.email_digests);
  const [emailAddress, setEmailAddress] = useState(alertSettings.email_address);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateSettings({
      visibility_changes: visChanges,
      competitor_mentions: compMentions,
      citation_opportunities: citOpps,
      email_digests: emailDigests,
      email_address: emailAddress
    });
    setSaving(false);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "visibility_increased": 
        return (
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
        );
      case "ranking_changed": 
        return (
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Search className="w-4.5 h-4.5" />
          </div>
        );
      case "competitor_gained": 
        return (
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
        );
      default: 
        return (
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Alerts & Monitoring</h1>
        <p className="text-slate-400 mt-1">Configure crawling alert triggers and read active brand visibility notification logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex justify-between items-center bg-slate-900/40">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Notifications Feed
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {alerts.filter(a => !a.read).length} Unread Alerts
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  alert.read 
                    ? "bg-slate-900/20 border-slate-900/60 opacity-80" 
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-md"
                }`}
              >
                {getAlertIcon(alert.type)}
                
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <span className="text-[10px] text-slate-500 font-semibold">{alert.date}</span>
                    </div>
                    
                    {!alert.read && (
                      <button 
                        onClick={() => onMarkAsRead(alert.id)}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-bold rounded-lg transition"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed font-medium">{alert.message}</p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="glass-panel p-5 rounded-2xl h-fit space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Alert Settings
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Visibility Drops</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Notify when score falls &gt; 5%</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={visChanges} 
                  onChange={(e) => setVisChanges(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Competitor Mentions</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Log when competitors rise in voice share</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={compMentions} 
                  onChange={(e) => setCompMentions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Citation Opportunities</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Highlight missing schema triggers</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={citOpps} 
                  onChange={(e) => setCitOpps(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Email Digests</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Receive weekly PDF email reports</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailDigests} 
                  onChange={(e) => setEmailDigests(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-800"
                />
              </label>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Alert Destination
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="notify@domain.com"
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Settings
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
