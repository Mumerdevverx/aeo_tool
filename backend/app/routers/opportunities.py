from fastapi import APIRouter, Query
from app.routers.audit import audit_cache

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

# Standard fallback opportunities when no site is selected
default_opportunities = [
    {
        "title": "FAQ AI Snippet Optimization",
        "description": "Create answer-first blocks answering top customer queries and mark them up with JSON-LD FAQ Schema.",
        "impact": "HIGH",
        "potential_gain": "+15% Visibility",
        "type": "faq"
    },
    {
        "title": "Missing Trust Brand Entity",
        "description": "Establish a distinct organization entity declaration in your Schema properties to anchor AI claims.",
        "impact": "HIGH",
        "potential_gain": "+20% Trust",
        "type": "entity"
    },
    {
        "title": "Content Cluster Internal Linking",
        "description": "Connect your landing page with semantic resource hubs using descriptive, keyword-rich link anchors.",
        "impact": "MEDIUM",
        "potential_gain": "+8% Crawl Rate",
        "type": "internal_link"
    },
    {
        "title": "Social Proof Citation Acquisition",
        "description": "Acquire brand mentions on third party directories like G2 or Trustpilot to gain model crawler confidence.",
        "impact": "HIGH",
        "potential_gain": "+12% Citation rate",
        "type": "citation"
    },
    {
        "title": "Robots.txt AI Bot Clearance",
        "description": "Enable full crawling permissions for GPTBot and ClaudeBot to ensure AI indexing is active.",
        "impact": "HIGH",
        "potential_gain": "+25% Index Rate",
        "type": "schema"
    }
]

@router.get("")
async def get_opportunities(url: str = Query(None)):
    """
    Returns prioritized opportunity cards. If URL is provided, returns site-specific opportunities.
    """
    if url and url in audit_cache:
        site_data = audit_cache[url]
        if "opportunities" in site_data and site_data["opportunities"]:
            return site_data["opportunities"]
            
    return default_opportunities
