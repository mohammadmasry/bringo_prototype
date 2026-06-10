import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

function makeToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET ?? 'bringo-dev-secret-change-in-prod'
  return jwt.sign({ userId, role }, secret, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, password, phone } = req.body as {
      email?: string
      firstName?: string
      lastName?: string
      password?: string
      phone?: string
    }

    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, firstName, lastName, passwordHash, phone: phone ?? null },
    })

    const token = makeToken(user.id, user.role)
    res.status(201).json({
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = makeToken(user.id, user.role)
    res.json({
      token,
      user: { id: user.id, firstName: user.firstName, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ id: user.id, firstName: user.firstName, email: user.email, role: user.role })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
