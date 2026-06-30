import { sendEmail } from '../email.js'

export const sendEmailController = async (req, res, next) => {
  try {
    console.log('Received send-email request', { body: req.body })
    const { to, subject, text, html, attachmentName, attachmentData } = req.body

    if (!to || !subject || !text) {
      return res.status(400).json({
        error: 'Request body must include to, subject, and text fields'
      })
    }

    const mailPayload = {
      to,
      subject,
      text,
      html
    }

    if (attachmentName && attachmentData) {
      mailPayload.attachmentName = attachmentName
      mailPayload.attachmentData = attachmentData
    }

    console.log('Sending email:', {
      to,
      subject,
      hasAttachment: Boolean(attachmentName && attachmentData)
    })

    const info = await sendEmail(mailPayload)

    return res.status(200).json({
      message: 'Email sent successfully',
      messageId: info.messageId
    })
  } catch (error) {
    return next(error)
  }
}

 