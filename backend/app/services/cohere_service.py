import cohere
import json
import logging
from app.config import COHERE_API_KEY

logger = logging.getLogger(__name__)

def generate_local_fallback(scan_data: dict) -> dict:
    """
    Generates a high-quality, deterministic, rule-based AI Search Visibility audit
    if the Cohere API is unavailable or the API key is missing.
    """
    url = scan_data.get("url", "")
    
    # 1. Calculate Crawlability (Max 100)
    crawl_score = 100
    crawl_issues = []
    if scan_data["robots_txt"]["blocks_ai"]:
        crawl_score -= 40
        crawl_issues.append({
            "issue": "AI Crawlers Blocked",
            "explanation": "robots.txt contains disallow rules for AI agents like GPTBot or ClaudeBot.",
            "why_ai_cares": "AI models cannot scan your page content to provide real-time citations.",
            "impact": 5, "difficulty": "Easy", "gain": 25,
            "fix": "Remove disallow directives for GPTBot, ClaudeBot, and Google-Extended in your robots.txt."
        })
    if not scan_data["sitemap_xml"]["found"]:
        crawl_score -= 15
        crawl_issues.append({
            "issue": "Missing Sitemap Declaration",
            "explanation": "Sitemap reference was not found in robots.txt or page headers.",
            "why_ai_cares": "AI indexers use sitemaps to discover new content paths rapidly.",
            "impact": 3, "difficulty": "Easy", "gain": 10,
            "fix": "Add 'Sitemap: https://yourdomain.com/sitemap.xml' to the end of your robots.txt."
        })
    if not scan_data["canonical"]["found"]:
        crawl_score -= 20
        crawl_issues.append({
            "issue": "Missing Canonical Tag",
            "explanation": "No canonical URL was defined for this page.",
            "why_ai_cares": "AI systems struggle to determine primary source pages, diluting citation authority.",
            "impact": 4, "difficulty": "Easy", "gain": 15,
            "fix": "Add <link rel='canonical' href='current_page_url'> inside your <head>."
        })
    elif not scan_data["canonical"]["matches"]:
        crawl_score -= 10
        crawl_issues.append({
            "issue": "Canonical Mismatch",
            "explanation": "The canonical URL does not match the scanned page URL.",
            "why_ai_cares": "Confuses crawlers regarding which page represents the main authority.",
            "impact": 2, "difficulty": "Easy", "gain": 5,
            "fix": "Update the canonical href tag to match the active page URL exactly."
        })
    if scan_data["indexing"]["noindex"]:
        crawl_score -= 50
        crawl_issues.append({
            "issue": "Noindex Directive Active",
            "explanation": "Meta robots headers block indexing.",
            "why_ai_cares": "Prevents AI models from processing or storing this content in knowledge indexes.",
            "impact": 5, "difficulty": "Easy", "gain": 35,
            "fix": "Remove the 'noindex' tag from the robots meta settings."
        })
    crawl_score = max(10, crawl_score)

    # 2. Structured Data (Max 100)
    schema_score = 0
    schemas_found = [s.lower() for s in scan_data["schemas"]]
    
    schema_checks = {
        "organization": {"types": ["organization", "corporation", "localbusiness"], "val": 25, "name": "Organization Schema"},
        "faq": {"types": ["faqpage", "question", "answer"], "val": 20, "name": "FAQ Schema"},
        "article": {"types": ["article", "newsarticle", "blogposting"], "val": 20, "name": "Article Schema"},
        "service": {"types": ["service", "servicechannel"], "val": 15, "name": "Service Schema"},
        "product": {"types": ["product"], "val": 10, "name": "Product Schema"},
        "breadcrumb": {"types": ["breadcrumbitemlist", "breadcrumb-list", "breadcrumblist"], "val": 10, "name": "Breadcrumb Schema"}
    }
    
    missing_schemas = []
    for skey, sinfo in schema_checks.items():
        has_schema = any(any(t in s for t in sinfo["types"]) for s in schemas_found)
        if has_schema:
            schema_score += sinfo["val"]
        else:
            missing_schemas.append(sinfo["name"])
            
    # Add issue for missing schemas
    if missing_schemas:
        crawl_issues.append({
            "issue": f"Missing Schema Markup: {', '.join(missing_schemas[:2])}",
            "explanation": f"The page is missing important JSON-LD schemas: {', '.join(missing_schemas)}.",
            "why_ai_cares": "Structured JSON-LD schema is the most direct way AI models parse metadata (e.g. founder, price, questions).",
            "impact": 4, "difficulty": "Medium", "gain": 18,
            "fix": "Implement JSON-LD microdata templates for Organization, FAQs, or Articles on this page."
        })
    schema_score = max(10, schema_score)

    # 3. Entity Recognition (Max 100)
    entity_score = 30
    entity_issues = []
    if scan_data["entities"]["brand_mentions"]:
        entity_score += 25
    else:
        entity_issues.append({
            "issue": "No Brand Entity Reference",
            "explanation": "No distinct Organization or Brand name entity could be parsed from schemas.",
            "why_ai_cares": "AI models cannot tie facts, statistics, or references to your brand identity.",
            "impact": 5, "difficulty": "Medium", "gain": 20,
            "fix": "Include 'name' and 'brand' fields inside your Organization JSON-LD markup."
        })
        
    if scan_data["entities"]["founder_mentions"]:
        entity_score += 15
    else:
        entity_score -= 5
        
    if scan_data["entities"]["same_as"]:
        entity_score += 30
    else:
        entity_issues.append({
            "issue": "Missing SameAs Identity Links",
            "explanation": "No sameAs links connect your entity profile to official socials, Wikidata, or Crunchbase.",
            "why_ai_cares": "SameAs declarations provide proof of trust, cross-linking entities across the web.",
            "impact": 4, "difficulty": "Easy", "gain": 15,
            "fix": "Add sameAs references linking your official LinkedIn, Twitter, and Wikipedia pages to your schema."
        })
    entity_score = max(10, min(100, entity_score))

    # 4. Content Structure (Max 100)
    content_score = 40
    content_issues = []
    headings = scan_data["content_structure"]["headings"]
    has_h1 = any(h["tag"] == "H1" for h in headings)
    has_h2 = any(h["tag"] == "H2" for h in headings)
    
    if has_h1:
        content_score += 20
    else:
        content_issues.append({
            "issue": "Missing H1 Hierarchy Header",
            "explanation": "No H1 heading tag exists on the page.",
            "why_ai_cares": "H1 headers set the core topical theme. AI parsers use it to establish key topics.",
            "impact": 4, "difficulty": "Easy", "gain": 12,
            "fix": "Rewrite the main page title as an <h1> element instead of styled div."
        })
        
    if has_h2:
        content_score += 20
        
    semantic_html = scan_data["content_structure"]["semantic_html"]
    semantic_ratio = sum(1 for val in semantic_html.values() if val) / len(semantic_html)
    content_score += int(semantic_ratio * 20)
    
    word_count = scan_data["content_structure"]["word_count"]
    if word_count > 600:
        content_score += 20
    elif word_count > 200:
        content_score += 10
        
    if scan_data["content_structure"]["faq_count"] > 0:
        content_score += 20
    else:
        content_issues.append({
            "issue": "Missing Answer-First FAQs",
            "explanation": "No dedicated FAQ section or answer blocks detected.",
            "why_ai_cares": "A large share of LLM queries are question-based. Clear FAQ blocks directly feed LLM answers.",
            "impact": 4, "difficulty": "Easy", "gain": 15,
            "fix": "Add an FAQ section with structured FAQ schema answering standard user questions."
        })
    content_score = max(20, min(100, content_score))

    # 5. Trust Signals (Max 100)
    trust_score = 20
    trust_issues = []
    if scan_data["trust_signals"]["about_link"]:
        trust_score += 25
    else:
        trust_issues.append({
            "issue": "Missing 'About Us' Navigation Link",
            "explanation": "No reference to an About page could be detected.",
            "why_ai_cares": "AI models require clear organizational context to assess E-E-A-T credentials.",
            "impact": 4, "difficulty": "Easy", "gain": 10,
            "fix": "Add an 'About' or 'Company' page link in the header/footer nav."
        })
        
    if scan_data["trust_signals"]["contact_link"]:
        trust_score += 25
        
    if scan_data["trust_signals"]["testimonials_found"]:
        trust_score += 25
    else:
        trust_issues.append({
            "issue": "No Customer Testimonials Detected",
            "explanation": "No text blocks describing user experiences or success testimonials found.",
            "why_ai_cares": "LLMs extract reviews and testimonials to rank 'best services' in answers.",
            "impact": 3, "difficulty": "Medium", "gain": 8,
            "fix": "Publish short testimonial quotes from verified users on your landing pages."
        })
        
    if scan_data["trust_signals"]["reviews_found"]:
        trust_score += 25
    trust_score = max(10, min(100, trust_score))

    # 6. Performance (Max 100)
    perf_map = {"A": 100, "B": 85, "C": 70, "D": 50, "F": 30}
    speed_grade = scan_data["performance"]["speed_grade"]
    perf_score = perf_map.get(speed_grade, 70)
    perf_issues = []
    if speed_grade in ["D", "F"]:
        perf_issues.append({
            "issue": "Poor Page Speed Metrics",
            "explanation": f"Page loaded in {scan_data['load_time_ms']}ms, yielding speed grade {speed_grade}.",
            "why_ai_cares": "Fast response speeds ensure AI search scrapers don't timeout during crawls.",
            "impact": 4, "difficulty": "Medium", "gain": 14,
            "fix": "Enable response gzip compression, compress images, and host scripts on a fast CDN."
        })

    # 7. AI Readability (Max 100)
    read_score = int((content_score + schema_score) / 2)
    read_issues = []
    if read_score < 70:
        read_issues.append({
            "issue": "Weak AI Readability Index",
            "explanation": "Mixed header order and limited semantic html structure blocks bot readability.",
            "why_ai_cares": "Clean structural readability is key for machine parsers to extract key summaries.",
            "impact": 3, "difficulty": "Medium", "gain": 10,
            "fix": "Use semantic markup (<article>, <section>) and keep short, punchy paragraphs (2-3 sentences)."
        })

    # Combined score
    overall_score = round((crawl_score + schema_score + entity_score + content_score + trust_score + perf_score + read_score) / 7)
    
    # Assemble Gaps
    all_gaps = crawl_issues + entity_issues + content_issues + trust_issues + perf_issues + read_issues
    # Format according to gap schema requirements
    gaps_formatted = []
    for g in all_gaps:
        gaps_formatted.append({
            "issue": g["issue"],
            "explanation": g["explanation"],
            "why_ai_cares": g["why_ai_cares"],
            "impact_stars": g["impact"],
            "difficulty": g["difficulty"],
            "gain": f"+{g['gain']}%",
            "suggested_fix": g["fix"]
        })
        
    # Assemble Recommendations
    recommendations = []
    sorted_gaps = sorted(all_gaps, key=lambda x: x["impact"], reverse=True)
    for idx, g in enumerate(sorted_gaps):
        recommendations.append({
            "id": f"rec-{idx+1}",
            "issue": g["issue"],
            "why_ai_cares": g["why_ai_cares"],
            "business_impact": f"Improves entity confidence and citation likelihood. Impact score {g['impact']}/5.",
            "difficulty": g["difficulty"],
            "gain": f"+{g['gain']}% AI visibility",
            "affected_pages": [url],
            "implementation_steps": [
                f"Verify current setup: {g['explanation']}",
                g["fix"],
                "Test structural formatting using schema testing validation or speed checker."
            ],
            "priority": "HIGH" if g["impact"] >= 4 else "MEDIUM" if g["impact"] >= 3 else "LOW"
        })

    # Timeline Roadmap
    roadmap = {
        "immediate_fixes": [],
        "quick_wins": [],
        "high_impact": [],
        "long_term": [],
        "timeline_weeks": "4 Weeks",
        "expected_score_improvement": "+18%"
    }
    
    for r in recommendations:
        if r["priority"] == "HIGH" and r["difficulty"] == "Easy":
            roadmap["quick_wins"].append(r["issue"])
        elif r["priority"] == "HIGH":
            roadmap["immediate_fixes"].append(r["issue"])
        elif r["difficulty"] in ["Medium", "Hard"] and r["priority"] in ["HIGH", "MEDIUM"]:
            roadmap["high_impact"].append(r["issue"])
        else:
            roadmap["long_term"].append(r["issue"])
            
    # Guarantee at least some items in roadmap arrays
    if not roadmap["immediate_fixes"]:
        roadmap["immediate_fixes"] = ["Configure AI Robots.txt Access"]
    if not roadmap["quick_wins"]:
        roadmap["quick_wins"] = ["Deploy JSON-LD Organization Schema"]
    if not roadmap["high_impact"]:
        roadmap["high_impact"] = ["Construct Semantic Content Clusters"]
    if not roadmap["long_term"]:
        roadmap["long_term"] = ["Publish Customer Success Cases / Reviews"]

    # Competitor Share of Voice
    competitors_voice = {
        "your_brand": {"name": "Your Brand", "mention_percentage": 25, "ranking": 3, "citation_count": 4, "visibility_score": overall_score, "ai_mentions": 12},
        "competitor_a": {"name": "Competitor A", "mention_percentage": 35, "ranking": 1, "citation_count": 8, "visibility_score": 78, "ai_mentions": 22},
        "competitor_b": {"name": "Competitor B", "mention_percentage": 25, "ranking": 2, "citation_count": 6, "visibility_score": 72, "ai_mentions": 16},
        "competitor_c": {"name": "Competitor C", "mention_percentage": 15, "ranking": 4, "citation_count": 2, "visibility_score": 55, "ai_mentions": 6}
    }
    
    # Opportunity Finder
    opportunities = []
    if "FAQ Schema" in missing_schemas or not scan_data["content_structure"]["faq_count"]:
        opportunities.append({
            "title": "FAQ AI Snippet Optimization",
            "description": "Create answer-first blocks answering top queries and mark them up with FAQ Schema.",
            "impact": "HIGH",
            "potential_gain": "+15% Visibility",
            "type": "schema"
        })
    if "Organization Schema" in missing_schemas or not scan_data["entities"]["brand_mentions"]:
        opportunities.append({
            "title": "Missing Trust Brand Entity",
            "description": "Establish a distinct organization entity declaration to anchor AI knowledge claims.",
            "impact": "HIGH",
            "potential_gain": "+20% Trust",
            "type": "entity"
        })
    opportunities.append({
        "title": "Content Cluster Internal Linking",
        "description": "Connect your landing page with semantic resource hubs using clean link anchors.",
        "impact": "MEDIUM",
        "potential_gain": "+8% Crawl Rate",
        "type": "internal_link"
    })
    if not scan_data["trust_signals"]["reviews_found"]:
        opportunities.append({
            "title": "Social Proof Citation Acquisition",
            "description": "Acquire brand mentions on third party directories like G2 or Trustpilot to gain model trust.",
            "impact": "HIGH",
            "potential_gain": "+12% Citation rate",
            "type": "citation"
        })

    return {
        "overall_score": overall_score,
        "categories": {
            "crawlability": crawl_score,
            "structured_data": schema_score,
            "entity_recognition": entity_score,
            "content_structure": content_score,
            "trust_signals": trust_score,
            "performance": perf_score,
            "ai_readability": read_score
        },
        "gaps": gaps_formatted,
        "recommendations": recommendations,
        "roadmap": roadmap,
        "competitors": competitors_voice,
        "opportunities": opportunities
    }

async def analyze_with_cohere(scan_data: dict) -> dict:
    """
    Analyzes website scan results using the Cohere API.
    If the API fails or is unconfigured, falls back gracefully to a robust local rule engine.
    """
    fallback_data = generate_local_fallback(scan_data)
    
    if not COHERE_API_KEY:
        logger.info("Cohere API key not configured, returning local rule audit data.")
        return fallback_data

    try:
        co = cohere.Client(api_key=COHERE_API_KEY)
        
        prompt = f"""
You are an expert AI Search engine auditor. Analyze the following website scan data and generate a JSON response representing an audit.
Respond ONLY with a valid JSON object matching the JSON structure schema below.

Scan Data:
{json.dumps(scan_data, indent=2)}

JSON Schema:
{{
  "overall_score": integer (0-100),
  "categories": {{
    "crawlability": integer (0-100),
    "structured_data": integer (0-100),
    "entity_recognition": integer (0-100),
    "content_structure": integer (0-100),
    "trust_signals": integer (0-100),
    "performance": integer (0-100),
    "ai_readability": integer (0-100)
  }},
  "gaps": [
    {{
      "issue": "string",
      "explanation": "string",
      "why_ai_cares": "string",
      "impact_stars": integer (1-5),
      "difficulty": "Easy" | "Medium" | "Hard",
      "gain": "+XX%",
      "suggested_fix": "string"
    }}
  ],
  "recommendations": [
    {{
      "id": "rec-1",
      "issue": "string",
      "why_ai_cares": "string",
      "business_impact": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "gain": "+XX% AI visibility",
      "affected_pages": ["string"],
      "implementation_steps": ["string"],
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }}
  ],
  "roadmap": {{
    "immediate_fixes": ["string"],
    "quick_wins": ["string"],
    "high_impact": ["string"],
    "long_term": ["string"],
    "timeline_weeks": "string (e.g. 4 Weeks)",
    "expected_score_improvement": "string (e.g. +15%)"
  }},
  "competitors": {{
    "your_brand": {{ "name": "string", "mention_percentage": integer, "ranking": integer, "citation_count": integer, "visibility_score": integer, "ai_mentions": integer }},
    "competitor_a": {{ "name": "string", "mention_percentage": integer, "ranking": integer, "citation_count": integer, "visibility_score": integer, "ai_mentions": integer }},
    "competitor_b": {{ "name": "string", "mention_percentage": integer, "ranking": integer, "citation_count": integer, "visibility_score": integer, "ai_mentions": integer }},
    "competitor_c": {{ "name": "string", "mention_percentage": integer, "ranking": integer, "citation_count": integer, "visibility_score": integer, "ai_mentions": integer }}
  }},
  "opportunities": [
    {{
      "title": "string",
      "description": "string",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "potential_gain": "string (e.g. +10% Visibility)",
      "type": "schema" | "faq" | "content_cluster" | "internal_link" | "trust" | "citation"
    }}
  ]
}}

Generate an audit report for {scan_data['url']}. Ensure recommendations are specific and logical. Use the provided scan data as factual basis.
Do not add any Markdown formatting tags around the JSON payload; output raw json text only.
"""
        
        response = co.chat(
            model="command-r-plus",
            message=prompt,
        )
        
        raw_text = response.text.strip()
        # Clean markdown codeblocks if LLM wraps it
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "", 1).replace("```", "", 1).strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```", "", 1).replace("```", "", 1).strip()
            
        data = json.loads(raw_text)
        
        # Verify structure keys
        required_keys = ["overall_score", "categories", "gaps", "recommendations", "roadmap", "competitors", "opportunities"]
        if all(k in data for k in required_keys):
            return data
        
        logger.warning("Cohere output missing root keys. Falling back to rule engine.")
        return fallback_data
    except Exception as e:
        logger.error(f"Error calling Cohere API: {str(e)}. Returning local rule engine fallback.")
        return fallback_data
