from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.email_service import send_email
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Email"])

class EmailRequest(BaseModel):
    to: str
    subject: str
    text: str
    html: Optional[str] = None
    attachmentName: Optional[str] = None
    attachmentData: Optional[str] = None # Base64 PDF attachment data

@router.post("/send-email")
async def send_report_email(req: EmailRequest):
    logger.info(f"Received send-email request for {req.to}")
    try:
        res = await send_email(
            to=req.to,
            subject=req.subject,
            text=req.text,
            html=req.html,
            attachment_name=req.attachmentName,
            attachment_data=req.attachmentData
        )
        return res
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")
