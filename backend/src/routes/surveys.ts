import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/surveys
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lang, answers } = req.body as { lang?: string; answers?: unknown }

    if (!lang || answers === undefined) {
      res.status(400).json({ error: 'lang and answers are required' })
      return
    }

    const survey = await prisma.survey.create({
      data: {
        lang,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
      },
    })

    res.status(201).json(survey)
  } catch (err) {
    console.error('Create survey error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/surveys
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const surveys = await prisma.survey.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(surveys)
  } catch (err) {
    console.error('Get surveys error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
