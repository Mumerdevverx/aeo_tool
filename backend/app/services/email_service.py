import os
import base64
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import logging
from app import config

logger = logging.getLogger(__name__)

async def send_email(to: str, subject: str, text: str, html: str = None, attachment_name: str = None, attachment_data: str = None) -> dict:
    """
    Sends an email using configured SMTP settings or SendGrid.
    Supports a base64 encoded PDF attachment.
    """
    if not config.EMAIL_USER:
        raise ValueError("Missing required EMAIL_USER environment variable")

    # Create Message
    msg = MIMEMultipart("mixed")
    msg["From"] = config.EMAIL_USER
    msg["To"] = to
    msg["Subject"] = subject

    # Body
    msg_alternative = MIMEMultipart("alternative")
    msg.attach(msg_alternative)

    part_text = MIMEText(text, "plain", "utf-8")
    msg_alternative.attach(part_text)

    if html:
        part_html = MIMEText(html, "html", "utf-8")
        msg_alternative.attach(part_html)

    # Attachment
    if attachment_name and attachment_data:
        try:
            # Strip potential header
            if "," in attachment_data:
                attachment_data = attachment_data.split(",")[1]
            file_data = base64.b64decode(attachment_data)
            
            attachment = MIMEApplication(file_data, _subtype="pdf")
            attachment.add_header("Content-Disposition", "attachment", filename=attachment_name)
            msg.attach(attachment)
            logger.info(f"Attached PDF report: {attachment_name}")
        except Exception as e:
            logger.error(f"Error attaching file: {str(e)}")

    # Send grid implementation if key is present
    if config.SENDGRID_API_KEY:
        logger.info("Sending email via SendGrid...")
        # Since sendgrid python helper might not be installed, we use a standard SMTP relay for SendGrid
        smtp_server = "smtp.sendgrid.net"
        smtp_port = 587
        smtp_username = "apikey"
        smtp_password = config.SENDGRID_API_KEY
    else:
        logger.info(f"Sending email via SMTP ({config.EMAIL_HOST}:{config.EMAIL_PORT})...")
        smtp_server = config.EMAIL_HOST
        smtp_port = config.EMAIL_PORT
        smtp_username = config.EMAIL_USER
        smtp_password = config.EMAIL_PASS

    # SMTP Execution
    try:
        # Check port to determine secure TLS or standard STARTTLS
        if smtp_port == 465 or config.EMAIL_SECURE:
            logger.info("Using SMTP_SSL connection")
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10.0) as server:
                if smtp_username and smtp_password:
                    server.login(smtp_username, smtp_password)
                server.sendmail(config.EMAIL_USER, [to], msg.as_string())
        else:
            logger.info("Using standard SMTP connection with STARTTLS")
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10.0) as server:
                server.ehlo()
                if smtp_port != 25:
                    server.starttls()
                    server.ehlo()
                if smtp_username and smtp_password:
                    server.login(smtp_username, smtp_password)
                server.sendmail(config.EMAIL_USER, [to], msg.as_string())
                
        logger.info(f"Email sent successfully to {to}")
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        # Raise error to be caught by route handler
        raise e
