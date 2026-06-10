import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET ?? 'bringo-dev-secret-change-in-prod'

  try {
    const payload = jwt.verify(token, secret) as { userId: string; role: string }
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
