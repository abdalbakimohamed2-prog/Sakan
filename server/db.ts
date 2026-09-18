import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sakani.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for reliability
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'owner', 'admin')),
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      area TEXT NOT NULL,
      university TEXT NOT NULL,
      price REAL NOT NULL,
      price_period TEXT NOT NULL DEFAULT 'month',
      rooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL DEFAULT 1,
      gender_type TEXT NOT NULL CHECK(gender_type IN ('male', 'female', 'any')),
      amenities TEXT NOT NULL, -- JSON string array
      latitude REAL,
      longitude REAL,
      verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK(verification_status IN ('verified', 'unverified')),
      listing_status TEXT NOT NULL DEFAULT 'active' CHECK(listing_status IN ('active', 'hidden', 'pending', 'rejected')),
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS property_images (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      caption TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, property_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS viewing_requests (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
      notes TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('viewing', 'verification', 'system', 'property')),
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('property', 'user')),
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'investigating', 'resolved', 'dismissed')),
      admin_action_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Check if admin user exists
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@sakani.app');
  
  if (!checkUser) {
    console.log('[Database] Seeding initial users and real properties...');
    const now = new Date().toISOString();
    const adminHash = bcrypt.hashSync('AdminPassword123!', 10);
    const ownerHash = bcrypt.hashSync('OwnerPassword123!', 10);
    const studentHash = bcrypt.hashSync('StudentPassword123!', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `);

    // 1. Admin
    insertUser.run('user-admin-1', 'إدارة منصة سكني', 'admin@sakani.app', '01012345678', adminHash, 'admin', now);
    // 2. Owner
    insertUser.run('user-owner-1', 'الحاج محمود الدسوقي (مالك)', 'owner@sakani.app', '01123456789', ownerHash, 'owner', now);
    // 3. Student
    insertUser.run('user-student-1', 'عمر الشريف (طالب)', 'student@sakani.app', '01234567890', studentHash, 'student', now);

    // Seed Real Property: «500 وحدة» (Requirement: اسم السكن/المبنى 500 وحدة وليس السعر)
    const insertProp = db.prepare(`
      INSERT INTO properties (
        id, owner_id, name, description, address, area, university, price, price_period,
        rooms, bathrooms, gender_type, amenities, latitude, longitude,
        verification_status, listing_status, views_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const amenities500 = JSON.stringify([
      'واي فاي فائق السرعة',
      'تكييف سبليت في كل غرفة',
      'أمن وحراسة على مدار 24 ساعة',
      'مطبخ مركزي متكامل مجهز',
      'غسالة أتوماتيك وثلاجة خاصة',
      'مكتب دراسة وإضاءة مريحة',
      'مصعد حديث وسلالم طوارئ',
      'خدمة تنظيف أسبوعية'
    ]);

    insertProp.run(
      'prop-500-wahda',
      'user-owner-1',
      'سكن 500 وحدة',
      'مجمع سكني طلابي فاخر يضم غرفاً فردية ومزدوجة مجهزة بالكامل بالقرب من جامعة القاهرة ومحطة المترو. يحتوي المبنى على بيئة دراسية هادئة، وصالة مذاكرة مشتركة، وأمن متواصل، ومصاعد حديثة. السكن خاضع للمعاينة الميدانية الدورية من فريق سكني.',
      'شارع الجامعة الرئيسي، بجوار المجمع الطبي ومحطة المترو',
      'بين السرايات / الدقي',
      'جامعة القاهرة',
      2750, // السعر الحقيقي وليس 500
      'month',
      3,
      2,
      'male',
      amenities500,
      30.0261,
      31.2114,
      'verified', // موثق من سكني
      'active',
      142,
      now,
      now
    );

    // Seed images for 500 وحدة
    const insertImage = db.prepare(`
      INSERT INTO property_images (id, property_id, image_url, is_primary, caption, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertImage.run(
      'img-500-1',
      'prop-500-wahda',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      1,
      'غرفة المعيشة وغرفة المذاكرة المزدوجة',
      now
    );
    insertImage.run(
      'img-500-2',
      'prop-500-wahda',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      0,
      'غرفة النوم المجهزة ومكتب الدراسة',
      now
    );
    insertImage.run(
      'img-500-3',
      'prop-500-wahda',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      0,
      'المطبخ المشترك المجهز بالكامل',
      now
    );

    // Initial notification
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `);
    insertNotif.run(
      'notif-init-1',
      'user-admin-1',
      'مرحباً بك في لوحة تحكم سكني',
      'تم إعداد منصة سكني بنجاح. يمكنك الآن إدارة السكنات، المستخدمين، طلبات المعاينة، والبلاغات بكل سهولة.',
      'system',
      '/admin',
      now
    );
    insertNotif.run(
      'notif-init-2',
      'user-owner-1',
      'تم توثيق سكنك «500 وحدة» بنجاح',
      'قام فريق إدارة سكني بالتحقق الميداني واعتماد المعاينة الموثقة لسكن 500 وحدة.',
      'verification',
      '/owner/properties',
      now
    );
  }

  // Seed default site content for CMS if not exists
  const checkContent = db.prepare('SELECT key FROM site_content WHERE key = ?').get('hero_title');
  if (!checkContent) {
    const now = new Date().toISOString();
    const insertContent = db.prepare(`
      INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)
    `);

    insertContent.run('hero_title', 'سكنك الجامعي يبدأ من هنا', now);
    insertContent.run(
      'hero_subtitle',
      'منصة «سكني» المتخصصة لمساعدة طلاب الجامعات في العثور على سكن آمن، نظيف، وبدون وسطاء أو أسعار وهمية مع ميزة المعاينة الميدانية الموثقة.',
      now
    );

    insertContent.run('stats', JSON.stringify([
      { label: 'سكن مفحوص وموثق', value: '100%', sub: 'بالمعاينة الميدانية' },
      { label: 'سكن متوفر بالمنظومة', value: '15+', sub: 'منها سكن 500 وحدة' },
      { label: 'جامعات مغطاة', value: '12+', sub: 'القاهرة وعين شمس وحلوان وغيرها' },
      { label: 'طلاب مستفيدين', value: '2,400+', sub: 'بحثوا ووجدوا سكنهم' }
    ]), now);

    insertContent.run('why_sakani', JSON.stringify([
      {
        title: 'معاينة موثقة 100%',
        description: 'فريق سكني يفحص العقار على أرض الواقع ويتحقق من الصور والخدمات حتى لا تفاجأ عند وصولك.',
        icon: 'ShieldCheck'
      },
      {
        title: 'صفر عمولات سماسرة',
        description: 'تواصل مباشر مع المالك أو إدارة السكن المعتمدة دون دفع عمولات استغلالية.',
        icon: 'BadgePercent'
      },
      {
        title: 'بالقرب من جامعتك',
        description: 'فلاتر دقيقة حسب المسافة للجامعات والمترو والمواصلات الحيوية لتوفير وقتك وجهدك.',
        icon: 'GraduationCap'
      },
      {
        title: 'حجز مواعيد معاينة مسبقة',
        description: 'حدد اليوم والوقت المناسب لزيارة السكن وتأكيده بضغطة زر واحدة.',
        icon: 'CalendarCheck'
      }
    ]), now);

    insertContent.run('how_it_works', JSON.stringify([
      {
        step: '1',
        title: 'ابحث باسم الجامعة أو المنطقة',
        desc: 'حدد جامعتك وميزانيتك ونوع السكن (طلاب أو طالبات) لتظهر لك الخيارات المتاحة.'
      },
      {
        step: '2',
        title: 'تصفح السكنات بمعاينة موثقة',
        desc: 'شاهد الصور الحقيقية وتفاصيل الغرف والخدمات وموقع السكن بدون أي إعلانات مضللة.'
      },
      {
        step: '3',
        title: 'اطلب معاينة أو احجز موعدك',
        desc: 'أرسل طلب معاينة باختيار اليوم والوقت وتابع الرد مباشرة عبر لوحة التحكم الخاصة بك.'
      }
    ]), now);

    insertContent.run('faq', JSON.stringify([
      {
        q: 'ما هي ميزة «المعاينة الموثقة من سكني»؟',
        a: 'هي شارة تمنحها إدارة المنصة للسكن بعد زيارة ميدانية فعلية لفريقنا للتحقق من مطابقة الصور، توفر الخدمات المعلنة (تكييف، واي فاي، أمان)، وصحة الأسعار.'
      },
      {
        q: 'هل توجد أي رسوم أو عمولة على الطالب عند البحث أو طلب المعاينة؟',
        a: 'لا، استخدام منصة سكني للبحث وطلب المعاينات مجاني تماماً للطلاب بدون أي عمولات خفية.'
      },
      {
        q: 'كيف يمكن لمالك السكن إضافة سكن جديد؟',
        a: 'يسجل المالك حساباً جديداً بنوع «مالك سكن»، ثم يدخل إلى لوحة التحكم الخاصة به ليضيف تفاصيل السكن وصوره، ويقوم فريق الإدارة بمراجعته وتوثيقه.'
      },
      {
        q: 'ما هو سكن «500 وحدة» المتواجد بالمنصة؟',
        a: 'سكن 500 وحدة هو اسم مجمع سكني حقيقي مخصص للطلاب، وهو اسم المبنى الرسمي وليس سعر الإيجار.'
      }
    ]), now);

    insertContent.run('contact_info', JSON.stringify({
      phone: '+20 100 123 4567',
      email: 'support@sakani.app',
      address: 'القاهرة، الجيزة - بالقرب من جامعة القاهرة',
      whatsapp: '+201001234567',
      working_hours: 'يومياً من 9:00 صباحاً حتى 9:00 مساءً'
    }), now);

    insertContent.run('social_links', JSON.stringify({
      facebook: 'https://facebook.com/sakani.eg',
      instagram: 'https://instagram.com/sakani.eg',
      twitter: 'https://twitter.com/sakani_eg',
      telegram: 'https://t.me/sakani_eg'
    }), now);
  }
}
