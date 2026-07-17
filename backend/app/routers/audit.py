from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.scraper import scrape_website
from app.services.cohere_service import analyze_with_cohere
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audit", tags=["Audit"])

# Simple in-memory cache for audits
audit_cache = {}

class AuditRequest(BaseModel):
    url: str

@router.post("")
async def run_audit(req: AuditRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    logger.info(f"Auditing website: {url}")
    
    # Check cache first
    if url in audit_cache:
        logger.info(f"Returning cached audit for {url}")
        return audit_cache[url]
        
    try:
        # 1. Scrape HTML & structural signals
        scan_data = await scrape_website(url)
        if scan_data.get("status_code", 500) != 200:
            # Scraper failed, raise error
            err_msg = scan_data.get("error", "Failed to fetch website content")
            raise HTTPException(status_code=400, detail=f"Scrape error: {err_msg}")
            
        # 2. Perform AI Visibility Scoring & Gap analysis
        audit_results = await analyze_with_cohere(scan_data)
        
        # Add metadata
        audit_results["url"] = url
        audit_results["title"] = scan_data.get("title", "")
        audit_results["description"] = scan_data.get("description", "")
        audit_results["word_count"] = scan_data["content_structure"]["word_count"]
        audit_results["load_time_ms"] = scan_data["load_time_ms"]
        audit_results["page_size_kb"] = scan_data["performance"]["page_size_kb"]
        
        # Cache results
        audit_cache[url] = audit_results
        return audit_results
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Audit failed for {url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")

@router.get("/history")
async def get_audit_history():
    """
    Returns list of audited URLs with summary scores.
    """
    history = []
    for url, data in audit_cache.items():
        history.append({
            "url": url,
            "title": data.get("title", ""),
            "score": data.get("overall_score", 0),
            "grade": "A" if data.get("overall_score", 0) >= 90 else "B" if data.get("overall_score", 0) >= 75 else "C" if data.get("overall_score", 0) >= 60 else "D" if data.get("overall_score", 0) >= 40 else "F"
        })
    return history
