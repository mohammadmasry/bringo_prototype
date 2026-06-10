import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/conversations — create a new conversation, returns its id
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lang } = req.body as { lang?: string }
    const conversation = await prisma.conversation.create({ data: { lang: lang ?? 'de' } })
    res.status(201).json({ id: conversation.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/conversations/:id/messages — append a message
router.post('/:id/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, inputType, content } = req.body as {
      role?: string; inputType?: string; content?: string
    }
    if (!role || !content) { res.status(400).json({ error: 'role and content are required' }); return }

    const msg = await prisma.conversationMessage.create({
      data: {
        conversationId: req.params.id,
        role,
        inputType: inputType ?? 'text',
        content,
      },
    })
    res.status(201).json({ id: msg.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/conversations/:id — full conversation with messages
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } }, orders: true },
    })
    if (!conv) { res.status(404).json({ error: 'Not found' }); return }
    res.json(conv)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/conversations — all conversations (debug)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const all = await prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { messages: true, orders: { select: { id: true, status: true, pickup: true, dropoff: true } } },
    })
    res.json(all)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
