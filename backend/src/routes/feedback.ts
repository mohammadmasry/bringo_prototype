import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/feedback
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { stars, liked, improve, email, page } = req.body as {
      stars?: number
      liked?: string
      improve?: string
      email?: string
      page?: string
    }

    if (!stars || stars < 1 || stars > 5) {
      res.status(400).json({ error: 'stars must be between 1 and 5' })
      return
    }

    const feedback = await prisma.feedback.create({
      data: {
        stars,
        liked: liked ?? '',
        improve: improve ?? '',
        email: email ?? '',
        page: page ?? '',
      },
    })

    res.status(201).json({ id: feedback.id })
  } catch (err) {
    console.error('Feedback error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/feedback  (for viewing in Prisma Studio / debug)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const all = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(all)
  } catch (err) {
    console.error('Get feedback error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
