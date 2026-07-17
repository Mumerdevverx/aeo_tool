from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter(prefix="/tracker", tags=["Visibility Tracker"])

class TrackedItem(BaseModel):
    prompt: str
    ai_model: str
    brand_mentioned: str
    position: int
    competitors: List[str]
    citation_url: Optional[str] = None
    date: str

class TrackRequest(BaseModel):
    prompt: str
    ai_model: str
    brand_mentioned: str
    competitors: Optional[List[str]] = []

# Pre-populated tracked entries
tracker_history = [
    {
        "id": 1,
        "prompt": "What is the best customer support software for startups?",
        "ai_model": "ChatGPT",
        "brand_mentioned": "HelpScout",
        "position": 2,
        "competitors": ["Zendesk", "Intercom", "Freshdesk"],
        "citation_url": "https://www.helpscout.com/startup-pricing/",
        "date": "2026-07-10"
    },
    {
        "id": 2,
        "prompt": "Which AI coding assistants support offline models?",
        "ai_model": "Gemini",
        "brand_mentioned": "Continue.dev",
        "position": 1,
        "competitors": ["Copilot", "Tabnine"],
        "citation_url": "https://github.com/continuedev/continue",
        "date": "2026-07-12"
    },
    {
        "id": 3,
        "prompt": "Top security compliance automation tools for SOC2",
        "ai_model": "Claude",
        "brand_mentioned": "Vanta",
        "position": 1,
        "competitors": ["Drata", "Secureframe"],
        "citation_url": "https://www.vanta.com/soc-2",
        "date": "2026-07-14"
    },
    {
        "id": 4,
        "prompt": "Compare lightweight React state management libraries",
        "ai_model": "Perplexity",
        "brand_mentioned": "Zustand",
        "position": 2,
        "competitors": ["Jotai", "Recoil", "Redux Toolkit"],
        "citation_url": "https://zustand-demo.pmnd.rs/",
        "date": "2026-07-15"
    },
    {
        "id": 5,
        "prompt": "Best headless CMS for Next.js in 2026",
        "ai_model": "Google AI Overviews",
        "brand_mentioned": "Sanity.io",
        "position": 3,
        "competitors": ["Contentful", "Strapi", "Hygraph"],
        "citation_url": "https://www.sanity.io/headless-cms-nextjs",
        "date": "2026-07-15"
    }
]

@router.get("")
async def get_tracked_items():
    """
    Returns history list of brand mentions and positions tracked.
    """
    return tracker_history

@router.post("")
async def track_new_prompt(req: TrackRequest):
    """
    Begins tracking a brand search prompt. Simulates AI response audit.
    """
    import random
    if not req.prompt or not req.brand_mentioned:
        raise HTTPException(status_code=400, detail="Prompt and brand name are required")
        
    # Simulate a check result
    position = random.choice([1, 2, 3, 4, 0]) # 0 means not mentioned
    citation_url = None
    if position > 0:
        domain = req.brand_mentioned.lower().replace(" ", "") + ".com"
        citation_url = f"https://www.{domain}/blog/best-solutions"
        
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    
    new_item = {
        "id": len(tracker_history) + 1,
        "prompt": req.prompt,
        "ai_model": req.ai_model,
        "brand_mentioned": req.brand_mentioned,
        "position": position,
        "competitors": req.competitors or ["Competitor A", "Competitor B"],
        "citation_url": citation_url,
        "date": date_str
    }
    
    tracker_history.insert(0, new_item)
    return new_item

@router.get("/trend-chart")
async def get_trend_data():
    """
    Returns monthly visibility averages for the Recharts line charts.
    """
    return [
        {"date": "June 1", "ChatGPT": 62, "Gemini": 45, "Claude": 50, "Perplexity": 55},
        {"date": "June 10", "ChatGPT": 65, "Gemini": 48, "Claude": 52, "Perplexity": 58},
        {"date": "June 20", "ChatGPT": 68, "Gemini": 55, "Claude": 60, "Perplexity": 62},
        {"date": "July 1", "ChatGPT": 70, "Gemini": 58, "Claude": 63, "Perplexity": 65},
        {"date": "July 10", "ChatGPT": 75, "Gemini": 62, "Claude": 68, "Perplexity": 70},
        {"date": "July 15", "ChatGPT": 78, "Gemini": 65, "Claude": 72, "Perplexity": 75}
    ]
