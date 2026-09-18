import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('12:00 م');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property) return null;

  // Set default date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('يرجى تسجيل الدخول أولاً كطالب لإرسال طلب معاينة');
      return;
    }

    if (!preferredDate || !preferredTime) {
      setError('يرجى اختيار تاريخ ووقت المعاينة المفضل');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createViewingRequest({
        property_id: property.id,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال طلب المعاينة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-right">
      <div
        className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">تم إرسال طلب المعاينة بنجاح!</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
              تم إشعار إدارة السكن بالموعد المحدد ({preferredDate} - {preferredTime}). يمكنك متابعة حالة الطلب من لوحة تحكم الطالب.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>حجز موعد معاينة ميدانية</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                معاينة: {property.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                اختر اليوم والوقت الأنسب لك لزيارة السكن ومطابقة الغرف والخدمات على أرض الواقع.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  تاريخ المعاينة المفضل
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  الوقت المناسب للمعاينة
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 text-right cursor-pointer"
                >
                  <option value="10:00 ص">10:00 صباحاً</option>
                  <option value="12:00 م">12:00 ظهراً</option>
                  <option value="02:00 م">02:00 بعد الظهر</option>
                  <option value="04:00 م">04:00 عصراً</option>
                  <option value="06:00 م">06:00 مساءً</option>
                  <option value="08:00 م">08:00 مساءً</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  ملاحظات أو أسئلة إضافية للمالك (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلاً: هل يوجد مكان متاح في غرفة ثنائية؟ أو سأحضر بصحبة والدي..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 resize-none text-right placeholder-slate-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{submitting ? 'جاري إرسال الطلب...' : 'تأكيد إرسال طلب المعاينة'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
