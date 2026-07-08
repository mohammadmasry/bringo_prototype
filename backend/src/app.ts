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

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

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

export default app
