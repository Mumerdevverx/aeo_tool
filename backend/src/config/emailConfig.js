import nodemailer from 'nodemailer'
import 'dotenv/config'

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = '465',
  EMAIL_SECURE = 'true',
  EMAIL_SERVICE,
  SENDGRID_API_KEY
} = process.env

if (!EMAIL_USER) {
  throw new Error('Missing required EMAIL_USER environment variable')
}

const useSendGrid = Boolean(SENDGRID_API_KEY)

const transportOptions = {}

if (useSendGrid) {
  console.log('Using SendGrid for email delivery')
  transportOptions.service = 'SendGrid'
  transportOptions.auth = {
    user: 'apikey',
    pass: SENDGRID_API_KEY
  }
} else {
  if (!EMAIL_PASS) {
    throw new Error('Missing required EMAIL_PASS environment variable for SMTP transport')
  }

  const useGmailService = EMAIL_SERVICE === 'gmail' || EMAIL_HOST.includes('gmail.com')

  transportOptions.auth = {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }

  if (useGmailService) {
    transportOptions.service = 'gmail'
  } else {
    transportOptions.host = EMAIL_HOST
    transportOptions.port = Number(EMAIL_PORT)
    transportOptions.secure = EMAIL_SECURE === 'true'
  }
}

const transporter = nodemailer.createTransport(transportOptions)

transporter.verify()
  .then(() => {
    console.log('SMTP transporter verified successfully')
  })
  .catch((error) => {
    console.error('SMTP transporter verification failed:', error.message || error)
    if (error.response && typeof error.response === 'string' && error.response.includes('BadCredentials')) {
      console.error('Gmail login failed. Use a valid App Password or verify your account credentials and security settings.')
    }
  })

export default transporter
