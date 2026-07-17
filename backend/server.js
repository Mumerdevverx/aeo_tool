// ============================================================
// AI Search Visibility Auditor — Node.js / Express Backend
// Endpoints mirror the FastAPI spec so the React frontend
// works without any changes.
// ============================================================

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import fetch from 'node-fetch'
import { load as cheerioLoad } from 'cheerio'

const app = express()
app.use(cors())
app.use(express.json({ limit: '20mb' }))

// ─────────────────────────────────────────
// ENV
// ─────────────────────────────────────────
const PORT = Number(process.env.PORT || 8001)
const COHERE_API_KEY = process.env.COHERE_API_KEY || ''
const EMAIL_USER = process.env.EMAIL_USER || ''
const EMAIL_PASS = process.env.EMAIL_PASS || ''

// ─────────────────────────────────────────
// IN-MEMORY STORES
// ─────────────────────────────────────────
const auditCache = new Map()
const trackerHistory = [
  { id: 1, prompt: 'What is the best customer support software for startups?', ai_model: 'ChatGPT', brand_mentioned: 'HelpScout', position: 2, competitors: ['Zendesk', 'Intercom', 'Freshdesk'], citation_url: 'https://www.helpscout.com/startup-pricing/', date: '2026-07-10' },
  { id: 2, prompt: 'Which AI coding assistants support offline models?', ai_model: 'Gemini', brand_mentioned: 'Continue.dev', position: 1, competitors: ['Copilot', 'Tabnine'], citation_url: 'https://github.com/continuedev/continue', date: '2026-07-12' },
  { id: 3, prompt: 'Top security compliance automation tools for SOC2', ai_model: 'Claude', brand_mentioned: 'Vanta', position: 1, competitors: ['Drata', 'Secureframe'], citation_url: 'https://www.vanta.com/soc-2', date: '2026-07-14' },
  { id: 4, prompt: 'Compare lightweight React state management libraries', ai_model: 'Perplexity', brand_mentioned: 'Zustand', position: 2, competitors: ['Jotai', 'Recoil'], citation_url: 'https://zustand-demo.pmnd.rs/', date: '2026-07-15' },
  { id: 5, prompt: 'Best headless CMS for Next.js in 2026', ai_model: 'Google AI Overviews', brand_mentioned: 'Sanity.io', position: 3, competitors: ['Contentful', 'Strapi'], citation_url: 'https://www.sanity.io/headless-cms-nextjs', date: '2026-07-15' }
]
const alertsList = [
  { id: 'alert-1', title: 'AI Visibility Surge (+8%)', message: "Brand mentions surged 8% on Claude 3.5 Sonnet queries related to compliance.", type: 'visibility_increased', date: '2026-07-15 14:10', read: false },
  { id: 'alert-2', title: 'Prompt Position Changed (#3 to #1)', message: "Your prompt rose to position #1 on Gemini.", type: 'ranking_changed', date: '2026-07-14 09:45', read: false },
  { id: 'alert-3', title: 'Competitor Gained Mentions (+12%)', message: "Competitor A mentions rose 12% in ChatGPT queries.", type: 'competitor_gained', date: '2026-07-13 18:22', read: true },
  { id: 'alert-4', title: 'New Citation Opportunity', message: "High authority sitemap found competitor cited in Perplexity. Add FAQ schema to contest.", type: 'citation_opportunity', date: '2026-07-12 11:05', read: true }
]
let alertSettings = {
  visibility_changes: true, competitor_mentions: true, citation_opportunities: true,
  email_digests: false, email_address: 'notify@clientdomain.com'
}
let competitorData = {
  brand_url: 'yourdomain.com',
  share_of_voice: [
    { name: 'Your Brand', mention_percentage: 28, ranking: 3, citation_count: 6, visibility_score: 75, ai_mentions: 14 },
    { name: 'Competitor A', mention_percentage: 36, ranking: 1, citation_count: 10, visibility_score: 84, ai_mentions: 25 },
    { name: 'Competitor B', mention_percentage: 22, ranking: 2, citation_count: 8, visibility_score: 78, ai_mentions: 18 },
    { name: 'Competitor C', mention_percentage: 14, ranking: 4, citation_count: 4, visibility_score: 60, ai_mentions: 8 }
  ]
}
const defaultOpportunities = [
  { title: 'FAQ AI Snippet Optimization', description: 'Create answer-first blocks and add FAQ Schema.', impact: 'HIGH', potential_gain: '+15% Visibility', type: 'faq' },
  { title: 'Missing Trust Brand Entity', description: 'Add Organization JSON-LD schema to anchor AI brand knowledge.', impact: 'HIGH', potential_gain: '+20% Trust', type: 'entity' },
  { title: 'Content Cluster Internal Linking', description: 'Link landing pages to semantic resource hubs with rich anchors.', impact: 'MEDIUM', potential_gain: '+8% Crawl Rate', type: 'internal_link' },
  { title: 'Social Proof Citation Acquisition', description: 'Get listed on Trustpilot or G2 so AI crawlers pick citations.', impact: 'HIGH', potential_gain: '+12% Citations', type: 'citation' },
  { title: "Robots.txt AI Bot Clearance", description: 'Enable GPTBot and ClaudeBot in robots.txt for full crawling.', impact: 'HIGH', potential_gain: '+25% Index Rate', type: 'schema' }
]
const trendData = [
  { date: 'June 01', ChatGPT: 62, Gemini: 45, Claude: 50, Perplexity: 55 },
  { date: 'June 10', ChatGPT: 65, Gemini: 48, Claude: 52, Perplexity: 58 },
  { date: 'June 20', ChatGPT: 68, Gemini: 55, Claude: 60, Perplexity: 62 },
  { date: 'July 01', ChatGPT: 70, Gemini: 58, Claude: 63, Perplexity: 65 },
  { date: 'July 10', ChatGPT: 75, Gemini: 62, Claude: 68, Perplexity: 70 },
  { date: 'July 15', ChatGPT: 78, Gemini: 65, Claude: 72, Perplexity: 75 }
]

// ─────────────────────────────────────────
// SCRAPER  — fetch URL and extract signals
// ─────────────────────────────────────────
async function scrapeWebsite(url) {
  const result = {
    url, ssl_enabled: url.startsWith('https://'),
    status_code: 200, load_time_ms: 0,
    title: '', description: '',
    robots_txt: { found: false, blocks_ai: false },
    sitemap_xml: { found: false },
    canonical: { found: false, matches: false },
    indexing: { noindex: false },
    schemas: [], entities: { brand_mentions: [], same_as: [], founder_mentions: [] },
    content_structure: { headings: [], faq_count: 0, word_count: 0, semantic_html: {} },
    trust_signals: { about_link: false, contact_link: false, testimonials_found: false, reviews_found: false },
    performance: { page_size_kb: 0, speed_grade: 'B' }
  }

  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  const base = new URL(url).origin

  // robots.txt
  try {
    const rb = await fetch(`${base}/robots.txt`, { headers, signal: AbortSignal.timeout(8000) })
    if (rb.ok) {
      const txt = await rb.text()
      result.robots_txt.found = true
      const aiBots = ['gptbot', 'chatgpt-user', 'google-extended', 'claudebot', 'perplexitybot']
      let curAgent = ''
      for (const line of txt.toLowerCase().split('\n')) {
        const l = line.trim()
        if (l.startsWith('user-agent:')) curAgent = l.replace('user-agent:', '').trim()
        else if (l.startsWith('disallow: /') || l === 'disallow:/') {
          if (aiBots.some(b => curAgent.includes(b))) result.robots_txt.blocks_ai = true
        }
        if (l.startsWith('sitemap:')) result.sitemap_xml.found = true
      }
    }
  } catch (_) { }

  // Main page
  const start = Date.now()
  let html = ''
  try {
    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(12000) })
    result.load_time_ms = Date.now() - start
    result.status_code = resp.status
    html = await resp.text()
    result.performance.page_size_kb = +(html.length / 1024).toFixed(2)
  } catch (e) {
    result.status_code = 500
    result.load_time_ms = Date.now() - start
    return result
  }

  if (result.status_code !== 200) return result

  const $ = cheerioLoad(html)

  result.title = $('title').first().text().trim()
  result.description = $('meta[name="description"]').attr('content') || ''

  // Canonical
  const canon = $('link[rel="canonical"]').attr('href')
  if (canon) { result.canonical.found = true; result.canonical.matches = canon.replace(/\/$/, '') === url.replace(/\/$/, '') }

  // noindex
  const robotsMeta = $('meta[name="robots"]').attr('content') || ''
  if (robotsMeta.toLowerCase().includes('noindex')) result.indexing.noindex = true

  // Schemas
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const obj = JSON.parse($(el).html())
      const extract = o => {
        if (!o) return
        if (Array.isArray(o)) { o.forEach(extract); return }
        if (o['@type']) {
          const t = Array.isArray(o['@type']) ? o['@type'] : [o['@type']]
          result.schemas.push(...t)
          if (['Organization', 'Corporation', 'LocalBusiness', 'Brand'].includes(t[0])) {
            if (o.name) result.entities.brand_mentions.push(o.name)
            if (o.sameAs) result.entities.same_as.push(...(Array.isArray(o.sameAs) ? o.sameAs : [o.sameAs]))
          }
        }
        Object.values(o).filter(v => v && typeof v === 'object').forEach(extract)
      }
      extract(obj)
    } catch (_) { }
  })
  result.schemas = [...new Set(result.schemas)]
  result.entities.brand_mentions = [...new Set(result.entities.brand_mentions)]
  result.entities.same_as = [...new Set(result.entities.same_as)]

  // Headings
  $('h1,h2,h3,h4,h5,h6').each((_, el) => {
    result.content_structure.headings.push({ tag: el.tagName.toUpperCase(), text: $(el).text().trim() })
  })

  // Word count
  result.content_structure.word_count = ($('body').text() || '').split(/\s+/).length

  // FAQ
  const faqSchema = result.schemas.filter(s => s.toLowerCase().includes('faq')).length
  const faqEls = $('[class*="faq"],[class*="accordion"],[class*="question"]').length
  result.content_structure.faq_count = faqSchema + Math.floor(faqEls / 2)

  // Semantic tags
  for (const tag of ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'])
    result.content_structure.semantic_html[tag] = $(tag).length > 0

  // Trust signals
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').toLowerCase()
    const txt = $(el).text().toLowerCase()
    if (href.includes('about') || txt.includes('about')) result.trust_signals.about_link = true
    if (href.includes('contact') || txt.includes('contact')) result.trust_signals.contact_link = true
  })
  const bodyText = $('body').text().toLowerCase()
  if (bodyText.includes('testimonial') || bodyText.includes('what our customers')) result.trust_signals.testimonials_found = true
  if (bodyText.includes('review') || bodyText.includes('trustpilot') || bodyText.includes('g2')) result.trust_signals.reviews_found = true

  // Speed grade
  const ms = result.load_time_ms
  result.performance.speed_grade = ms < 600 ? 'A' : ms < 1500 ? 'B' : ms < 2500 ? 'C' : ms < 4000 ? 'D' : 'F'

  return result
}

// ─────────────────────────────────────────
// LOCAL RULE ENGINE  (Cohere fallback)
// ─────────────────────────────────────────
function localAudit(scan) {
  // Crawlability
  let crawl = 100, crawlIssues = []
  if (scan.robots_txt.blocks_ai) { crawl -= 40; crawlIssues.push({ issue: 'AI Crawlers Blocked', explanation: 'robots.txt disallows AI bots.', why_ai_cares: 'AI cannot scan pages that are disallowed.', impact_stars: 5, difficulty: 'Easy', gain: '+25%', suggested_fix: "Remove disallow rules for GPTBot, ClaudeBot in robots.txt." }) }
  if (!scan.sitemap_xml.found) { crawl -= 15; crawlIssues.push({ issue: 'Missing Sitemap Declaration', explanation: 'No sitemap reference found.', why_ai_cares: 'AI indexers rely on sitemaps to discover pages fast.', impact_stars: 3, difficulty: 'Easy', gain: '+10%', suggested_fix: "Add 'Sitemap: https://yourdomain.com/sitemap.xml' to robots.txt." }) }
  if (!scan.canonical.found) { crawl -= 20; crawlIssues.push({ issue: 'Missing Canonical Tag', explanation: 'No canonical URL defined.', why_ai_cares: 'Without canonical AI cannot determine authoritative source.', impact_stars: 4, difficulty: 'Easy', gain: '+15%', suggested_fix: "Add <link rel='canonical' href='...'> inside <head>." }) }
  if (scan.indexing.noindex) { crawl -= 50; crawlIssues.push({ issue: 'Noindex Directive Active', explanation: 'Page is blocked from indexing.', why_ai_cares: 'AI models cannot store blocked content.', impact_stars: 5, difficulty: 'Easy', gain: '+35%', suggested_fix: "Remove noindex from meta robots tag." }) }
  crawl = Math.max(10, crawl)

  // Schema
  const schemaLower = scan.schemas.map(s => s.toLowerCase())
  const schemaChecks = [
    { key: 'organization', types: ['organization', 'corporation', 'localbusiness'], val: 25, name: 'Organization Schema' },
    { key: 'faq', types: ['faqpage', 'question'], val: 20, name: 'FAQ Schema' },
    { key: 'article', types: ['article', 'newsarticle', 'blogposting'], val: 20, name: 'Article Schema' },
    { key: 'service', types: ['service'], val: 15, name: 'Service Schema' },
    { key: 'breadcrumb', types: ['breadcrumblist', 'breadcrumb'], val: 10, name: 'Breadcrumb Schema' }
  ]
  let schemaScore = 0, missingSchemas = []
  for (const c of schemaChecks) {
    if (c.types.some(t => schemaLower.some(s => s.includes(t)))) schemaScore += c.val
    else missingSchemas.push(c.name)
  }
  const schemaIssues = missingSchemas.length ? [{
    issue: `Missing Schema: ${missingSchemas.slice(0, 2).join(', ')}`, explanation: `Missing JSON-LD: ${missingSchemas.join(', ')}.`,
    why_ai_cares: 'Structured schema is the primary way AI parses metadata.', impact_stars: 4, difficulty: 'Medium', gain: '+18%',
    suggested_fix: 'Add Organization and FAQ JSON-LD blocks in your <head>.'
  }] : []
  schemaScore = Math.max(10, schemaScore)

  // Entity
  let entity = 30, entityIssues = []
  if (scan.entities.brand_mentions.length) entity += 25
  else entityIssues.push({ issue: 'No Brand Entity', explanation: 'No Organization schema with name found.', why_ai_cares: 'AI cannot link facts to your brand without entity declaration.', impact_stars: 5, difficulty: 'Medium', gain: '+20%', suggested_fix: 'Add name field inside Organization LD+JSON.' })
  if (scan.entities.same_as.length) entity += 30
  else entityIssues.push({ issue: 'Missing SameAs Links', explanation: 'No social/Wikidata links in schema.', why_ai_cares: 'SameAs links prove cross-web identity to AI systems.', impact_stars: 4, difficulty: 'Easy', gain: '+15%', suggested_fix: 'Add LinkedIn, Twitter, Wikipedia links as sameAs in schema.' })
  entity = Math.max(10, Math.min(100, entity))

  // Content
  let content = 40, contentIssues = []
  const hasH1 = scan.content_structure.headings.some(h => h.tag === 'H1')
  if (hasH1) content += 20
  else contentIssues.push({ issue: 'Missing H1 Tag', explanation: 'No H1 heading found on page.', why_ai_cares: 'H1 establishes topical theme for AI parsers.', impact_stars: 4, difficulty: 'Easy', gain: '+12%', suggested_fix: 'Add one descriptive <h1> tag to your main content.' })
  const semRatio = Object.values(scan.content_structure.semantic_html).filter(Boolean).length / 7
  content += Math.round(semRatio * 20)
  if (scan.content_structure.word_count > 600) content += 20
  if (scan.content_structure.faq_count > 0) content += 20
  else contentIssues.push({ issue: 'No FAQ Section', explanation: 'No FAQ schema or content blocks found.', why_ai_cares: 'Most LLM queries are question-based. FAQs feed direct answers.', impact_stars: 4, difficulty: 'Easy', gain: '+15%', suggested_fix: 'Add an FAQ section with FAQ Schema markup.' })
  content = Math.max(20, Math.min(100, content))

  // Trust
  let trust = 20, trustIssues = []
  if (scan.trust_signals.about_link) trust += 25
  else trustIssues.push({ issue: "No 'About' Page Link", explanation: 'About page link not detected.', why_ai_cares: 'AI needs org context to evaluate E-E-A-T.', impact_stars: 4, difficulty: 'Easy', gain: '+10%', suggested_fix: "Add 'About' link to your site navigation." })
  if (scan.trust_signals.contact_link) trust += 25
  if (scan.trust_signals.testimonials_found) trust += 25
  else trustIssues.push({ issue: 'No Testimonials', explanation: 'No testimonial text found.', why_ai_cares: 'AI ranks services based on user sentiment.', impact_stars: 3, difficulty: 'Medium', gain: '+8%', suggested_fix: 'Add customer testimonial quotes to landing pages.' })
  if (scan.trust_signals.reviews_found) trust += 25
  trust = Math.max(10, Math.min(100, trust))

  // Performance
  const perfMap = { A: 100, B: 85, C: 70, D: 50, F: 30 }
  const perf = perfMap[scan.performance.speed_grade] || 70
  const perfIssues = ['D', 'F'].includes(scan.performance.speed_grade) ? [{
    issue: 'Poor Page Speed', explanation: `Load time: ${scan.load_time_ms}ms.`, why_ai_cares: 'Slow pages time out during AI crawl sessions.', impact_stars: 4, difficulty: 'Medium', gain: '+14%', suggested_fix: 'Enable gzip, compress images, use a CDN.'
  }] : []

  // AI Readability
  const readability = Math.round((content + schemaScore) / 2)

  const overall = Math.round((crawl + schemaScore + entity + content + trust + perf + readability) / 7)

  const allIssues = [...crawlIssues, ...schemaIssues, ...entityIssues, ...contentIssues, ...trustIssues, ...perfIssues]
  const sorted = [...allIssues].sort((a, b) => b.impact_stars - a.impact_stars)

  const recommendations = sorted.map((g, i) => ({
    id: `rec-${i + 1}`, issue: g.issue, why_ai_cares: g.why_ai_cares,
    business_impact: `Improves AI entity confidence and citation likelihood. Impact: ${g.impact_stars}/5.`,
    difficulty: g.difficulty, gain: `${g.gain} AI visibility`, affected_pages: [scan.url],
    implementation_steps: [`Verify: ${g.explanation}`, g.suggested_fix, 'Validate with Google Rich Results Test.'],
    priority: g.impact_stars >= 4 ? 'HIGH' : g.impact_stars >= 3 ? 'MEDIUM' : 'LOW'
  }))

  const roadmap = {
    immediate_fixes: sorted.filter(g => g.impact_stars >= 4 && g.difficulty === 'Easy').map(g => g.issue),
    quick_wins: sorted.filter(g => g.impact_stars >= 3 && g.difficulty === 'Easy').map(g => g.issue),
    high_impact: sorted.filter(g => g.difficulty === 'Medium').map(g => g.issue),
    long_term: ['Publish Case Studies & Reviews', 'Build semantic content clusters'],
    timeline_weeks: '4 Weeks',
    expected_score_improvement: '+18%'
  }
  if (!roadmap.immediate_fixes.length) roadmap.immediate_fixes = ['Configure AI Bot Access in robots.txt']
  if (!roadmap.quick_wins.length) roadmap.quick_wins = ['Deploy Organization JSON-LD Schema']
  if (!roadmap.high_impact.length) roadmap.high_impact = ['Build FAQ Content Clusters']

  const opportunities = []
  if (!scan.content_structure.faq_count) opportunities.push({ title: 'FAQ Snippet Optimization', description: 'Add FAQ schema to capture LLM question queries.', impact: 'HIGH', potential_gain: '+15% Visibility', type: 'faq' })
  if (!scan.entities.brand_mentions.length) opportunities.push({ title: 'Brand Entity Declaration', description: 'Add Organization JSON-LD to anchor brand identity.', impact: 'HIGH', potential_gain: '+20% Trust', type: 'entity' })
  if (!scan.trust_signals.reviews_found) opportunities.push({ title: 'Social Proof Citations', description: 'List on G2 or Trustpilot for AI citation authority.', impact: 'HIGH', potential_gain: '+12% Citations', type: 'citation' })
  opportunities.push({ title: 'Internal Linking Clusters', description: 'Link landing pages to semantic hubs.', impact: 'MEDIUM', potential_gain: '+8% Crawl Rate', type: 'internal_link' })

  return {
    overall_score: overall,
    categories: { crawlability: crawl, structured_data: schemaScore, entity_recognition: entity, content_structure: content, trust_signals: trust, performance: perf, ai_readability: readability },
    gaps: allIssues,
    recommendations: recommendations,
    roadmap: roadmap,
    opportunities: opportunities
  }
}

// ─────────────────────────────────────────
// COHERE AI ANALYSIS  (with local fallback)
// ─────────────────────────────────────────
async function analyzeWithCohere(scan) {
  const fallback = localAudit(scan)
  if (!COHERE_API_KEY) return fallback

  try {
    const prompt = `You are an expert AI Search engine auditor.
Analyze the following website scan data and return a JSON audit. Output ONLY raw JSON — no markdown, no explanation.

Scan:
${JSON.stringify(scan, null, 2)}

Return exactly this shape:
{
  "overall_score": <0-100>,
  "categories": { "crawlability":<0-100>, "structured_data":<0-100>, "entity_recognition":<0-100>, "content_structure":<0-100>, "trust_signals":<0-100>, "performance":<0-100>, "ai_readability":<0-100> },
  "gaps": [ { "issue":"","explanation":"","why_ai_cares":"","impact_stars":<1-5>,"difficulty":"Easy|Medium|Hard","gain":"+XX%","suggested_fix":"" } ],
  "recommendations": [ { "id":"rec-1","issue":"","why_ai_cares":"","business_impact":"","difficulty":"Easy|Medium|Hard","gain":"+XX% AI visibility","affected_pages":[""],"implementation_steps":[""],"priority":"HIGH|MEDIUM|LOW" } ],
  "roadmap": { "immediate_fixes":[""],"quick_wins":[""],"high_impact":[""],"long_term":[""],"timeline_weeks":"4 Weeks","expected_score_improvement":"+XX%" },
  "opportunities": [ { "title":"","description":"","impact":"HIGH|MEDIUM|LOW","potential_gain":"+XX%","type":"schema|faq|entity|citation|internal_link|trust" } ]
}
Analyze ${scan.url}.`

    const res = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${COHERE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'command-r-plus', messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(30000)
    })

    if (!res.ok) throw new Error(`Cohere returned ${res.status}`)
    const data = await res.json()
    let raw = data?.message?.content?.[0]?.text || data?.text || ''
    raw = raw.replace(/^```(?:json)?/, '').replace(/```$/, '').trim()
    const parsed = JSON.parse(raw)
    const required = ['overall_score', 'categories', 'gaps', 'recommendations', 'roadmap', 'opportunities']
    if (required.every(k => k in parsed)) return parsed
    return fallback
  } catch (e) {
    console.warn('Cohere fallback:', e.message)
    return fallback
  }
}

// ═══════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/', (req, res) => res.json({
  status: 'ok',
  message: 'AI Search Visibility Auditor API is running (Node.js)',
  endpoints: ['POST /api/audit', 'GET /api/audit/history', 'GET /api/competitors', 'POST /api/competitors/analyze',
    'GET /api/opportunities', 'GET /api/tracker', 'POST /api/tracker', 'GET /api/tracker/trend-chart',
    'GET /api/alerts', 'GET /api/alerts/settings', 'PUT /api/alerts/settings', 'POST /api/alerts/:id/read',
    'POST /api/send-email']
}))

// ── AUDIT ─────────────────────────────────
app.post('/api/audit', async (req, res) => {
  let { url } = req.body
  if (!url) return res.status(400).json({ detail: 'URL is required' })
  if (!url.startsWith('http')) url = 'https://' + url
  url = url.replace(/\/+$/, '')

  if (auditCache.has(url)) return res.json(auditCache.get(url))

  try {
    const scan = await scrapeWebsite(url)
    const result = await analyzeWithCohere(scan)
    result.url = url
    result.title = scan.title
    result.description = scan.description
    result.word_count = scan.content_structure.word_count
    result.load_time_ms = scan.load_time_ms
    result.page_size_kb = scan.performance.page_size_kb
    auditCache.set(url, result)
    res.json(result)
  } catch (e) {
    res.status(500).json({ detail: `Audit failed: ${e.message}` })
  }
})

app.get('/api/audit/history', (req, res) => {
  const history = []
  for (const [url, data] of auditCache) {
    const s = data.overall_score || 0
    history.push({ url, title: data.title || '', score: s, grade: s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : s >= 40 ? 'D' : 'F' })
  }
  res.json(history)
})

// ── COMPETITORS ───────────────────────────
app.get('/api/competitors', (req, res) => res.json(competitorData))

app.post('/api/competitors/analyze', (req, res) => {
  const { brand_url, competitors = [] } = req.body
  const names = [brand_url, ...competitors.slice(0, 3)]
  while (names.length < 4) names.push(`Competitor ${String.fromCharCode(65 + names.length - 1)}`)
  const pcts = [28, 36, 22, 14]
  const voice = names.map((name, i) => ({
    name, mention_percentage: pcts[i] || 10, ranking: i + 1,
    citation_count: Math.floor(Math.random() * 8) + 2,
    visibility_score: Math.floor(Math.random() * 30) + 60,
    ai_mentions: Math.floor(Math.random() * 20) + 5
  }))
  voice.sort((a, b) => b.mention_percentage - a.mention_percentage)
  voice.forEach((v, i) => v.ranking = i + 1)
  competitorData = { brand_url, share_of_voice: voice }
  res.json(competitorData)
})

// ── OPPORTUNITIES ─────────────────────────
app.get('/api/opportunities', (req, res) => {
  const { url } = req.query
  if (url && auditCache.has(url) && auditCache.get(url).opportunities?.length)
    return res.json(auditCache.get(url).opportunities)
  res.json(defaultOpportunities)
})

// ── TRACKER ───────────────────────────────
app.get('/api/tracker', (req, res) => res.json(trackerHistory))

app.post('/api/tracker', (req, res) => {
  const { prompt, ai_model, brand_mentioned, competitors = [] } = req.body
  if (!prompt || !brand_mentioned)
    return res.status(400).json({ detail: 'prompt and brand_mentioned are required' })
  const position = [0, 1, 2, 3][Math.floor(Math.random() * 4)]
  const item = {
    id: trackerHistory.length + 1, prompt, ai_model, brand_mentioned, position,
    competitors: competitors.length ? competitors : ['Competitor A', 'Competitor B'],
    citation_url: position > 0 ? `https://www.${brand_mentioned.toLowerCase().replace(/\s+/, '')}.com/source` : null,
    date: new Date().toISOString().split('T')[0]
  }
  trackerHistory.unshift(item)
  res.json(item)
})

app.get('/api/tracker/trend-chart', (req, res) => res.json(trendData))

// ── ALERTS ────────────────────────────────
app.get('/api/alerts', (req, res) => res.json(alertsList))
app.get('/api/alerts/settings', (req, res) => res.json(alertSettings))
app.put('/api/alerts/settings', (req, res) => { alertSettings = req.body; res.json(alertSettings) })
app.post('/api/alerts/:id/read', (req, res) => {
  const a = alertsList.find(x => x.id === req.params.id)
  if (a) a.read = true
  res.json({ success: !!a, alert_id: req.params.id })
})

// ── EMAIL ─────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html, attachmentName, attachmentData } = req.body
  if (!to || !subject || !text)
    return res.status(400).json({ detail: 'to, subject and text are required' })
  if (!EMAIL_USER || !EMAIL_PASS)
    return res.status(503).json({ detail: 'Email not configured (set EMAIL_USER and EMAIL_PASS in .env)' })

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })
    const mail = { from: EMAIL_USER, to, subject, text, ...(html ? { html } : {}) }
    if (attachmentName && attachmentData) {
      const b64 = attachmentData.includes(',') ? attachmentData.split(',')[1] : attachmentData
      mail.attachments = [{ filename: attachmentName, content: Buffer.from(b64, 'base64'), contentType: 'application/pdf' }]
    }
    const info = await transporter.sendMail(mail)
    res.json({ message: 'Email sent successfully', messageId: info.messageId })
  } catch (e) {
    res.status(500).json({ detail: `Email failed: ${e.message}` })
  }
})

// ── 404 fallback ──────────────────────────
app.use((req, res) => res.status(404).json({ detail: `Route not found: ${req.method} ${req.path}` }))
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ detail: err.message }) })

// ─────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀  AI Visibility Auditor API running on http://localhost:${PORT}`)
  console.log(`   Cohere: ${COHERE_API_KEY ? '✅ API key loaded' : '⚠️  No key – using local rule engine'}`)
  console.log(`   Email:  ${EMAIL_USER ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`\n   Endpoints: GET / for full list\n`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use.`)
    console.error(`   Run:  npx kill-port ${PORT}   then restart.\n`)
    process.exit(1)
  } else {
    throw err
  }
})
