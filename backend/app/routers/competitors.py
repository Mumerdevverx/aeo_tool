from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/competitors", tags=["Competitor Voice"])

class CompetitorAnalyzeRequest(BaseModel):
    brand_url: str
    competitors: List[str]

# Initial in-memory data for demo/mock comparative voice
competitor_data = {
    "brand_url": "yourdomain.com",
    "share_of_voice": [
        {"name": "Your Brand", "mention_percentage": 28, "ranking": 3, "citation_count": 6, "visibility_score": 75, "ai_mentions": 14},
        {"name": "Competitor A", "mention_percentage": 36, "ranking": 1, "citation_count": 10, "visibility_score": 84, "ai_mentions": 25},
        {"name": "Competitor B", "mention_percentage": 22, "ranking": 2, "citation_count": 8, "visibility_score": 78, "ai_mentions": 18},
        {"name": "Competitor C", "mention_percentage": 14, "ranking": 4, "citation_count": 4, "visibility_score": 60, "ai_mentions": 8}
    ]
}

@router.get("")
async def get_competitor_voice():
    """
    Retrieves the current Competitor Share of Voice analytics.
    """
    return competitor_data

@router.post("/analyze")
async def analyze_competitors(req: CompetitorAnalyzeRequest):
    """
    Compares the client brand URL with specified competitor URLs.
    """
    import random
    
    brand_name = req.brand_url.replace("https://", "").replace("http://", "").split("/")[0]
    comp_names = [url.replace("https://", "").replace("http://", "").split("/")[0] for url in req.competitors]
    
    # Fill up with up to 3 competitors
    while len(comp_names) < 3:
        comp_names.append(f"Competitor {chr(65 + len(comp_names))}")
        
    names = [brand_name] + comp_names[:3]
    percentages = [30, 35, 20, 15] # default sample distribute
    
    # Shuffle or randomize slightly for dynamics
    random.shuffle(percentages)
    
    voice_list = []
    for idx, name in enumerate(names):
        pct = percentages[idx]
        score = random.randint(50, 92)
        mentions = random.randint(5, 30)
        citations = int(mentions * 0.4) + 1
        voice_list.append({
            "name": name,
            "mention_percentage": pct,
            "ranking": idx + 1,
            "citation_count": citations,
            "visibility_score": score,
            "ai_mentions": mentions
        })
        
    # Sort by visibility score
    voice_list = sorted(voice_list, key=lambda x: x["mention_percentage"], reverse=True)
    for idx, item in enumerate(voice_list):
        item["ranking"] = idx + 1
        
    global competitor_data
    competitor_data = {
        "brand_url": req.brand_url,
        "share_of_voice": voice_list
    }
    
    return competitor_data
