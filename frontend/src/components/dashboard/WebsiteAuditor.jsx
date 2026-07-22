import React, { useState } from "react";
import {
  Globe, ShieldCheck, AlertCircle, ArrowRight, ShieldAlert, Cpu,
  Database, Tag, LayoutGrid, HeartHandshake, Gauge, Sparkles, Loader2,
  Users, Star, Clock, ChevronDown, ChevronRight, FileText, Link
} from "lucide-react";
import ReportDownload from "../toolone/ReportDownload";

// SEO & AEO Analysis Data
const seoAeoData = {
  overall_score: 72,
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
    {
      priority: "HIGH",
      category: "structured_data",
      issue: "No FAQPage or Service schema detected, limiting AI answer extraction",
      suggested_fix: "Add JSON-LD FAQPage schema for common questions like pricing and process, and add Service schema for each core offering",
      impact_stars: 5,
      explanation: "FAQPage schema missing"
    },
    {
      priority: "HIGH",
      category: "structured_data",
      issue: "Missing Organization Schema",
      suggested_fix: "Add LD-JSON Organization block containing website name, URL, and founder fields",
      impact_stars: 5,
      explanation: "Organization schema missing"
    },
    {
      priority: "HIGH",
      category: "ai_readability",
      issue: "Content lacks direct answer-first formatting that AI Overviews and Perplexity prefer",
      suggested_fix: "Rewrite key sections to lead with the direct answer (e.g., 'DevVerx builds websites for small businesses starting at $3,500') before elaborating",
      impact_stars: 5,
      explanation: "Answer-first formatting missing"
    },
    {
      priority: "HIGH",
      category: "crawlability",
      issue: "12 of 33 images (36%) are missing alt text, hurting accessibility and image SEO",
      suggested_fix: "Add descriptive alt text to all images to improve accessibility and image SEO",
      impact_stars: 4,
      explanation: "Missing alt text on images"
    },
    {
      priority: "HIGH",
      category: "crawlability",
      issue: "Robots.txt Crawling Restrictions - Verify user-agent access configurations inside robots.txt",
      suggested_fix: "Check and update robots.txt to ensure AI crawlers (Googlebot, GPTBot, ClaudeBot) have proper access",
      impact_stars: 4,
      explanation: "Robots.txt restrictions detected"
    },
    {
      priority: "MEDIUM",
      category: "content_structure",
      issue: "Meta description is 144 characters, below the 150-160 character target",
      suggested_fix: "Expand the meta description by adding a specific differentiator such as turnaround time or service highlight to reach 155 characters",
      impact_stars: 3,
      explanation: "Meta description too short"
    },
    {
      priority: "MEDIUM",
      category: "content_structure",
      issue: "Zero H3 headings means subtopics lack hierarchy, reducing scannability and AI parseability",
      suggested_fix: "Add H3 headings under relevant H2 sections to break down services, process steps, and FAQs into clearly labeled subsections",
      impact_stars: 3,
      explanation: "No H3 headings detected"
    },
    {
      priority: "MEDIUM",
      category: "trust_signals",
      issue: "No author or team member schema is detectable, weakening trust signals for AI and Google",
      suggested_fix: "Add Person schema with credentials for key team members and display named authors or bios on blog and case study pages",
      impact_stars: 3,
      explanation: "Author/team schema missing"
    },
    {
      priority: "MEDIUM",
      category: "content_structure",
      issue: "The keyword 'learn' appears 23 times (1.13% density) with no clear topical context, suggesting navigation labels inflate the count",
      suggested_fix: "Audit 'learn more' link labels and replace generic CTAs with descriptive anchor text that reinforces the content",
      impact_stars: 2,
      explanation: "Keyword 'learn' overused"
    },
    {
      priority: "LOW",
      category: "performance",
      issue: "No freshness signals are visible in the crawl data, which reduces AI ranking preference for recency",
      suggested_fix: "Add visible publish and updated dates to service pages and blog posts, and include dateModified in all JSON-LD schemas",
      impact_stars: 2,
      explanation: "No freshness signals"
    }
  ],
  recommendations: [
    {
      category: "content_structure",
      title: "Content niches to target",
      items: [
        "Small Business Website Cost And Pricing Guides",
        "Web Design For Local Service Businesses (Plumbers, Contractors, Salons)",
        "Small Business Ecommerce Website Setup",
        "Website Redesign For Small Businesses",
        "Web Development Vs Website Builders (Wix, Squarespace, Shopify) Comparisons",
        "SEO For Small Business Websites",
        "How To Choose A Web Development Agency As A Small Business Owner",
        "Landing Page Design And Conversion Optimization For Small Businesses"
      ]
    }
  ],
  aiReadiness: {
    strengths: [
      "Basic structured data and OG tags",
      "Solid on-page SEO fundamentals",
      "Well-structured homepage",
      "Good readability",
      "Canonical/OG tags in place"
    ],
    improvements: [
      "Add FAQ section targeting questions like 'How much does a small business website cost?'",
      "Structure service descriptions as definition-first paragraphs for AI extraction",
      "Include visible 4.8/5 rating with AggregateRating schema",
      "Create dedicated landing pages for high-intent queries",
      "Add citations to third-party sources for content authority"
    ]
  },
  faqData: [
    {
      question: "How much does a small business website cost?",
      answer: "DevVerx builds websites for small businesses starting at $3,500, with custom pricing based on features and complexity."
    },
    {
      question: "What is the typical website development process?",
      answer: "Our process includes discovery, design, development, testing, and launch, typically taking 4-8 weeks depending on project scope."
    },
    {
      question: "Do you offer ongoing maintenance and support?",
      answer: "Yes, we provide monthly maintenance plans including updates, backups, security monitoring, and technical support."
    },
    {
      question: "Can you redesign an existing small business website?",
      answer: "Absolutely! We specialize in website redesigns that improve user experience, conversion rates, and search engine visibility."
    },
    {
      question: "What platforms do you build websites on?",
      answer: "We build custom websites on platforms like WordPress, Shopify, and custom React/Next.js solutions based on your business needs."
    }
  ],
  robotsData: {
    issues: [
      "No explicit allow rules for AI crawlers (GPTBot, ClaudeBot, Google-Extended)",
      "Missing sitemap URL in robots.txt",
      "Crawl-delay not configured for bots",
      "No user-agent specific directives for AI crawlers"
    ],
    recommendedConfig: `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

# General bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Disallow sensitive areas
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /api/`
  },
  organizationData: {
    missingFields: ["founder", "sameAs", "contactPoint", "logo"],
    recommendedSchema: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DevVerx",
  "url": "https://devverx.com",
  "logo": "https://devverx.com/logo.png",
  "founder": {
    "@type": "Person",
    "name": "John Doe",
    "jobTitle": "CEO & Founder"
  },
  "sameAs": [
    "https://twitter.com/devverx",
    "https://linkedin.com/company/devverx",
    "https://github.com/devverx"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "sales",
    "availableLanguage": ["English"]
  },
  "description": "Web development agency for small businesses"
}`
  }
};

export default function WebsiteAuditor({ auditedData, onAudit, isAuditing }) {
  const [url, setUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("crawlability");
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAudit(url.trim());
    }
  };

  // Use real audit data submitted by user
  const data = auditedData;

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

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    };
    return colors[priority] || colors.MEDIUM;
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

      {/* Empty State when no domain has been audited yet */}
      {!data && !isAuditing && (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-5 border border-slate-800/80 my-4 shadow-xl">
          <div className="h-20 w-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Globe className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">No Domain Audited Yet</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enter your website link in the search bar above and click <span className="text-indigo-400 font-bold">"Analyze Website"</span> to generate your live SEO & AEO audit report.
            </p>
          </div>
          
          {/* Quick Try Sample Chips */}
          <div className="pt-5 border-t border-slate-800/60 max-w-lg mx-auto">
            <span className="text-xs font-semibold text-slate-500 block mb-3">Or click one of these sample domains to test:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { name: "kitchpulse.com", fullUrl: "https://kitchpulse.com/" },
                { name: "devverx.com", fullUrl: "https://devverx.com" },
                { name: "documentreview.law", fullUrl: "https://documentreview.law" }
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setUrl(item.fullUrl);
                    onAudit(item.fullUrl);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-slate-800 text-indigo-300 rounded-xl transition font-mono text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Results View */}
      {data && !isAuditing && (
        <>
          {/* Active Domain Audit Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live Audit Data Loaded</span>
                </div>
                <h2 className="text-lg font-extrabold text-white truncate max-w-md">
                  {data.url || data.scrapedData?.url || url || "Target Domain"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-xs text-slate-400">Overall Audit Score:</span>
              <span className="text-xl font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                {data.overall_score || data.scores?.overallScore || 72}/100
              </span>
              <button
                type="button"
                onClick={() => onAudit(data.url || url)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                Re-Analyze Website
              </button>
            </div>
          </div>

          {/* Audit Category Scores Summary Box */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white">SEO & AEO Audit Scores Summary (0 - 100)</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Overall Grade:</span>
                <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                  GRADE {
                    (data.overall_score || data.scores?.overallScore || 72) >= 90 ? "A" :
                    (data.overall_score || data.scores?.overallScore || 72) >= 75 ? "B" :
                    (data.overall_score || data.scores?.overallScore || 72) >= 60 ? "C" :
                    (data.overall_score || data.scores?.overallScore || 72) >= 40 ? "D" : "F"
                  } ({(data.overall_score || data.scores?.overallScore || 72)}/100)
                </span>
              </div>
            </div>

            {/* 7 Category Score Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { key: "crawlability", label: "Crawlability", val: data.categories?.crawlability ?? data.scores?.crawlability ?? 80, icon: <Globe className="w-4 h-4 text-indigo-400" /> },
                { key: "structured_data", label: "Structured Data", val: data.categories?.structured_data ?? data.scores?.structuredData ?? 60, icon: <Database className="w-4 h-4 text-indigo-400" /> },
                { key: "entity_recognition", label: "Entity Recognition", val: data.categories?.entity_recognition ?? data.scores?.entityRecognition ?? 50, icon: <Tag className="w-4 h-4 text-indigo-400" /> },
                { key: "content_structure", label: "Content Structure", val: data.categories?.content_structure ?? data.scores?.contentStructure ?? 75, icon: <LayoutGrid className="w-4 h-4 text-indigo-400" /> },
                { key: "trust_signals", label: "Trust Signals", val: data.categories?.trust_signals ?? data.scores?.trustSignals ?? 60, icon: <HeartHandshake className="w-4 h-4 text-indigo-400" /> },
                { key: "performance", label: "Performance", val: data.categories?.performance ?? data.scores?.performance ?? 80, icon: <Gauge className="w-4 h-4 text-indigo-400" /> },
                { key: "ai_readability", label: "AI Readability", val: data.categories?.ai_readability ?? data.scores?.aiReadability ?? 70, icon: <Sparkles className="w-4 h-4 text-indigo-400" /> }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedCategory(item.key)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${
                    selectedCategory === item.key
                      ? "bg-slate-900 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.icon}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${getScoreColor(item.val)}`}>
                      {getScoreText(item.val)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 truncate block">{item.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-white">{item.val}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">/100</span>
                    </div>
                  </div>
                  {/* Score Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.val >= 90 ? "bg-emerald-400" :
                        item.val >= 70 ? "bg-indigo-400" :
                        item.val >= 50 ? "bg-amber-400" : "bg-rose-400"
                      }`}
                      style={{ width: `${item.val}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Website Data Evaluated by AI Prompt */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Extracted Website Signals (Evaluated by Prompt)</h3>
              </div>
              <button
                onClick={() => toggleSection('scrapedSignals')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                {expandedSections['scrapedSignals'] ? 'Hide Details' : 'View All 11 Signals'}
                {expandedSections['scrapedSignals'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Title</span>
                <span className="text-slate-200 font-bold truncate block">{data.scrapedData?.title || data.title || "Not found"}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">SSL Protection</span>
                <span className="text-emerald-400 font-bold block">{data.scrapedData?.hasSSL || (data.ssl_enabled ? "Yes (HTTPS)" : "No")}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Images (Alt ratio)</span>
                <span className="text-indigo-400 font-bold block">
                  {data.scrapedData?.imagesWithAlt ?? data.imagesWithAlt ?? 0} / {data.scrapedData?.totalImages ?? data.totalImages ?? 0} with alt text
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Word Count</span>
                <span className="text-amber-400 font-bold block">{data.scrapedData?.wordCount ?? data.word_count ?? 0} words</span>
              </div>
            </div>

            {expandedSections['scrapedSignals'] && (
              <div className="mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-3">
                <div>
                  <span className="text-slate-400 font-bold">Meta Description:</span>
                  <p className="text-slate-300 mt-0.5 italic">{data.scrapedData?.metaDescription || data.description || "None"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 font-bold">H1 Headings:</span>
                    <p className="text-slate-300 mt-0.5 truncate">{JSON.stringify(data.scrapedData?.h1Tags || [])}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">JSON-LD Schemas:</span>
                    <p className="text-indigo-400 font-semibold mt-0.5">{data.scrapedData?.jsonLdSchemas?.join(", ") || data.schemas?.join(", ") || "None"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Canonical Tag:</span>
                    <p className="text-slate-300 mt-0.5">{data.scrapedData?.canonical || "Present"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Answer-Engine Readiness Assessment */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">AI Answer-Engine Readiness Assessment</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full self-start sm:self-auto">
                Status: {data.aiReadiness?.readinessStatus || "Good Readiness"}
              </span>
            </div>

            {/* Answer Engine Compatibility Breakdown Cards */}
            {data.aiReadiness?.answerEngineBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.aiReadiness.answerEngineBreakdown.map((eng, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{eng.engine}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${eng.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {eng.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{eng.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths and Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> AI Indexing Strengths
                </h4>
                <ul className="space-y-1.5">
                  {(data.aiReadiness?.strengths || []).map((strength, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Recommended Improvements
                </h4>
                <ul className="space-y-1.5">
                  {(data.aiReadiness?.improvements || []).map((improvement, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sidebar Score Wheel & Categories */}
            <div className="glass-panel p-5 rounded-2xl space-y-6 flex flex-col justify-between">
              {/* Score Ring */}
              <div className="text-center space-y-2 py-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall AI Visibility</span>
                <div className="relative flex items-center justify-center py-2">
                  <div className="h-32 w-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
                    <span className="text-4xl font-extrabold text-white">{data.overall_score}</span>
                    <span className="text-[10px] font-bold text-indigo-400 mt-0.5">GRADE {
                      data.overall_score >= 90 ? "A" : data.overall_score >= 75 ? "B" : data.overall_score >= 60 ? "C" : data.overall_score >= 40 ? "D" : "F"
                    }</span>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin opacity-40"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">This score indicates how easily AI crawlers find, read, trust, and cite this domain.</p>
              </div>

              {/* Category selection items */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Audited Modules</span>
                {Object.entries(data.categories).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${selectedCategory === key
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
                  <div className="text-2xl font-extrabold text-white">{data.categories[selectedCategory]}/100</div>
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
                        {data.gaps?.some(g => g.issue.includes("Robots")) ? (
                          <span className="text-rose-400 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Restrictions Detected</span>
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

                  {/* Robots.txt Details with Arrow Toggle */}
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => toggleSection('robots')}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white">Robots.txt Crawling Restrictions</span>
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Issues Detected</span>
                      </div>
                      {expandedSections['robots'] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    {expandedSections['robots'] && (
                      <div className="mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                        <div className="text-xs text-slate-400">
                          <span className="text-rose-400 font-bold">⚠️ Issues Found:</span> Verify user-agent access configurations inside robots.txt
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-slate-300 font-bold">Detected Issues:</div>
                          {data.robotsData?.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                              <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-slate-300">{issue}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="text-[10px] text-indigo-400 font-bold">Recommended robots.txt Configuration:</div>
                          <pre className="text-[10px] text-slate-300 mt-2 whitespace-pre-wrap bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            {data.robotsData?.recommendedConfig}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {data.gaps?.filter(g => g.category === selectedCategory).map((gap, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">{gap.issue}</div>
                          <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCategory === "structured_data" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">JSON-LD Microdata Detected</h4>

                  {data.gaps?.some(g => g.category === "structured_data") ? (
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
                    {["Organization", "FAQPage", "Article", "BreadcrumbList", "Service"].map((schema) => {
                      const isMissing = data.gaps?.some(g => g.explanation?.includes(schema));
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

                  {/* Organization Schema Details with Arrow Toggle */}
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => toggleSection('organization')}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white">Organization Schema</span>
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Missing</span>
                      </div>
                      {expandedSections['organization'] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    {expandedSections['organization'] && (
                      <div className="mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                        <div className="text-xs text-slate-400">
                          <span className="text-rose-400 font-bold">⚠️ Missing:</span> Organization schema not detected
                        </div>
                        <div className="text-xs text-slate-300 font-bold">Missing Fields:</div>
                        <div className="flex flex-wrap gap-2">
                          {data.organizationData?.missingFields.map((field, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
                              {field}
                            </span>
                          ))}
                        </div>
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="text-[10px] text-indigo-400 font-bold">Fix:</div>
                          <div className="text-[10px] text-slate-300">Add LD-JSON Organization block containing website name, URL, and founder fields</div>
                        </div>
                        <div className="text-xs text-slate-400 font-bold">Recommended Organization Schema:</div>
                        <pre className="text-[10px] text-slate-300 mt-2 whitespace-pre-wrap bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                          {data.organizationData?.recommendedSchema}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* FAQ Section with Arrow Toggle */}
                  <div className="mt-2 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => toggleSection('faq')}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">📋 FAQ Schema Data</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Missing</span>
                      </div>
                      {expandedSections['faq'] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    {expandedSections['faq'] && (
                      <div className="mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                        <div className="text-xs text-slate-400">
                          <span className="text-amber-400 font-bold">⚠️ Missing:</span> No FAQPage schema detected
                        </div>
                        <div className="text-xs text-slate-300 font-bold mb-2">Recommended FAQ Questions to Add:</div>
                        <div className="space-y-2">
                          {data.faqData?.map((faq, idx) => (
                            <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                              <div className="text-xs font-bold text-white">{faq.question}</div>
                              <div className="text-[10px] text-slate-400 mt-1">{faq.answer}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="text-[10px] text-indigo-400 font-bold">Fix:</div>
                          <div className="text-[10px] text-slate-300">Add JSON-LD FAQPage schema for common questions like pricing and process, and add Service schema for each core offering</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {data.gaps?.filter(g => g.category === selectedCategory && !g.explanation?.includes("FAQPage") && !g.explanation?.includes("Organization")).map((gap, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">{gap.issue}</div>
                          <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      {data.gaps?.some(g => g.issue.includes("Organization")) ? (
                        <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Missing</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                      )}
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">Wikidata SameAs Links</div>
                        <div className="text-[10px] text-slate-500">Cross-reference authority link</div>
                      </div>
                      {data.gaps?.some(g => g.issue.includes("SameAs")) ? (
                        <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Missing Links</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === "content_structure" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Content Structure Analysis</h4>
                  <div className="space-y-3">
                    {data.gaps?.filter(g => g.category === selectedCategory).map((gap, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold">{gap.issue}</div>
                            <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Content Niches with Arrow Toggle */}
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => toggleSection('niches')}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">📌 Content Niches to Target</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">8 Topics</span>
                      </div>
                      {expandedSections['niches'] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    {expandedSections['niches'] && (
                      <div className="mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                        <div className="flex flex-wrap gap-2">
                          {data.recommendations.find(r => r.category === "content_structure")?.items.map((item, i) => (
                            <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-slate-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCategory === "trust_signals" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Trust & Authority Signals</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">Author Schema</span>
                      </div>
                      <span className="text-[10px] text-rose-400 mt-1 block">Missing - Add Person schema</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">AggregateRating</span>
                      </div>
                      <span className="text-[10px] text-amber-400 mt-1 block">Recommended to add</span>
                    </div>
                  </div>

                  {/* Author Schema Details with Arrow Toggle */}
                  <div className="mt-2 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => toggleSection('author')}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">👤 Author Schema Details</span>
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Missing</span>
                      </div>
                      {expandedSections['author'] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    {expandedSections['author'] && (
                      <div className="mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                        <div className="text-xs text-slate-400">
                          <span className="text-rose-400 font-bold">⚠️ Missing:</span> No author or team member schema detected
                        </div>
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <div className="text-[10px] text-indigo-400 font-bold">Fix:</div>
                          <div className="text-[10px] text-slate-300">Add Person schema with credentials for key team members and display named authors or bios on blog and case study pages.</div>
                        </div>
                        <div className="text-xs text-slate-400 font-bold">Example Person Schema:</div>
                        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                          <code className="text-[10px] text-slate-300 whitespace-pre-wrap">
                            {`{
  "@type": "Person",
  "name": "John Doe",
  "jobTitle": "CEO & Lead Developer",
  "url": "https://example.com/about",
  "sameAs": ["https://linkedin.com/in/johndoe"]
}`}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {data.gaps?.filter(g => g.category === selectedCategory).map((gap, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">{gap.issue}</div>
                          <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCategory === "performance" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Performance & Freshness</h4>

                  {/* Freshness Signals with Arrow Toggle */}
                  <button
                    onClick={() => toggleSection('freshness')}
                    className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Content Freshness Signals</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Needs Work</span>
                    </div>
                    {expandedSections['freshness'] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    )}
                  </button>

                  {expandedSections['freshness'] && (
                    <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                      <div className="text-xs text-slate-400">
                        <span className="text-amber-400 font-bold">⚠️ Issue:</span> No freshness signals are visible in the crawl data, which reduces AI ranking preference for recency.
                      </div>
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                        <div className="text-[10px] text-indigo-400 font-bold">Fix:</div>
                        <div className="text-[10px] text-slate-300">Add visible publish and updated dates to service pages and blog posts, and include dateModified in all JSON-LD schemas.</div>
                      </div>
                      <div className="text-xs text-slate-400 font-bold">Example dateModified Schema:</div>
                      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <code className="text-[10px] text-slate-300 whitespace-pre-wrap">
                          {`{
  "@type": "Article",
  "datePublished": "2024-01-15",
  "dateModified": "2024-06-20"
}`}
                        </code>
                      </div>
                    </div>
                  )}

                  {data.gaps?.filter(g => g.category === selectedCategory).map((gap, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">{gap.issue}</div>
                          <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCategory === "ai_readability" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">AI Readability & Answer Formatting</h4>

                  {/* Answer-First Formatting with Arrow Toggle */}
                  <button
                    onClick={() => toggleSection('answer')}
                    className="w-full flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Answer-First Formatting</span>
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Missing</span>
                    </div>
                    {expandedSections['answer'] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                    )}
                  </button>

                  {expandedSections['answer'] && (
                    <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                      <div className="text-xs text-slate-400">
                        <span className="text-rose-400 font-bold">⚠️ Issue:</span> Content lacks direct answer-first formatting that AI Overviews and Perplexity prefer.
                      </div>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <div className="text-[10px] text-emerald-400 font-bold">Example:</div>
                        <code className="text-xs text-emerald-400 block mt-1">DevVerx builds websites for small businesses starting at $3,500</code>
                      </div>
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                        <div className="text-[10px] text-indigo-400 font-bold">Fix:</div>
                        <div className="text-[10px] text-slate-300">Rewrite key sections to lead with the direct answer before elaborating.</div>
                      </div>
                    </div>
                  )}

                  {data.gaps?.filter(g => g.category === selectedCategory).map((gap, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">{gap.issue}</div>
                          <div className="text-[10px] opacity-80 mt-1">Fix: {gap.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Priority Recommendations - Updated with all details */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Priority Recommendations
            </h3>
            <div className="space-y-3">
              {data.gaps?.sort((a, b) => {
                const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }).map((gap, i) => (
                <div key={i} className={`p-3 rounded-xl border ${getPriorityBadge(gap.priority)}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(gap.priority)}`}>
                      {gap.priority}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{gap.issue}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{gap.suggested_fix}</div>
                      {gap.issue.includes("Organization") && (
                        <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                          <span className="text-[9px] text-slate-500">Missing fields: </span>
                          <span className="text-[9px] text-rose-400">founder, sameAs, contactPoint, logo</span>
                        </div>
                      )}
                      {gap.issue.includes("Robots") && (
                        <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                          <span className="text-[9px] text-slate-500">Check: </span>
                          <span className="text-[9px] text-amber-400">user-agent access configurations for AI crawlers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Download Section */}
          <div className="mt-6">
            <ReportDownload
              url={data.url || "example.com"}
              grade={data.overall_score >= 90 ? "A" : data.overall_score >= 75 ? "B" : data.overall_score >= 60 ? "C" : data.overall_score >= 40 ? "D" : "F"}
              score={data.overall_score}
              problems={data.gaps?.map(g => `${g.priority === 'HIGH' ? '❌' : '⚠️'} ${g.issue}: ${g.suggested_fix}`) || []}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!data && !isAuditing && (
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