import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sakani_super_secret_jwt_key_2025_secure';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  status: 'active' | 'suspended';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'يجب تسجيل الدخول أولاً للوصول إلى هذا المحتوى' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user still exists and is active in DB
    const userRow = db.prepare('SELECT id, name, email, phone, role, status FROM users WHERE id = ?').get(decoded.id) as any;
    
    if (!userRow) {
      res.status(401).json({ error: 'المستخدم غير موجود' });
      return;
    }

    if (userRow.status === 'suspended') {
      res.status(403).json({ error: 'تم تعطيل هذا الحساب من قبل الإدارة' });
      return;
    }

    req.user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      status: userRow.status,
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'جلسة تسجيل الدخول منتهية أو غير صالحة' });
  }
}

export function optionalAuthenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userRow = db.prepare('SELECT id, name, email, phone, role, status FROM users WHERE id = ?').get(decoded.id) as any;
    if (userRow && userRow.status === 'active') {
      req.user = {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        phone: userRow.phone,
        role: userRow.role,
        status: userRow.status,
      };
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'صلاحية غير كافية: هذا القسم خاص بإدارة منصة سكني فقط' });
    return;
  }
  next();
}

export function requireOwnerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
    res.status(403).json({ error: 'صلاحية غير كافية: يجب أن تكون مالك سكن أو مشرف موقع' });
    return;
  }
  next();
}
