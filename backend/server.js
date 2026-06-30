import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import emailRoutes from './routes/emailRoutes.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '12mb' }))

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Email backend is running',
    endpoints: {
      health: 'GET /',
      sendEmail: 'POST /api/send-email'
    }
  })
})

app.use('/api', emailRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal Server Error' })
})

const PORT = Number(process.env.PORT || 5000)
app.listen(PORT, () => {
  console.log(`Email backend running on http://localhost:${PORT}`)
})
