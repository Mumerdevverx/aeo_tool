import transporter from './config/emailConfig.js'

export const sendEmail = async ({ to, subject, text, html, attachmentName, attachmentData }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    ...(html ? { html } : {})
  }

  if (attachmentName && attachmentData) {
    mailOptions.attachments = [
      {
        filename: attachmentName,
        content: Buffer.from(attachmentData, 'base64'),
        contentType: 'application/pdf'
      }
    ]
  }

  console.log('Mail options prepared:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    attachments: mailOptions.attachments ? mailOptions.attachments.map(a => a.filename) : []
  })

  const info = await transporter.sendMail(mailOptions)
  console.log('Nodemailer send result:', { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected })
  return info
}
