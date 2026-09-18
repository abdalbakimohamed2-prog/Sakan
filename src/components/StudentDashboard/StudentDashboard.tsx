import React, { useState, useEffect } from 'react';
import {
  Heart,
  CalendarCheck,
  User as UserIcon,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Lock,
  Phone,
  GraduationCap
} from 'lucide-react';
import { api } from '../../lib/api';
import { Property, ViewingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PropertyCard } from '../PropertyCard';

interface StudentDashboardProps {
  onBackToHome: () => void;
  onSelectProperty: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onBackToHome,
  onSelectProperty
}) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'viewings' | 'profile'>('favorites');
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [favsRes, viewingsRes] = await Promise.all([
        api.getFavorites(),
        api.getViewingRequests()
      ]);
      setFavorites(favsRes.favorites);
      setViewings(viewingsRes.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await api.updateProfile({
        name,
        phone,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined
      });
      setProfileMsg({ type: 'success', text: 'تم تحديث بيانات الحساب بنجاح!' });
      setCurrentPassword('');
      setNewPassword('');
      refreshUser();
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'فشل تحديث البيانات' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c16] text-slate-900 dark:text-white font-['Cairo'] pb-16 text-right transition-colors duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#121428] border-b border-purple-100 dark:border-purple-900/40 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/30 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">لوحة تحكم الطالب</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">مرحباً {user?.name} - إدارة المفضلة ومواعيد المعاينة</p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 py-2">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-purple-950/20'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>السكنات المفضلة ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('viewings')}
            className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'viewings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-purple-950/20'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>مواعيد المعاينة ({viewings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-purple-950/20'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>الملف الشخصي وكلمة المرور</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* TAB 1: FAVORITES */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#121428] rounded-3xl border border-purple-100 dark:border-purple-900/30 p-6 shadow-xs">
                <Heart className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">لم تقم بحفظ أي سكن في المفضلة بعد</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  تصفح السكنات الموثقة واضغط على أيقونة القلب لحفظها والرجوع إليها في أي وقت للمقارنة.
                </p>
                <button
                  onClick={onBackToHome}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  استكشف السكنات المتاحة
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(prop => (
                  <PropertyCard
                    key={prop.id}
                    property={{ ...prop, is_favorited: true }}
                    onSelect={onSelectProperty}
                    onFavoriteChange={(id, fav) => {
                      if (!fav) setFavorites(prev => prev.filter(p => p.id !== id));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIEWING REQUESTS */}
        {activeTab === 'viewings' && (
          <div className="space-y-4">
            {viewings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#121428] rounded-3xl border border-purple-100 dark:border-purple-900/30 p-6 shadow-xs">
                <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد لديك طلبات معاينة حالياً</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  عندما تجد سكناً مناسباً، اضغط على «طلب معاينة موثقة» لتحديد موعد زيارة ميداني ومطابقة الغرف.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {viewings.map(vr => (
                  <div
                    key={vr.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{vr.property_name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          vr.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40' :
                          vr.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40' :
                          'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                        }`}>
                          {vr.status === 'approved' ? 'تم تأكيد الموعد ✓' :
                           vr.status === 'rejected' ? 'نعتذر، الموعد مرفوض' : 'قيد المراجعة من المالك'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{vr.property_area} - {vr.property_address}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-gray-300 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>الموعد: {vr.preferred_date} ({vr.preferred_time})</span>
                        </span>
                        {vr.owner_phone && (
                          <span className="text-slate-600 dark:text-gray-400">
                            هاتف السكن: <strong className="text-slate-900 dark:text-white">{vr.owner_phone}</strong>
                          </span>
                        )}
                      </div>

                      {vr.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 italic">ملاحظاتي: {vr.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectProperty(vr.property_id)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-800/40 cursor-pointer transition-colors"
                    >
                      عرض صفحة السكن
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE UPDATE */}
        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">تحديث الملف الشخصي</h3>

            {profileMsg && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold ${
                profileMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                />
              </div>

              <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-2">تغيير كلمة المرور (اختياري)</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all mt-2 cursor-pointer shadow-xs"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
};
