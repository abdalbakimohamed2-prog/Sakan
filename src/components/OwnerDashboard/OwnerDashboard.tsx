import React, { useState, useEffect } from 'react';
import {
  Building2,
  CalendarCheck,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  UploadCloud,
  X,
  ShieldCheck,
  BedDouble,
  Bath
} from 'lucide-react';
import { api } from '../../lib/api';
import { Property, ViewingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const OwnerDashboard: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProp, setNewProp] = useState<Partial<Property>>({
    name: '',
    price: 2500,
    price_period: 'month',
    rooms: 2,
    bathrooms: 1,
    gender_type: 'male',
    university: 'جامعة القاهرة',
    area: 'بين السرايات',
    address: '',
    description: '',
    amenities: ['واي فاي سريع', 'تكييف', 'أمن وحراسة']
  });
  const [imageInput, setImageInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [propsRes, viewingsRes] = await Promise.all([
        api.getMyProperties(),
        api.getViewingRequests()
      ]);
      setProperties(propsRes.properties);
      setViewings(viewingsRes.requests);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imagesArray = imageInput.split('\n').map(u => u.trim()).filter(Boolean);
      await api.createProperty({
        ...newProp,
        images: imagesArray
      });
      setIsAddModalOpen(false);
      setFeedback('تمت إضافة السكن وإرساله لمراجعة التوثيق بنجاح!');
      loadOwnerData();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة السكن');
    }
  };

  const handleUpdateViewing = async (id: string, status: string) => {
    try {
      await api.updateViewingRequest(id, status);
      loadOwnerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c16] text-slate-900 dark:text-white font-['Cairo'] pb-16 text-right transition-colors duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#121428] border-b border-purple-100 dark:border-purple-900/40 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/30 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">لوحة تحكم المالك</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">مرحباً بك {user?.name} - إدارة سكناتك وطلبات المعاينة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سكن جديد</span>
            </button>
            <button
              onClick={onBackToHome}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
            {feedback}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-gray-400 block mb-1 font-medium">سكناتي المسجلة</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{properties.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-gray-400 block mb-1 font-medium">السكنات الموثقة</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {properties.filter(p => p.verification_status === 'verified').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-gray-400 block mb-1 font-medium">طلبات المعاينة الواردة</span>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{viewings.length}</div>
          </div>
        </div>

        {/* Incoming Viewing Requests */}
        <div className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            طلبات المعاينة الميدانية من الطلاب
          </h2>

          {viewings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-6">لا توجد طلبات معاينة واردة حالياً</p>
          ) : (
            <div className="space-y-3">
              {viewings.map(vr => (
                <div
                  key={vr.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{vr.student_name} - سكن: {vr.property_name}</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold">الموعد المطلوب: {vr.preferred_date} ({vr.preferred_time})</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">رقم هاتف الطالب: {vr.student_phone}</p>
                    {vr.notes && <p className="text-[11px] text-slate-500 dark:text-gray-400 italic">ملاحظات: {vr.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      vr.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' :
                      vr.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' :
                      'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                    }`}>
                      {vr.status === 'approved' ? 'تمت الموافقة' : vr.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
                    </span>

                    {vr.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateViewing(vr.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                        >
                          قبول الموعد
                        </button>
                        <button
                          onClick={() => handleUpdateViewing(vr.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          اعتذار
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Properties List */}
        <div className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            قائمة السكنات التابعة لي
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-slate-200 dark:bg-black/40">
                    <img
                      src={p.primary_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-bold mt-0.5">{p.price.toLocaleString('ar-EG')} ج.م / شهر</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">{p.university} - {p.area}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/30 flex items-center justify-between text-[11px]">
                  <span className={p.verification_status === 'verified' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-gray-400'}>
                    {p.verification_status === 'verified' ? '✓ موثق من سكني' : 'بانتظار المعاينة'}
                  </span>
                  <span className="text-slate-500 dark:text-gray-400">{p.views_count || 0} مشاهدة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/60 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">إضافة سكن جديد للمراجعة</h2>

            <form onSubmit={handleCreateProperty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">اسم السكن أو المبنى</label>
                <input
                  type="text"
                  value={newProp.name || ''}
                  onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                  placeholder="مثال: سكن الرواد أو شقة النور للطلاب"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">الجامعة القريبة</label>
                  <input
                    type="text"
                    value={newProp.university || ''}
                    onChange={(e) => setNewProp({ ...newProp, university: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">المنطقة</label>
                  <input
                    type="text"
                    value={newProp.area || ''}
                    onChange={(e) => setNewProp({ ...newProp, area: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    value={newProp.price || ''}
                    onChange={(e) => setNewProp({ ...newProp, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">الغرف</label>
                  <input
                    type="number"
                    value={newProp.rooms || 2}
                    onChange={(e) => setNewProp({ ...newProp, rooms: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">النوع</label>
                  <select
                    value={newProp.gender_type || 'male'}
                    onChange={(e) => setNewProp({ ...newProp, gender_type: e.target.value as any })}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                  >
                    <option value="male">طلاب شباب</option>
                    <option value="female">طالبات</option>
                    <option value="any">للجميع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={newProp.address || ''}
                  onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">روابط صور السكن (رابط بكل سطر)</label>
                <textarea
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  rows={2}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">وصف السكن</label>
                <textarea
                  value={newProp.description || ''}
                  onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                  rows={2}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white text-right"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-xs font-bold text-slate-700 dark:text-gray-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer shadow-xs"
                >
                  إرسال السكن للمنصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
