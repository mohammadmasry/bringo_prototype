import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// POST /api/orders
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pickup, dropoff, description, size, price, note, conversationId } = req.body as {
      pickup?: string; dropoff?: string; description?: string
      size?: string; price?: number; note?: string; conversationId?: string
    }

    if (!pickup || !dropoff || !description || !size || price === undefined) {
      res.status(400).json({ error: 'pickup, dropoff, description, size, and price are required' })
      return
    }

    // Optionally attach userId if auth header is present
    const authHeader = req.headers.authorization
    let userId: string | undefined
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken')
        const secret = process.env.JWT_SECRET ?? 'bringo-dev-secret-change-in-prod'
        const payload = jwt.default.verify(authHeader.slice(7), secret) as { userId: string }
        userId = payload.userId
      } catch {
        // token invalid — proceed without userId
      }
    }

    const order = await prisma.order.create({
      data: {
        pickup,
        dropoff,
        description,
        size,
        price,
        note: note ?? '',
        userId: userId ?? null,
        conversationId: conversationId ?? null,
      },
    })

    res.status(201).json({ id: order.id, status: order.status })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/orders  (authenticated user's orders)
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch (err) {
    console.error('Get orders error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/orders/all  (admin/debug — all orders)
router.get('/all', async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    })
    res.json(orders)
  } catch (err) {
    console.error('Get all orders error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
