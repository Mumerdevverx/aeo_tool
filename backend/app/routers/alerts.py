from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["Alerts & Monitoring"])

class AlertSetting(BaseModel):
    visibility_changes: bool
    competitor_mentions: bool
    citation_opportunities: bool
    email_digests: bool
    email_address: str

# Default settings
alert_settings = {
    "visibility_changes": True,
    "competitor_mentions": True,
    "citation_opportunities": True,
    "email_digests": False,
    "email_address": "notify@clientdomain.com"
}

# Pre-populated alerts
recent_alerts = [
    {
        "id": "alert-1",
        "title": "AI Visibility Surge (+8%)",
        "message": "Brand mentions surged 8% on Claude 3.5 Sonnet queries related to compliance.",
        "type": "visibility_increased",
        "date": "2026-07-15 14:10",
        "read": False
    },
    {
        "id": "alert-2",
        "title": "Prompt Position Changed (#3 to #1)",
        "message": "Your prompt 'Which AI coding assistants support offline models?' rose to position #1 on Gemini.",
        "type": "ranking_changed",
        "date": "2026-07-14 09:45",
        "read": False
    },
    {
        "id": "alert-3",
        "title": "Competitor Gained Mentions (+12%)",
        "message": "Competitor A mentions rose 12% in ChatGPT queries comparing SOC-2 automated platforms.",
        "type": "competitor_gained",
        "date": "2026-07-13 18:22",
        "read": True
    },
    {
        "id": "alert-4",
        "title": "New Citation Opportunity",
        "message": "A high authority sitemap check found your competitor cited in Perplexity. Add schema FAQ blocks to contest.",
        "type": "citation_opportunity",
        "date": "2026-07-12 11:05",
        "read": True
    }
]

@router.get("")
async def get_alerts():
    """
    Returns lists of recent alert notifications.
    """
    return recent_alerts

@router.get("/settings")
async def get_settings():
    """
    Retrieves current alert configuration options.
    """
    return alert_settings

@router.put("/settings")
async def update_settings(settings: AlertSetting):
    """
    Updates the configuration toggles for notifications.
    """
    global alert_settings
    alert_settings = settings.dict()
    return alert_settings

@router.post("/{alert_id}/read")
async def mark_as_read(alert_id: str):
    """
    Marks an individual alert item as read.
    """
    for alert in recent_alerts:
        if alert["id"] == alert_id:
            alert["read"] = True
            return {"success": True, "alert_id": alert_id}
    return {"success": False, "message": "Alert not found"}
