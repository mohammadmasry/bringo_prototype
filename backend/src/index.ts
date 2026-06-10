import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import ordersRouter from './routes/orders'
import surveysRouter from './routes/surveys'
import feedbackRouter from './routes/feedback'
import partnersRouter from './routes/partners'
import conversationsRouter from './routes/conversations'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/surveys', surveysRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/partners', partnersRouter)
app.use('/api/conversations', conversationsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Bringo backend running on http://localhost:${PORT}`)
})
