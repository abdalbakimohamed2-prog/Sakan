import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { db } from './db.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
  generateToken,
  AuthenticatedRequest
} from './auth.js';

export const apiRouter = Router();

// Configure Multer for disk uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('الملف المرفوع يجب أن يكون صورة فقط (JPG, PNG, WebP)'));
    }
  }
});

// Helper for sending notifications
function createNotification(userId: string, title: string, message: string, type: 'viewing' | 'verification' | 'system' | 'property', link?: string) {
  try {
    const id = 'notif-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, userId, title, message, type, link || null, now);
  } catch (err) {
    console.error('Failed to create notification', err);
  }
}

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'الرجاء ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور، ونوع الحساب)' });
      return;
    }

    if (!['student', 'owner'].includes(role)) {
      res.status(400).json({ error: 'نوع الحساب يجب أن يكون طالباً أو مالك سكن' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 خانات' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' });
      return;
    }

    const userId = 'user-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(userId, name.trim(), email.trim().toLowerCase(), phone?.trim() || null, passwordHash, role, now);

    const userObj = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      role: role as 'student' | 'owner',
      status: 'active' as const
    };

    const token = generateToken(userObj);

    // Welcome notification
    createNotification(
      userId,
      'أهلاً بك في منصة سكني!',
      `مرحباً بك ${name.trim()}! نسعد بانضمامك لمنصة سكني المتخصصة في سكن الطلاب.`,
      'system',
      role === 'owner' ? '/owner' : '/dashboard'
    );

    res.status(201).json({
      user: userObj,
      token,
      message: 'تم إنشاء الحساب بنجاح'
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب: ' + err.message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني أو الهاتف وكلمة المرور' });
      return;
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const userRow = db.prepare(`
      SELECT id, name, email, phone, password_hash, role, status
      FROM users
      WHERE LOWER(email) = ? OR phone = ?
    `).get(cleanIdentifier, identifier.trim()) as any;

    if (!userRow) {
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة ثانية' });
      return;
    }

    if (userRow.status === 'suspended') {
      res.status(403).json({ error: 'تم تعطيل هذا الحساب من قبل إدارة المنصة' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, userRow.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      return;
    }

    const userObj = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      status: userRow.status
    };

    const token = generateToken(userObj);

    res.json({
      user: userObj,
      token,
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' });
  }
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const unreadNotifs = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user!.id) as any;

    res.json({
      user: req.user,
      unreadNotificationsCount: unreadNotifs?.count || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!name) {
      res.status(400).json({ error: 'الاسم مطلوب' });
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية لتغييرها' });
        return;
      }
      const userRecord = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
      if (!bcrypt.compareSync(currentPassword, userRecord.password_hash)) {
        res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
        return;
      }
      const newHash = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    }

    db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name.trim(), phone?.trim() || null, userId);

    res.json({ message: 'تم تحديث الملف الشخصي بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. IMAGE UPLOAD ROUTE
// ----------------------------------------------------

apiRouter.post('/upload', optionalAuthenticateToken, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'لم يتم استلام أي صورة' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'فشل رفع الصورة: ' + err.message });
  }
});

// ----------------------------------------------------
// 3. PROPERTIES ROUTES
// ----------------------------------------------------

apiRouter.get('/properties', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      university,
      area,
      minPrice,
      maxPrice,
      rooms,
      genderType,
      verifiedOnly,
      status,
      ownerId
    } = req.query;

    let query = `
      SELECT p.*, u.name as owner_name, u.phone as owner_phone,
             (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as images_count
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Access control:
    // If regular user or not logged in, only show 'active' listings unless filtering for own properties as owner
    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user?.role === 'owner';

    if (ownerId) {
      query += ` AND p.owner_id = ?`;
      params.push(ownerId);
    } else if (!isAdmin) {
      query += ` AND p.listing_status = 'active'`;
    } else if (status) {
      query += ` AND p.listing_status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.address LIKE ? OR p.area LIKE ? OR p.university LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (university) {
      query += ` AND p.university LIKE ?`;
      params.push(`%${university}%`);
    }

    if (area) {
      query += ` AND p.area LIKE ?`;
      params.push(`%${area}%`);
    }

    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (rooms) {
      query += ` AND p.rooms = ?`;
      params.push(Number(rooms));
    }

    if (genderType && genderType !== 'all') {
      query += ` AND (p.gender_type = ? OR p.gender_type = 'any')`;
      params.push(genderType);
    }

    if (verifiedOnly === 'true' || verifiedOnly === '1') {
      query += ` AND p.verification_status = 'verified'`;
    }

    query += ` ORDER BY p.verification_status DESC, p.created_at DESC`;

    const properties = db.prepare(query).all(...params) as any[];

    // Parse amenities JSON and check favorites if user is authenticated
    const userFavorites = req.user ? new Set(
      (db.prepare('SELECT property_id FROM favorites WHERE user_id = ?').all(req.user.id) as any[]).map(f => f.property_id)
    ) : new Set();

    const formatted = properties.map(p => ({
      ...p,
      amenities: JSON.parse(p.amenities || '[]'),
      is_favorited: userFavorites.has(p.id)
    }));

    res.json({ properties: formatted, count: formatted.length });
  } catch (err: any) {
    console.error('Properties fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/properties/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Increment views count
    db.prepare('UPDATE properties SET views_count = views_count + 1 WHERE id = ?').run(id);

    const property = db.prepare(`
      SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(id) as any;

    if (!property) {
      res.status(404).json({ error: 'السكن غير موجود أو تم حذفه' });
      return;
    }

    const images = db.prepare(`
      SELECT id, image_url, is_primary, caption FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, created_at ASC
    `).all(id);

    let is_favorited = false;
    if (req.user) {
      const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?').get(req.user.id, id);
      is_favorited = !!fav;
    }

    res.json({
      property: {
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images,
        is_favorited
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/properties', authenticateToken, requireOwnerOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      area,
      university,
      price,
      price_period = 'month',
      rooms,
      bathrooms = 1,
      gender_type = 'any',
      amenities = [],
      latitude,
      longitude,
      images = []
    } = req.body;

    if (!name || !description || !address || !area || !university || !price || !rooms) {
      res.status(400).json({ error: 'يرجى إكمال الحقول الأساسية للسكن' });
      return;
    }

    const propId = 'prop-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    const ownerId = req.user!.role === 'admin' && req.body.owner_id ? req.body.owner_id : req.user!.id;
    const now = new Date().toISOString();
    const verificationStatus = req.user!.role === 'admin' && req.body.verification_status ? req.body.verification_status : 'unverified';
    const listingStatus = req.user!.role === 'admin' ? (req.body.listing_status || 'active') : 'pending';

    db.prepare(`
      INSERT INTO properties (
        id, owner_id, name, description, address, area, university, price, price_period,
        rooms, bathrooms, gender_type, amenities, latitude, longitude,
        verification_status, listing_status, views_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      propId,
      ownerId,
      name.trim(),
      description.trim(),
      address.trim(),
      area.trim(),
      university.trim(),
      Number(price),
      price_period,
      Number(rooms),
      Number(bathrooms),
      gender_type,
      JSON.stringify(Array.isArray(amenities) ? amenities : []),
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      verificationStatus,
      listingStatus,
      now,
      now
    );

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      const insertImg = db.prepare(`
        INSERT INTO property_images (id, property_id, image_url, is_primary, caption, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      images.forEach((imgUrl: string, idx: number) => {
        const imgId = 'img-' + Date.now() + '-' + idx;
        insertImg.run(imgId, propId, imgUrl, idx === 0 ? 1 : 0, '', now);
      });
    }

    // Admin notification
    const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as any;
    if (adminUser) {
      createNotification(
        adminUser.id,
        'سكن جديد بانتظار المراجعة والتوثيق',
        `أضاف ${req.user!.name} سكناً جديداً: «${name.trim()}» في منطقة ${area.trim()}.`,
        'property',
        `/admin/properties`
      );
    }

    res.status(201).json({
      id: propId,
      message: 'تمت إضافة السكن بنجاح'
    });
  } catch (err: any) {
    console.error('Property creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/properties/:id', authenticateToken, requireOwnerOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as any;

    if (!property) {
      res.status(404).json({ error: 'السكن غير موجود' });
      return;
    }

    if (req.user!.role !== 'admin' && property.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'ليس لديك صلاحية تعديل هذا السكن' });
      return;
    }

    const {
      name,
      description,
      address,
      area,
      university,
      price,
      price_period,
      rooms,
      bathrooms,
      gender_type,
      amenities,
      latitude,
      longitude,
      verification_status,
      listing_status,
      images
    } = req.body;

    const now = new Date().toISOString();
    const updatedVerification = req.user!.role === 'admin' && verification_status !== undefined ? verification_status : property.verification_status;
    const updatedListingStatus = req.user!.role === 'admin' && listing_status !== undefined ? listing_status : (req.body.listing_status || property.listing_status);

    db.prepare(`
      UPDATE properties SET
        name = ?, description = ?, address = ?, area = ?, university = ?,
        price = ?, price_period = ?, rooms = ?, bathrooms = ?, gender_type = ?,
        amenities = ?, latitude = ?, longitude = ?, verification_status = ?,
        listing_status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name || property.name,
      description || property.description,
      address || property.address,
      area || property.area,
      university || property.university,
      price !== undefined ? Number(price) : property.price,
      price_period || property.price_period,
      rooms !== undefined ? Number(rooms) : property.rooms,
      bathrooms !== undefined ? Number(bathrooms) : property.bathrooms,
      gender_type || property.gender_type,
      amenities ? JSON.stringify(amenities) : property.amenities,
      latitude !== undefined ? Number(latitude) : property.latitude,
      longitude !== undefined ? Number(longitude) : property.longitude,
      updatedVerification,
      updatedListingStatus,
      now,
      id
    );

    // Update images if provided
    if (Array.isArray(images)) {
      db.prepare('DELETE FROM property_images WHERE property_id = ?').run(id);
      const insertImg = db.prepare(`
        INSERT INTO property_images (id, property_id, image_url, is_primary, caption, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      images.forEach((imgUrl: string, idx: number) => {
        const imgId = 'img-' + Date.now() + '-' + idx;
        insertImg.run(imgId, id, imgUrl, idx === 0 ? 1 : 0, '', now);
      });
    }

    res.json({ message: 'تم تحديث بيانات السكن بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/properties/:id', authenticateToken, requireOwnerOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = db.prepare('SELECT owner_id, name FROM properties WHERE id = ?').get(id) as any;

    if (!property) {
      res.status(404).json({ error: 'السكن غير موجود' });
      return;
    }

    if (req.user!.role !== 'admin' && property.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'ليس لديك صلاحية حذف هذا السكن' });
      return;
    }

    db.prepare('DELETE FROM properties WHERE id = ?').run(id);
    res.json({ message: `تم حذف السكن «${property.name}» بنجاح` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin toggle verification
apiRouter.patch('/properties/:id/verify', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const newStatus = verified ? 'verified' : 'unverified';

    const prop = db.prepare('SELECT owner_id, name FROM properties WHERE id = ?').get(id) as any;
    if (!prop) {
      res.status(404).json({ error: 'السكن غير موجود' });
      return;
    }

    db.prepare('UPDATE properties SET verification_status = ?, updated_at = ? WHERE id = ?')
      .run(newStatus, new Date().toISOString(), id);

    // Notify owner
    createNotification(
      prop.owner_id,
      verified ? '✓ تم اعتماد المعاينة الموثقة لسكنك' : 'تم إزالة التوثيق عن السكن',
      verified
        ? `تهانينا! قامت إدارة سكني باعتماد شارة «معاينة موثقة من سكني» لسكنك «${prop.name}».`
        : `تم تحديث حالة السكن «${prop.name}» إلى غير موثق حالياً.`,
      'verification',
      `/property/${id}`
    );

    res.json({
      verification_status: newStatus,
      message: verified ? 'تم توثيق السكن بنجاح' : 'تم إزالة التوثيق عن السكن'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Owner toggle status (active, hidden, rejected, pending)
apiRouter.patch('/properties/:id/status', authenticateToken, requireOwnerOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'hidden', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'حالة غير صالحة' });
      return;
    }

    const prop = db.prepare('SELECT owner_id, name FROM properties WHERE id = ?').get(id) as any;
    if (!prop) {
      res.status(404).json({ error: 'السكن غير موجود' });
      return;
    }

    if (req.user!.role !== 'admin' && prop.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'ليس لديك صلاحية تغيير حالة هذا السكن' });
      return;
    }

    db.prepare('UPDATE properties SET listing_status = ?, updated_at = ? WHERE id = ?')
      .run(status, new Date().toISOString(), id);

    if (req.user!.role === 'admin' && prop.owner_id !== req.user!.id) {
      createNotification(
        prop.owner_id,
        `تحديث حالة السكن: «${prop.name}»`,
        `قام المشرف بتغيير حالة السكن إلى: ${status === 'active' ? 'منشور ونشط' : status === 'hidden' ? 'مخفي' : status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}.`,
        'property',
        `/property/${id}`
      );
    }

    res.json({ listing_status: status, message: 'تم تحديث حالة السكن بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. VIEWING REQUESTS ROUTES
// ----------------------------------------------------

apiRouter.post('/viewing-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { property_id, preferred_date, preferred_time, notes } = req.body;
    const student_id = req.user!.id;

    if (!property_id || !preferred_date || !preferred_time) {
      res.status(400).json({ error: 'يرجى تحديد السكن وتاريخ ووقت المعاينة المفضل' });
      return;
    }

    const prop = db.prepare('SELECT owner_id, name FROM properties WHERE id = ?').get(property_id) as any;
    if (!prop) {
      res.status(404).json({ error: 'السكن غير موجود' });
      return;
    }

    const requestId = 'view-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO viewing_requests (id, student_id, property_id, preferred_date, preferred_time, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).run(requestId, student_id, property_id, preferred_date, preferred_time, notes?.trim() || null, now, now);

    // Notify owner
    createNotification(
      prop.owner_id,
      'طلب معاينة جديد لسكنك!',
      `أرسل الطالب ${req.user!.name} طلب معاينة لسكن «${prop.name}» في موعد: ${preferred_date} الساعة ${preferred_time}.`,
      'viewing',
      '/owner/viewings'
    );

    // Notify student
    createNotification(
      student_id,
      'تم إرسال طلب المعاينة بنجاح',
      `تم إرسال طلب معاينتك لسكن «${prop.name}». سيقوم المالك أو إدارة السكن بمراجعة الموعد والتأكيد معك.`,
      'viewing',
      '/dashboard/viewings'
    );

    res.status(201).json({
      id: requestId,
      message: 'تم إرسال طلب المعاينة بنجاح! سيصلك إشعار فور مراجعته وتأكيده.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/viewing-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    let query = `
      SELECT vr.*, p.name as property_name, p.address as property_address, p.area as property_area, p.price as property_price,
             u.name as student_name, u.phone as student_phone, u.email as student_email,
             o.name as owner_name, o.phone as owner_phone
      FROM viewing_requests vr
      JOIN properties p ON vr.property_id = p.id
      JOIN users u ON vr.student_id = u.id
      JOIN users o ON p.owner_id = o.id
    `;
    const params: any[] = [];

    if (user.role === 'student') {
      query += ` WHERE vr.student_id = ?`;
      params.push(user.id);
    } else if (user.role === 'owner') {
      query += ` WHERE p.owner_id = ?`;
      params.push(user.id);
    } // Admin sees all

    query += ` ORDER BY vr.created_at DESC`;

    const requests = db.prepare(query).all(...params);
    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/viewing-requests/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const user = req.user!;

    if (!['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'حالة غير صالحة' });
      return;
    }

    const vr = db.prepare(`
      SELECT vr.*, p.name as property_name, p.owner_id
      FROM viewing_requests vr
      JOIN properties p ON vr.property_id = p.id
      WHERE vr.id = ?
    `).get(id) as any;

    if (!vr) {
      res.status(404).json({ error: 'طلب المعاينة غير موجود' });
      return;
    }

    // Check permission: student can cancel their own, owner of property or admin can accept/reject/complete
    if (user.role === 'student' && vr.student_id === user.id) {
      if (status !== 'cancelled') {
        res.status(403).json({ error: 'يمكنك فقط إلغاء طلب المعاينة الخاص بك' });
        return;
      }
    } else if (user.role === 'owner' && vr.owner_id !== user.id) {
      res.status(403).json({ error: 'ليس لديك صلاحية إدارة هذا الطلب' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE viewing_requests SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?
    `).run(status, admin_notes || vr.admin_notes, now, id);

    // Notify student about status change
    const statusText = status === 'approved' ? 'تمت الموافقة على موعد المعاينة ✓' :
                       status === 'rejected' ? 'تم الاعتذار عن موعد المعاينة' :
                       status === 'completed' ? 'تمت المعاينة بنجاح' : 'تم إلغاء طلب المعاينة';

    createNotification(
      vr.student_id,
      `تحديث طلب معاينة سكن «${vr.property_name}»`,
      `الحالة الآن: ${statusText}. ${admin_notes ? `ملاحظة: ${admin_notes}` : ''}`,
      'viewing',
      '/dashboard/viewings'
    );

    res.json({ message: 'تم تحديث طلب المعاينة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. FAVORITES ROUTES
// ----------------------------------------------------

apiRouter.get('/favorites', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const favorites = db.prepare(`
      SELECT p.*, f.created_at as favorited_at,
             (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user!.id) as any[];

    const formatted = favorites.map(f => ({
      ...f,
      amenities: JSON.parse(f.amenities || '[]'),
      is_favorited: true
    }));

    res.json({ favorites: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/favorites/:propertyId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?').get(userId, propertyId) as any;

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      res.json({ favorited: false, message: 'تمت إزالة السكن من المفضلة' });
    } else {
      const favId = 'fav-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
      db.prepare('INSERT INTO favorites (id, user_id, property_id, created_at) VALUES (?, ?, ?, ?)')
        .run(favId, userId, propertyId, new Date().toISOString());
      res.json({ favorited: true, message: 'تمت إضافة السكن إلى المفضلة' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. NOTIFICATIONS ROUTES
// ----------------------------------------------------

apiRouter.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifs = db.prepare(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.user!.id);
    res.json({ notifications: notifs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
    res.json({ success: true, message: 'تم تحديد جميع الإشعارات كمقروءة' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. REPORTS ROUTES
// ----------------------------------------------------

apiRouter.post('/reports', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { target_type, target_id, reason, details } = req.body;
    if (!target_type || !target_id || !reason) {
      res.status(400).json({ error: 'يرجى تحديد سبب البلاغ والجهة المبلغ عنها' });
      return;
    }

    const reportId = 'rep-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(reportId, req.user!.id, target_type, target_id, reason.trim(), details?.trim() || null, now);

    // Notify admin
    const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as any;
    if (adminUser) {
      createNotification(
        adminUser.id,
        'بلاغ جديد وارد يحتاج للمراجعة',
        `أرسل ${req.user!.name} بلاغاً بسبب: «${reason}».`,
        'system',
        '/admin/reports'
      );
    }

    res.status(201).json({ message: 'تم إرسال البلاغ وسيقوم فريق الإدارة بمراجعته فوراً' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone
      FROM reports r
      JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC
    `).all() as any[];

    // Augment with target details
    const augmented = reports.map(r => {
      let target_name = r.target_id;
      if (r.target_type === 'property') {
        const p = db.prepare('SELECT name FROM properties WHERE id = ?').get(r.target_id) as any;
        if (p) target_name = `سكن: ${p.name}`;
      } else if (r.target_type === 'user') {
        const u = db.prepare('SELECT name FROM users WHERE id = ?').get(r.target_id) as any;
        if (u) target_name = `مستخدم: ${u.name}`;
      }
      return { ...r, target_name };
    });

    res.json({ reports: augmented });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/reports/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_action_notes } = req.body;

    db.prepare('UPDATE reports SET status = ?, admin_action_notes = ? WHERE id = ?')
      .run(status, admin_action_notes || null, id);

    res.json({ message: 'تم تحديث حالة البلاغ بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. ADMIN USER MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/admin/users', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, phone, role, status, created_at,
             (SELECT COUNT(*) FROM properties WHERE owner_id = users.id) as properties_count,
             (SELECT COUNT(*) FROM viewing_requests WHERE student_id = users.id) as viewing_requests_count
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status, name, phone } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    if (user.role === 'admin' && req.user!.id !== id && (status === 'suspended' || role !== 'admin')) {
      res.status(400).json({ error: 'لا يمكن تعطيل أو خفض رتبة حساب مسؤول آخر' });
      return;
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(name || null, phone || null, role || null, status || null, id);

    res.json({ message: 'تم تحديث بيانات المستخدم بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user!.id === id) {
      res.status(400).json({ error: 'لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول منه' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'تم حذف المستخدم وجميع بياناته المرتبطة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 9. SITE CONTENT (CMS) & SETTINGS - Fully Editable via Admin Dashboard
// ----------------------------------------------------

apiRouter.get('/content', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_content').all() as any[];
    const content: Record<string, any> = {};
    rows.forEach(r => {
      try {
        content[r.key] = JSON.parse(r.value);
      } catch {
        content[r.key] = r.value;
      }
    });
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/content', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const upsert = db.prepare(`
      INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    for (const [key, val] of Object.entries(updates)) {
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      upsert.run(key, strVal, now);
    }

    res.json({ message: 'تم حفظ وتحديث محتوى الموقع بنجاح في قاعدة البيانات!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. ADMIN DASHBOARD STATS & BACKUP
// ----------------------------------------------------

apiRouter.get('/admin/stats', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const studentsCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get() as any).c;
    const ownersCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'owner'").get() as any).c;
    const totalProperties = (db.prepare('SELECT COUNT(*) as c FROM properties').get() as any).c;
    const verifiedProperties = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE verification_status = 'verified'").get() as any).c;
    const activeListings = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE listing_status = 'active'").get() as any).c;
    const pendingViewings = (db.prepare("SELECT COUNT(*) as c FROM viewing_requests WHERE status = 'pending'").get() as any).c;
    const totalViewings = (db.prepare('SELECT COUNT(*) as c FROM viewing_requests').get() as any).c;
    const pendingReports = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'pending'").get() as any).c;
    const totalViews = (db.prepare('SELECT SUM(views_count) as c FROM properties').get() as any).c || 0;

    const recentProperties = db.prepare(`
      SELECT p.id, p.name, p.area, p.price, p.verification_status, p.listing_status, p.created_at, u.name as owner_name
      FROM properties p JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC LIMIT 5
    `).all();

    const recentViewings = db.prepare(`
      SELECT vr.*, p.name as property_name, u.name as student_name
      FROM viewing_requests vr
      JOIN properties p ON vr.property_id = p.id
      JOIN users u ON vr.student_id = u.id
      ORDER BY vr.created_at DESC LIMIT 5
    `).all();

    res.json({
      stats: {
        totalUsers,
        studentsCount,
        ownersCount,
        totalProperties,
        verifiedProperties,
        activeListings,
        pendingViewings,
        totalViewings,
        pendingReports,
        totalViews
      },
      recentProperties,
      recentViewings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real Database Backup export
apiRouter.get('/admin/backup', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const backupData = {
      exported_at: new Date().toISOString(),
      version: '1.0',
      database: 'sakani.db (SQLite)',
      tables: {
        users: db.prepare('SELECT id, name, email, phone, role, status, created_at FROM users').all(),
        properties: db.prepare('SELECT * FROM properties').all(),
        property_images: db.prepare('SELECT * FROM property_images').all(),
        viewing_requests: db.prepare('SELECT * FROM viewing_requests').all(),
        reports: db.prepare('SELECT * FROM reports').all(),
        favorites: db.prepare('SELECT * FROM favorites').all(),
        site_content: db.prepare('SELECT * FROM site_content').all()
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sakani-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
