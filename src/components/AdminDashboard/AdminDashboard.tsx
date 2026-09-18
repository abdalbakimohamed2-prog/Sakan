import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CalendarCheck,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  GraduationCap,
  Sparkles,
  UploadCloud,
  Layers,
  Phone,
  Mail,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { api } from '../../lib/api';
import { Property, User, ViewingRequest, Report, SiteContent } from '../../types';
import { useAuth } from '../../context/AuthContext';

type AdminTab = 'overview' | 'properties' | 'users' | 'viewings' | 'reports' | 'content' | 'backup';

export const AdminDashboard: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals / forms states
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [propertyImagesInput, setPropertyImagesInput] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, propsRes, usersRes, viewingsRes, reportsRes, contentRes] = await Promise.all([
        api.getAdminStats(),
        api.getProperties(),
        api.getAdminUsers(),
        api.getViewingRequests(),
        api.getReports(),
        api.getContent()
      ]);

      setStats(statsRes.stats);
      setProperties(propsRes.properties);
      setUsersList(usersRes.users);
      setViewings(viewingsRes.requests);
      setReports(reportsRes.reports);
      setSiteContent(contentRes.content);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Property Actions ---
  const handleToggleVerify = async (prop: Property) => {
    const newStatus = prop.verification_status !== 'verified';
    try {
      await api.toggleVerify(prop.id, newStatus);
      showToast('success', newStatus ? `تم توثيق «${prop.name}» بنجاح ✓` : `تم إلغاء توثيق «${prop.name}»`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleToggleListingStatus = async (prop: Property, newStatus: string) => {
    try {
      await api.updatePropertyStatus(prop.id, newStatus);
      showToast('success', `تم تغيير حالة «${prop.name}» إلى ${newStatus === 'active' ? 'نشط ومعروض' : 'مخفي'}`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteProperty = async (prop: Property) => {
    if (!confirm(`هل أنت متأكد من حذف السكن «${prop.name}» نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    try {
      await api.deleteProperty(prop.id);
      showToast('success', 'تم حذف السكن بنجاح');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty?.name || !editingProperty?.price || !editingProperty?.university) {
      showToast('error', 'يرجى إكمال الحقول الإلزامية');
      return;
    }

    try {
      const imagesArray = propertyImagesInput
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      if (editingProperty.id) {
        await api.updateProperty(editingProperty.id, {
          ...editingProperty,
          images: imagesArray
        });
        showToast('success', 'تم تحديث بيانات السكن بنجاح');
      } else {
        await api.createProperty({
          ...editingProperty,
          images: imagesArray
        });
        showToast('success', 'تمت إضافة السكن الجديد بنجاح');
      }

      setIsPropertyModalOpen(false);
      setEditingProperty(null);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Image Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      setPropertyImagesInput(prev => (prev ? prev + '\n' + res.url : res.url));
      showToast('success', 'تم رفع الصورة بنجاح وتوليد الرابط');
    } catch (err: any) {
      showToast('error', 'فشل رفع الصورة: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // --- User Actions ---
  const handleToggleUserStatus = async (targetUser: User) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateAdminUser(targetUser.id, { status: newStatus });
      showToast('success', `تم ${newStatus === 'active' ? 'تنشيط' : 'تعطيل'} حساب ${targetUser.name}`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleChangeUserRole = async (targetUser: User, newRole: 'student' | 'owner' | 'admin') => {
    try {
      await api.updateAdminUser(targetUser.id, { role: newRole });
      showToast('success', `تم تغيير رتبة ${targetUser.name} إلى ${newRole === 'admin' ? 'مشرف' : newRole === 'owner' ? 'مالك' : 'طالب'}`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم ${targetUser.name}؟ سيتم حذف جميع بياناته المرتبطة.`)) return;
    try {
      await api.deleteAdminUser(targetUser.id);
      showToast('success', 'تم حذف المستخدم بنجاح');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Viewing Requests Actions ---
  const handleUpdateViewing = async (id: string, status: string, notes?: string) => {
    try {
      await api.updateViewingRequest(id, status, notes);
      showToast('success', 'تم تحديث حالة طلب المعاينة بنجاح');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Reports Actions ---
  const handleUpdateReport = async (id: string, status: string, actionNotes?: string) => {
    try {
      await api.updateReport(id, status, actionNotes);
      showToast('success', 'تم تحديث حالة البلاغ بنجاح');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- CMS Content Save ---
  const handleSaveCMSContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateContent(siteContent);
      showToast('success', 'تم حفظ وتحديث محتوى الموقع بنجاح في قاعدة البيانات!');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c16] text-slate-900 dark:text-white font-['Cairo'] pb-16 text-right transition-colors duration-200">
      
      {/* Admin Top Header */}
      <div className="bg-white dark:bg-[#121428] border-b border-purple-100 dark:border-purple-900/40 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/30 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">لوحة تحكم إدارة «سكني»</h1>
                <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-bold text-white uppercase tracking-wider">
                  Admin Control
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">تحكم كامل في السكنات، المستخدمين، المعاينات، والمحتوى</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 text-xs font-semibold text-purple-700 dark:text-purple-200 flex items-center gap-1.5 cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={onBackToHome}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white border border-purple-200 dark:border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>الرجوع للموقع</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 py-1.5 scrollbar-none">
          {[
            { id: 'overview', label: 'نظرة عامة وإحصائيات', icon: TrendingUp },
            { id: 'properties', label: `السكنات (${properties.length})`, icon: Building2 },
            { id: 'users', label: `المستخدمين (${usersList.length})`, icon: Users },
            { id: 'viewings', label: `طلبات المعاينة (${viewings.length})`, icon: CalendarCheck },
            { id: 'reports', label: `البلاغات (${reports.length})`, icon: AlertTriangle },
            { id: 'content', label: 'إدارة المحتوى (CMS)', icon: FileEdit },
            { id: 'backup', label: 'النسخ الاحتياطي', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & STATS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Real Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#121428] border border-purple-900/40">
                <span className="text-xs text-gray-400 block mb-1">إجمالي السكنات</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{stats.totalProperties}</span>
                  <span className="text-xs text-emerald-400 font-semibold">{stats.verifiedProperties} موثق</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121428] border border-purple-900/40">
                <span className="text-xs text-gray-400 block mb-1">الطلاب المسجلين</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-purple-300">{stats.studentsCount}</span>
                  <span className="text-xs text-gray-400 font-semibold">{stats.ownersCount} ملاك</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121428] border border-purple-900/40">
                <span className="text-xs text-gray-400 block mb-1">طلبات المعاينة</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{stats.totalViewings}</span>
                  <span className="text-xs text-amber-400 font-semibold">{stats.pendingViewings} بانتظار الرد</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121428] border border-purple-900/40">
                <span className="text-xs text-gray-400 block mb-1">مشاهدات وتفاعل</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-purple-400">{stats.totalViews}</span>
                  <span className="text-xs text-rose-400 font-semibold">{stats.pendingReports} بلاغات</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">إجراءات سريعة لمدير المنصة</h3>
                <p className="text-xs text-purple-300/80">أضف سكن جديد، تحقق من المعاينات، أو عدل نصوص الموقع مباشرة</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProperty({
                      name: '',
                      price: 2500,
                      price_period: 'month',
                      rooms: 2,
                      bathrooms: 1,
                      gender_type: 'male',
                      area: '',
                      university: 'جامعة القاهرة',
                      address: '',
                      description: '',
                      amenities: ['واي فاي', 'تكييف', 'مطبخ مجهز', 'أمن'],
                      verification_status: 'verified',
                      listing_status: 'active'
                    });
                    setPropertyImagesInput('');
                    setIsPropertyModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سكن جديد</span>
                </button>

                <button
                  onClick={() => setActiveTab('content')}
                  className="px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-700/50 text-xs font-bold flex items-center gap-1.5"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>تعديل محتوى الصفحة</span>
                </button>
              </div>
            </div>

            {/* Real Property Featured: «سكن 500 وحدة» Spotlight */}
            <div className="p-5 rounded-2xl bg-[#121428] border border-purple-900/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  حالة السكن الحقيقي الحالي: «سكن 500 وحدة»
                </h3>
                <span className="text-xs text-purple-300">اسم المبنى: 500 وحدة (وليس السعر)</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"
                      alt="500 وحدة"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">سكن 500 وحدة</h4>
                    <p className="text-xs text-gray-400">بين السرايات / الدقي - جامعة القاهرة • 2,750 ج.م / شهر</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      معاينة موثقة ومعتمد بالمنصة
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold"
                  >
                    إدارة السكن في القائمة
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PROPERTIES MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            
            {/* Search & Add Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121428] p-4 rounded-2xl border border-purple-900/40">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="ابحث باسم السكن أو الجامعة أو المنطقة..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-right"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-2.5" />
              </div>

              <button
                id="admin-add-property-btn"
                onClick={() => {
                  setEditingProperty({
                    name: '',
                    price: 2500,
                    price_period: 'month',
                    rooms: 2,
                    bathrooms: 1,
                    gender_type: 'male',
                    area: '',
                    university: 'جامعة القاهرة',
                    address: '',
                    description: '',
                    amenities: ['واي فاي فائق السرعة', 'تكييف', 'مطبخ مجهز', 'أمن وحراسة'],
                    verification_status: 'verified',
                    listing_status: 'active'
                  });
                  setPropertyImagesInput('');
                  setIsPropertyModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سكن جديد</span>
              </button>
            </div>

            {/* Properties Table */}
            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-gray-300">
                  <thead className="bg-purple-950/40 text-gray-200 border-b border-purple-900/40">
                    <tr>
                      <th className="p-3.5">السكن</th>
                      <th className="p-3.5">الجامعة / المنطقة</th>
                      <th className="p-3.5">السعر</th>
                      <th className="p-3.5">المالك</th>
                      <th className="p-3.5 text-center">التوثيق (Verified)</th>
                      <th className="p-3.5 text-center">الحالة</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {properties
                      .filter(p => p.name.includes(propertySearch) || p.university.includes(propertySearch) || p.area.includes(propertySearch))
                      .map(prop => (
                        <tr key={prop.id} className="hover:bg-purple-950/20 transition-colors">
                          
                          <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                            <img
                              src={prop.primary_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-black/40 flex-shrink-0"
                            />
                            <div>
                              <p className="line-clamp-1">{prop.name}</p>
                              <span className="text-[10px] text-gray-400">{prop.rooms} غرف • {prop.gender_type === 'male' ? 'طلاب' : 'طالبات'}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <p className="font-semibold text-purple-300">{prop.university}</p>
                            <p className="text-[11px] text-gray-400">{prop.area}</p>
                          </td>

                          <td className="p-3.5 font-extrabold text-white">
                            {prop.price.toLocaleString('ar-EG')} ج.م
                          </td>

                          <td className="p-3.5">
                            <p className="text-gray-200">{prop.owner_name || 'مالك المنصة'}</p>
                            <p className="text-[10px] text-gray-500">{prop.owner_phone}</p>
                          </td>

                          {/* Verification Toggle */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleVerify(prop)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                                prop.verification_status === 'verified'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                              }`}
                              title="اضغط للتبديل بين موثق وغير موثق"
                            >
                              {prop.verification_status === 'verified' ? '✓ موثق من سكني' : 'غير موثق'}
                            </button>
                          </td>

                          {/* Listing Status */}
                          <td className="p-3.5 text-center">
                            <select
                              value={prop.listing_status}
                              onChange={(e) => handleToggleListingStatus(prop, e.target.value)}
                              className="bg-purple-950/40 border border-purple-800/40 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                            >
                              <option value="active">منشور (نشط)</option>
                              <option value="hidden">مخفي</option>
                              <option value="pending">قيد المراجعة</option>
                              <option value="rejected">مرفوض</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProperty(prop);
                                  setPropertyImagesInput(prop.images?.map(i => i.image_url).join('\n') || prop.primary_image || '');
                                  setIsPropertyModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-300"
                                title="تعديل السكن"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(prop)}
                                className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400"
                                title="حذف السكن"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: USERS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between gap-3 bg-[#121428] p-4 rounded-2xl border border-purple-900/40">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-right"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-2.5" />
              </div>
              <span className="text-xs text-gray-400">إجمالي الحسابات: {usersList.length}</span>
            </div>

            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-gray-300">
                  <thead className="bg-purple-950/40 text-gray-200 border-b border-purple-900/40">
                    <tr>
                      <th className="p-3.5">المستخدم</th>
                      <th className="p-3.5">البريد الإلكتروني</th>
                      <th className="p-3.5">رقم الهاتف</th>
                      <th className="p-3.5">نوع الحساب (Role)</th>
                      <th className="p-3.5 text-center">حالة الحساب</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {usersList
                      .filter(u => u.name.includes(userSearch) || u.email.includes(userSearch) || (u.phone && u.phone.includes(userSearch)))
                      .map(u => (
                        <tr key={u.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                              {u.name.slice(0, 1)}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3.5 text-gray-300 font-mono text-[11px]">{u.email}</td>
                          <td className="p-3.5 text-gray-400">{u.phone || 'غير مسجل'}</td>
                          <td className="p-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u, e.target.value as any)}
                              className="bg-purple-950/40 border border-purple-800/40 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                            >
                              <option value="student">طالب جامعي</option>
                              <option value="owner">مالك سكن</option>
                              <option value="admin">مشرف إداري (Admin)</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                u.status === 'active'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {u.status === 'active' ? 'نشط' : 'معطل'}
                            </button>
                          </td>
                          <td className="p-3.5 text-center">
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400"
                                title="حذف المستخدم نهائياً"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: VIEWING REQUESTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'viewings' && (
          <div className="space-y-4">
            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-gray-300">
                  <thead className="bg-purple-950/40 text-gray-200 border-b border-purple-900/40">
                    <tr>
                      <th className="p-3.5">السكن المطلوب</th>
                      <th className="p-3.5">الطالب</th>
                      <th className="p-3.5">الموعد المطلوب</th>
                      <th className="p-3.5">ملاحظات الطالب</th>
                      <th className="p-3.5 text-center">الحالة</th>
                      <th className="p-3.5 text-center">تحديث الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {viewings.map(vr => (
                      <tr key={vr.id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <p>{vr.property_name}</p>
                          <span className="text-[10px] text-gray-400">{vr.property_area}</span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-purple-300">{vr.student_name}</p>
                          <p className="text-[10px] text-gray-400">{vr.student_phone}</p>
                        </td>
                        <td className="p-3.5 font-semibold text-white">
                          <p>{vr.preferred_date}</p>
                          <span className="text-[10px] text-purple-300">{vr.preferred_time}</span>
                        </td>
                        <td className="p-3.5 text-gray-400 max-w-xs truncate">
                          {vr.notes || 'لا توجد ملاحظات'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            vr.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            vr.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                            vr.status === 'completed' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                            'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {vr.status === 'approved' ? 'تمت الموافقة' :
                             vr.status === 'rejected' ? 'مرفوض' :
                             vr.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleUpdateViewing(vr.id, 'approved', 'تم اعتماد الموعد من الإدارة')}
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400"
                              title="قبول وتأكيد المعاينة"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateViewing(vr.id, 'rejected', 'نعتذر، الموعد غير متاح')}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400"
                              title="اعتذار / رفض الموعد"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: REPORTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-gray-300">
                  <thead className="bg-purple-950/40 text-gray-200 border-b border-purple-900/40">
                    <tr>
                      <th className="p-3.5">الهدف المبلغ عنه</th>
                      <th className="p-3.5">المبلغ</th>
                      <th className="p-3.5">سبب البلاغ</th>
                      <th className="p-3.5">التفاصيل</th>
                      <th className="p-3.5 text-center">الحالة</th>
                      <th className="p-3.5 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">لا توجد بلاغات مسجلة حالياً ✓</td>
                      </tr>
                    ) : (
                      reports.map(rep => (
                        <tr key={rep.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="p-3.5 font-bold text-white">{rep.target_name || rep.target_id}</td>
                          <td className="p-3.5 text-purple-300">{rep.reporter_name}</td>
                          <td className="p-3.5 font-semibold text-rose-300">{rep.reason}</td>
                          <td className="p-3.5 text-gray-400 max-w-xs">{rep.details || '-'}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-[10px] text-gray-300">
                              {rep.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'resolved', 'تم التحقق واتخاذ الإجراء')}
                              className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px]"
                            >
                              إغلاق كـ تم الحل
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CONTENT MANAGEMENT (CMS) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveCMSContent} className="space-y-6">
            
            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">القسم الرئيسي (Hero Section)</h3>
                  <p className="text-xs text-gray-400">تحكم بالعنوان الرئيسي والوصف الظاهرين في أعلى الصفحة الرئيسية</p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                >
                  حفظ التعديلات
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">عنوان الهيرو (Hero Title)</label>
                <input
                  type="text"
                  value={siteContent.hero_title || ''}
                  onChange={(e) => setSiteContent({ ...siteContent, hero_title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">وصف الهيرو (Hero Subtitle)</label>
                <textarea
                  value={siteContent.hero_subtitle || ''}
                  onChange={(e) => setSiteContent({ ...siteContent, hero_subtitle: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-white focus:outline-none focus:border-purple-500 resize-none text-right"
                />
              </div>
            </div>

            {/* Contact Info CMS */}
            <div className="bg-[#121428] border border-purple-900/40 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-purple-900/40 pb-3">معلومات التواصل في الفوتر</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف الرسمي</label>
                  <input
                    type="text"
                    value={siteContent.contact_info?.phone || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact_info: { ...siteContent.contact_info!, phone: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">البريد الإلكتروني للدعم</label>
                  <input
                    type="email"
                    value={siteContent.contact_info?.email || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact_info: { ...siteContent.contact_info!, email: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={siteContent.contact_info?.whatsapp || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact_info: { ...siteContent.contact_info!, whatsapp: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={siteContent.contact_info?.address || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact_info: { ...siteContent.contact_info!, address: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white text-right"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all"
            >
              حفظ جميع تعديلات محتوى الموقع في قاعدة البيانات
            </button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: BACKUP & DATABASE TOOLS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'backup' && (
          <div className="bg-[#121428] border border-purple-900/40 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Download className="w-5 h-5 text-purple-400" />
                النسخ الاحتياطي لقاعدة البيانات (Data Backup)
              </h3>
              <p className="text-xs text-gray-400">
                يمكنك في أي وقت تنزيل نسخة كاملة ومحدثة من كافة جداول قاعدة البيانات (المستخدمين، السكنات، المعاينات، البلاغات، والمحتوى) بصيغة JSON قابلة للاسترجاع.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-white">تحميل ملف النسخة الاحتياطية الكاملة</h4>
                <p className="text-xs text-purple-300/80">تشمل جداول: Users, Properties, PropertyImages, Viewings, Reports, SiteContent</p>
              </div>
              <button
                onClick={() => api.downloadBackup()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل النسخة الاحتياطية الآن</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* ADD / EDIT PROPERTY MODAL */}
      {/* ---------------------------------------------------- */}
      {isPropertyModalOpen && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="bg-[#121428] border border-purple-900/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPropertyModalOpen(false)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 flex items-center justify-center text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black text-white mb-4">
              {editingProperty.id ? `تعديل سكن: ${editingProperty.name}` : 'إضافة سكن جديد للمنصة'}
            </h2>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">اسم السكن / المبنى</label>
                <input
                  type="text"
                  value={editingProperty.name || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  placeholder="مثال: سكن 500 وحدة أو برج النخبة الطلابي"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الجامعة القريبة</label>
                  <input
                    type="text"
                    value={editingProperty.university || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, university: e.target.value })}
                    placeholder="مثال: جامعة القاهرة أو عين شمس"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">المنطقة والحي</label>
                  <input
                    type="text"
                    value={editingProperty.area || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, area: e.target.value })}
                    placeholder="مثال: بين السرايات / الدقي"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={editingProperty.address || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                  placeholder="شارع الجامعة الرئيسي، بجوار محطة المترو"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    value={editingProperty.price || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                    placeholder="2500"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الغرف</label>
                  <input
                    type="number"
                    value={editingProperty.rooms || 2}
                    onChange={(e) => setEditingProperty({ ...editingProperty, rooms: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نوع السكن</label>
                  <select
                    value={editingProperty.gender_type || 'male'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, gender_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                  >
                    <option value="male">سكن شباب</option>
                    <option value="female">سكن طالبات</option>
                    <option value="any">متاح للجنسين</option>
                  </select>
                </div>
              </div>

              {/* Status and Verification */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">حالة التوثيق (Verification)</label>
                  <select
                    value={editingProperty.verification_status || 'verified'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, verification_status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800 text-white text-xs"
                  >
                    <option value="verified">✓ معاينة موثقة من سكني</option>
                    <option value="unverified">غير موثق</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">حالة النشر</label>
                  <select
                    value={editingProperty.listing_status || 'active'}
                    onChange={(e) => setEditingProperty({ ...editingProperty, listing_status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800 text-white text-xs"
                  >
                    <option value="active">منشور ونشط</option>
                    <option value="hidden">مخفي مؤقتاً</option>
                  </select>
                </div>
              </div>

              {/* Image Upload System */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  رفع صور السكن (من الجهاز أو وضع روابط صور)
                </label>
                
                <div className="p-3 rounded-xl bg-purple-950/30 border border-dashed border-purple-700/50 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-purple-300">
                    <UploadCloud className="w-5 h-5 text-purple-400" />
                    <span>اختر صورة من جهازك لرفعها إلى السيرفر مباشرة:</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="text-xs text-gray-400 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                  />
                </div>

                <textarea
                  value={propertyImagesInput}
                  onChange={(e) => setPropertyImagesInput(e.target.value)}
                  placeholder="ضع رابط صورة بكل سطر..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-purple-500 font-mono resize-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">وصف السكن</label>
                <textarea
                  value={editingProperty.description || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  placeholder="اكتب وصفاً مفصلاً للغرف والخدمات وموقع السكن..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-purple-500 resize-none text-right"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-gray-300 hover:text-white text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  حفظ السكن ونشره
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
