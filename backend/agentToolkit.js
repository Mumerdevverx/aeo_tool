/**
 * AgentToolkit — SEO & AEO Analysis Engine
 * Uses SEO_ANALYSIS_PROMPT to perform audits with AI models or deterministic fallback rules.
 */

export const SEO_ANALYSIS_PROMPT = `
You are an SEO and AEO expert. Analyze this website data:

URL: {url}
Title: {title}
Meta Description: {metaDescription}
H1 Tags: {h1Tags}
H2 Tags: {h2Tags}
H3 Tags: {h3Tags}
Images: {totalImages} total, {imagesWithAlt} with alt text
SSL: {hasSSL}
Canonical: {canonical}
JSON-LD Schemas: {jsonLdSchemas}
Word Count: {wordCount}

Provide a complete SEO & AEO audit with:
1. Scores (0-100) for:
   - Crawlability
   - Structured Data  
   - Entity Recognition
   - Content Structure
   - Trust Signals
   - Performance
   - AI Readability
   - Overall Score

2. Gaps with priorities (HIGH/MEDIUM/LOW) and fixes

3. AI Answer-Engine Readiness assessment

Return as JSON format.
`;

export class AgentToolkit {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.COHERE_API_KEY || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'command-r-plus';
  }

  /**
   * Formats the website scan data into the SEO_ANALYSIS_PROMPT template
   */
  formatPrompt(scan) {
    const h1s = scan.headings?.filter(h => h.tag === 'H1').map(h => h.text) || scan.h1Tags || [];
    const h2s = scan.headings?.filter(h => h.tag === 'H2').map(h => h.text) || scan.h2Tags || [];
    const h3s = scan.headings?.filter(h => h.tag === 'H3').map(h => h.text) || scan.h3Tags || [];

    const totalImg = scan.totalImages ?? scan.images?.total ?? 0;
    const altImg = scan.imagesWithAlt ?? scan.images?.withAlt ?? 0;

    return SEO_ANALYSIS_PROMPT
      .replace('{url}', scan.url || '')
      .replace('{title}', scan.title || 'Not specified')
      .replace('{metaDescription}', scan.description || scan.metaDescription || 'Not specified')
      .replace('{h1Tags}', h1s.length ? JSON.stringify(h1s) : 'None')
      .replace('{h2Tags}', h2s.length ? JSON.stringify(h2s.slice(0, 10)) : 'None')
      .replace('{h3Tags}', h3s.length ? JSON.stringify(h3s.slice(0, 10)) : 'None')
      .replace('{totalImages}', totalImg)
      .replace('{imagesWithAlt}', altImg)
      .replace('{hasSSL}', scan.ssl_enabled ? 'Yes (HTTPS)' : 'No (HTTP)')
      .replace('{canonical}', scan.canonical?.found ? 'Present' : 'Missing')
      .replace('{jsonLdSchemas}', scan.schemas?.length ? scan.schemas.join(', ') : 'None detected')
      .replace('{wordCount}', scan.content_structure?.word_count ?? scan.wordCount ?? 0);
  }

  /**
   * Deterministic local rule engine for structured audit when AI is unavailable or offline
   */
  runLocalRules(scan) {
    const h1s = scan.headings?.filter(h => h.tag === 'H1').map(h => h.text) || scan.h1Tags || [];
    const h2s = scan.headings?.filter(h => h.tag === 'H2').map(h => h.text) || scan.h2Tags || [];
    const h3s = scan.headings?.filter(h => h.tag === 'H3').map(h => h.text) || scan.h3Tags || [];
    const totalImg = scan.totalImages ?? 0;
    const altImg = scan.imagesWithAlt ?? 0;
    const wordCount = scan.content_structure?.word_count ?? scan.wordCount ?? 0;
    const schemas = scan.schemas || [];
    const schemaLower = schemas.map(s => s.toLowerCase());

    // 1. Scores (0-100)
    let crawlability = 100;
    if (scan.robots_txt?.blocks_ai) crawlability -= 35;
    if (!scan.sitemap_xml?.found) crawlability -= 15;
    if (!scan.canonical?.found) crawlability -= 20;
    if (scan.indexing?.noindex) crawlability -= 50;
    crawlability = Math.max(15, crawlability);

    let structuredData = 20;
    if (schemaLower.some(s => s.includes('organization') || s.includes('corporation'))) structuredData += 30;
    if (schemaLower.some(s => s.includes('faqpage') || s.includes('question'))) structuredData += 25;
    if (schemaLower.some(s => s.includes('article') || s.includes('blogposting'))) structuredData += 15;
    if (schemaLower.some(s => s.includes('service'))) structuredData += 10;
    structuredData = Math.min(100, Math.max(10, structuredData));

    let entityRecognition = 25;
    if (scan.entities?.brand_mentions?.length) entityRecognition += 35;
    if (scan.entities?.same_as?.length) entityRecognition += 40;
    entityRecognition = Math.min(100, Math.max(15, entityRecognition));

    let contentStructure = 30;
    if (h1s.length > 0) contentStructure += 25;
    if (h2s.length > 0) contentStructure += 15;
    if (h3s.length > 0) contentStructure += 10;
    if (wordCount > 600) contentStructure += 20;
    contentStructure = Math.min(100, Math.max(20, contentStructure));

    let trustSignals = 30;
    if (scan.trust_signals?.about_link) trustSignals += 25;
    if (scan.trust_signals?.contact_link) trustSignals += 25;
    if (scan.trust_signals?.testimonials_found || scan.trust_signals?.reviews_found) trustSignals += 20;
    trustSignals = Math.min(100, Math.max(20, trustSignals));

    const perfMap = { A: 100, B: 85, C: 70, D: 50, F: 30 };
    const performance = perfMap[scan.performance?.speed_grade] || 75;

    const aiReadability = Math.round((contentStructure + structuredData + entityRecognition) / 3);
    const overallScore = Math.round((crawlability + structuredData + entityRecognition + contentStructure + trustSignals + performance + aiReadability) / 7);

    // 2. Gaps with priorities (HIGH/MEDIUM/LOW) and fixes
    const gaps = [];

    if (!schemaLower.some(s => s.includes('faqpage') || s.includes('question'))) {
      gaps.push({
        priority: 'HIGH',
        category: 'Structured Data',
        issue: 'No FAQPage or Service schema detected',
        explanation: 'Search engines and AI answer bots (ChatGPT, Perplexity) rely heavily on JSON-LD FAQ markup to deliver direct answer snippets.',
        why_ai_cares: 'AI Overviews require structured schema to verify factual Q&A blocks.',
        impact_stars: 5,
        difficulty: 'Easy',
        gain: '+20% AI Citations',
        fix: 'Add JSON-LD FAQPage schema for core business questions and Service schema for primary offerings.',
        suggested_fix: 'Add JSON-LD FAQPage schema for core business questions and Service schema for primary offerings.'
      });
    }

    if (!schemaLower.some(s => s.includes('organization'))) {
      gaps.push({
        priority: 'HIGH',
        category: 'Entity Recognition',
        issue: 'Missing Organization JSON-LD Schema',
        explanation: 'No explicit Organization entity is defined in metadata to tie your brand to key web properties.',
        why_ai_cares: 'Without Organization schema, LLMs struggle to disambiguate your brand from competitors.',
        impact_stars: 5,
        difficulty: 'Easy',
        gain: '+18% Brand Authority',
        fix: 'Inject a JSON-LD Organization block in <head> containing name, url, logo, and social profile links (sameAs).',
        suggested_fix: 'Inject a JSON-LD Organization block in <head> containing name, url, logo, and social profile links (sameAs).'
      });
    }

    if (totalImg > 0 && altImg < totalImg) {
      const missingCount = totalImg - altImg;
      const pct = Math.round((missingCount / totalImg) * 100);
      gaps.push({
        priority: pct > 30 ? 'HIGH' : 'MEDIUM',
        category: 'Crawlability & Accessibility',
        issue: `${missingCount} of ${totalImg} images (${pct}%) missing descriptive alt text`,
        explanation: 'Images without alt attributes weaken accessibility and obscure visual context for AI web indexers.',
        why_ai_cares: 'Multimodal AI models rely on alt text and surrounding tags to index visual assets.',
        impact_stars: 4,
        difficulty: 'Easy',
        gain: '+12% Image Indexing',
        fix: 'Audit site images and append descriptive, keyword-rich alt attributes to every content image.',
        suggested_fix: 'Audit site images and append descriptive, keyword-rich alt attributes to every content image.'
      });
    }

    if (h3s.length === 0) {
      gaps.push({
        priority: 'MEDIUM',
        category: 'Content Structure',
        issue: 'Missing H3 heading hierarchy',
        explanation: 'The page lacks H3 subheadings, leading to monolithic text blocks that reduce scannability.',
        why_ai_cares: 'Hierarchical headings help LLMs chunk content into clear logical sub-topics for citations.',
        impact_stars: 3,
        difficulty: 'Easy',
        gain: '+10% AI Parseability',
        fix: 'Break long H2 sections into focused sub-sections using descriptive <h3> tags.',
        suggested_fix: 'Break long H2 sections into focused sub-sections using descriptive <h3> tags.'
      });
    }

    if (scan.robots_txt?.blocks_ai) {
      gaps.push({
        priority: 'HIGH',
        category: 'Crawlability',
        issue: 'Robots.txt blocks AI crawler user-agents',
        explanation: 'Directives in robots.txt disallow crawlers like GPTBot, ClaudeBot, or PerplexityBot.',
        why_ai_cares: 'AI search bots cannot index or cite pages explicitly blocked in robots.txt.',
        impact_stars: 5,
        difficulty: 'Easy',
        gain: '+25% Visibility',
        fix: 'Update robots.txt to explicitly allow user-agents GPTBot, ClaudeBot, and PerplexityBot.',
        suggested_fix: 'Update robots.txt to explicitly allow user-agents GPTBot, ClaudeBot, and PerplexityBot.'
      });
    }

    if (!scan.trust_signals?.about_link || !scan.trust_signals?.contact_link) {
      gaps.push({
        priority: 'LOW',
        category: 'Trust Signals',
        issue: 'Incomplete trust & E-E-A-T navigation links',
        explanation: 'Missing dedicated About or Contact links in page navigation reduces transparency.',
        why_ai_cares: 'AI trust evaluators prioritize sites with clear team, contact, and policy credentials.',
        impact_stars: 3,
        difficulty: 'Easy',
        gain: '+8% Trust Rating',
        fix: 'Add clear "About Us" and "Contact" links in the header or footer navigation bar.',
        suggested_fix: 'Add clear "About Us" and "Contact" links in the header or footer navigation bar.'
      });
    }

    // 3. AI Answer-Engine Readiness Assessment
    const readinessStatus = overallScore >= 80 ? 'Highly Ready' : overallScore >= 60 ? 'Moderate Readiness' : 'Needs Optimization';

    const strengths = [];
    if (scan.ssl_enabled) strengths.push('Secure HTTPS SSL Encryption enabled');
    if (scan.title) strengths.push(`Descriptive Page Title: "${scan.title}"`);
    if (scan.description) strengths.push('Meta Description present for search snippets');
    if (wordCount > 500) strengths.push(`Comprehensive Word Count (${wordCount} words)`);
    if (schemas.length > 0) strengths.push(`Structured data detected (${schemas.join(', ')})`);

    const improvements = gaps.map(g => g.fix);

    const answerEngineBreakdown = [
      { engine: 'ChatGPT (GPT-4o)', status: overallScore >= 70 ? 'Ready' : 'Needs Work', score: Math.min(100, overallScore + 5), note: 'Understands clear text hierarchy and high word count.' },
      { engine: 'Perplexity AI', status: structuredData >= 60 ? 'Ready' : 'Missing Schema', score: structuredData, note: 'Requires JSON-LD FAQ and Service schemas for direct citations.' },
      { engine: 'Claude 3.5 Sonnet', status: aiReadability >= 65 ? 'Ready' : 'Needs Work', score: aiReadability, note: 'Prefers logical heading hierarchy (H1, H2, H3) and answer-first phrasing.' },
      { engine: 'Google AI Overviews', status: entityRecognition >= 60 ? 'Ready' : 'Entity Missing', score: entityRecognition, note: 'Requires Organization entity and verified trust signals.' }
    ];

    const scrapedData = {
      url: scan.url || '',
      title: scan.title || '',
      metaDescription: scan.description || scan.metaDescription || '',
      h1Tags: h1s,
      h2Tags: h2s,
      h3Tags: h3s,
      totalImages: totalImg,
      imagesWithAlt: altImg,
      hasSSL: scan.ssl_enabled ? 'Yes (HTTPS)' : 'No (HTTP)',
      canonical: scan.canonical?.found ? 'Present' : 'Missing',
      jsonLdSchemas: schemas,
      wordCount: wordCount
    };

    return {
      scores: {
        crawlability,
        structuredData,
        entityRecognition,
        contentStructure,
        trustSignals,
        performance,
        aiReadability,
        overallScore
      },
      overall_score: overallScore,
      categories: {
        crawlability,
        structured_data: structuredData,
        entity_recognition: entityRecognition,
        content_structure: contentStructure,
        trust_signals: trustSignals,
        performance,
        ai_readability: aiReadability
      },
      gaps,
      aiReadiness: {
        readinessScore: overallScore,
        readinessStatus,
        strengths,
        improvements,
        answerEngineBreakdown
      },
      scrapedData
    };
  }

  /**
   * Main audit invocation: attempts LLM call with prompt, falls back cleanly to local rules
   */
  async runSeoAudit(scan) {
    const promptText = this.formatPrompt(scan);

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.cohere.com/v2/chat', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are an SEO and AEO (Answer Engine Optimization) expert. Respond ONLY with valid, unformatted JSON matching the requested structure.'
              },
              { role: 'user', content: promptText }
            ]
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (response.ok) {
          const data = await response.json();
          let rawText = data?.message?.content?.[0]?.text || data?.text || '';
          rawText = rawText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(rawText);

          if (parsed.scores && parsed.gaps && parsed.aiReadiness) {
            // Fill in scrapedData if missing
            parsed.scrapedData = parsed.scrapedData || this.runLocalRules(scan).scrapedData;
            parsed.overall_score = parsed.scores.overallScore || parsed.scores.overall_score || 70;
            parsed.categories = parsed.categories || {
              crawlability: parsed.scores.crawlability,
              structured_data: parsed.scores.structuredData,
              entity_recognition: parsed.scores.entityRecognition,
              content_structure: parsed.scores.contentStructure,
              trust_signals: parsed.scores.trustSignals,
              performance: parsed.scores.performance,
              ai_readability: parsed.scores.aiReadability
            };
            return parsed;
          }
        }
      } catch (err) {
        console.warn('AI Toolkit LLM call warning:', err.message);
      }
    }

    // Fallback to local rule engine
    return this.runLocalRules(scan);
  }
}
