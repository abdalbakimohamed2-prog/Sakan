import {
  User,
  Property,
  ViewingRequest,
  AppNotification,
  Report,
  SiteContent,
  PropertyFilterState
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('sakani_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // --- AUTH ---
  async login(identifier: string, password: string):Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
    localStorage.setItem('sakani_token', data.token);
    return data;
  },

  async register(formData: { name: string; email: string; phone?: string; password: string; role: 'student' | 'owner' }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
    localStorage.setItem('sakani_token', data.token);
    return data;
  },

  async getMe(): Promise<{ user: User; unreadNotificationsCount: number }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'غير مصرح');
    return data;
  },

  async updateProfile(profileData: {
    name: string;
    phone?: string;
    current_password?: string;
    new_password?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث الملف');
    return data;
  },

  // --- PROPERTIES ---
  async getProperties(filters?: Partial<PropertyFilterState> & { ownerId?: string; status?: string }): Promise<{ properties: Property[]; count: number }> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.university) params.append('university', filters.university);
      if (filters.area) params.append('area', filters.area);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.rooms) params.append('rooms', filters.rooms);
      if (filters.genderType) params.append('genderType', filters.genderType);
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      if (filters.ownerId) params.append('ownerId', filters.ownerId);
      if (filters.status) params.append('status', filters.status);
    }
    const res = await fetch(`${API_BASE}/properties?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب السكنات');
    return data;
  },

  async getMyProperties(): Promise<{ properties: Property[]; count: number }> {
    const res = await fetch(`${API_BASE}/properties?ownerId=me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب سكناتي');
    return data;
  },

  async getProperty(id: string): Promise<{ property: Property }> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'السكن غير موجود');
    return data;
  },

  async createProperty(payload: Omit<Partial<Property>, 'images'> & { images?: string[] }): Promise<{ id: string; message: string }> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إضافة السكن');
    return data;
  },

  async updateProperty(id: string, payload: Omit<Partial<Property>, 'images'> & { images?: string[] }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تعديل السكن');
    return data;
  },

  async deleteProperty(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حذف السكن');
    return data;
  },

  async toggleVerify(id: string, verified: boolean): Promise<{ verification_status: string; message: string }> {
    const res = await fetch(`${API_BASE}/properties/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verified })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث التوثيق');
    return data;
  },

  async updatePropertyStatus(id: string, status: string): Promise<{ listing_status: string; message: string }> {
    const res = await fetch(`${API_BASE}/properties/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تغيير حالة السكن');
    return data;
  },

  // --- UPLOAD ---
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('sakani_token');

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل رفع الصورة');
    return data;
  },

  // --- VIEWING REQUESTS ---
  async createViewingRequest(payload: { property_id: string; preferred_date: string; preferred_time: string; notes?: string }): Promise<{ id: string; message: string }> {
    const res = await fetch(`${API_BASE}/viewing-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال طلب المعاينة');
    return data;
  },

  async getViewingRequests(): Promise<{ requests: ViewingRequest[] }> {
    const res = await fetch(`${API_BASE}/viewing-requests`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب الطلبات');
    return data;
  },

  async updateViewingRequest(id: string, status: string, admin_notes?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/viewing-requests/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, admin_notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث الطلب');
    return data;
  },

  // --- FAVORITES ---
  async getFavorites(): Promise<{ favorites: Property[] }> {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب المفضلة');
    return data;
  },

  async toggleFavorite(propertyId: string): Promise<{ favorited: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/favorites/${propertyId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تعديل المفضلة');
    return data;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب الإشعارات');
    return data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // --- REPORTS ---
  async createReport(payload: { target_type: 'property' | 'user'; target_id: string; reason: string; details?: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال البلاغ');
    return data;
  },

  async getReports(): Promise<{ reports: Report[] }> {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب البلاغات');
    return data;
  },

  async updateReport(id: string, status: string, admin_action_notes?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, admin_action_notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث البلاغ');
    return data;
  },

  // --- ADMIN USERS ---
  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب المستخدمين');
    return data;
  },

  async updateAdminUser(id: string, payload: Partial<User>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث المستخدم');
    return data;
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حذف المستخدم');
    return data;
  },

  // --- CMS CONTENT ---
  async getContent(): Promise<{ content: SiteContent }> {
    const res = await fetch(`${API_BASE}/content`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب المحتوى');
    return data;
  },

  async updateContent(updates: Record<string, any>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/content`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث المحتوى');
    return data;
  },

  // --- ADMIN STATS & BACKUP ---
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل جلب الإحصائيات');
    return data;
  },

  async downloadBackup(): Promise<void> {
    const token = localStorage.getItem('sakani_token');
    const res = await fetch(`${API_BASE}/admin/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('فشل تنزيل النسخة الاحتياطية');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakani-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
