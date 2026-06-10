import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/partners  — submit partnership application
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, companyType, address, contactPerson, email, phone, description } = req.body as {
      companyName?: string
      companyType?: string
      address?: string
      contactPerson?: string
      email?: string
      phone?: string
      description?: string
    }

    if (!companyName || !companyType || !address || !contactPerson || !email || !phone) {
      res.status(400).json({ error: 'All required fields must be filled.' })
      return
    }

    const application = await prisma.partnerApplication.create({
      data: { companyName, companyType, address, contactPerson, email, phone, description: description ?? '' },
    })

    res.status(201).json({ id: application.id })
  } catch (err) {
    console.error('Partner application error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/partners  — list all applications (admin/debug)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const applications = await prisma.partnerApplication.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(applications)
  } catch (err) {
    console.error('Get partners error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
