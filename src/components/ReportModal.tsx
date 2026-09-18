import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Property } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  property: Property | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  property,
  onClose
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('معلومات أو صور غير صحيحة');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('يرجى تسجيل الدخول أولاً للإبلاغ عن السكن');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createReport({
        target_type: 'property',
        target_id: property.id,
        reason,
        details: details.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-right">
      <div
        className="bg-white dark:bg-[#121428] border border-rose-200 dark:border-rose-900/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">تم استلام البلاغ بنجاح</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
              شكراً لمساعدتنا في الحفاظ على بيئة سكنية موثوقة. سيقوم فريق مشرفي سكني بفحص السكن واتخاذ الإجراء اللازم.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">إبلاغ عن سكن</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              أنت تبلغ عن: <span className="text-slate-900 dark:text-white font-semibold">{property.name}</span>
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                سبب البلاغ
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right cursor-pointer"
              >
                <option value="معلومات أو صور غير صحيحة">معلومات أو صور غير صحيحة ومضللة</option>
                <option value="السعر المعلن غير مطابق للحقيقة">السعر المعلن غير مطابق للحقيقة</option>
                <option value="السكن غير متاح أو مؤجر بالفعل">السكن غير متاح أو مؤجر بالفعل</option>
                <option value="تعامل غير لائق من المالك">تعامل غير لائق من المالك</option>
                <option value="احتيال أو طلب مبالغ خارج المنصة">احتيال أو طلب مبالغ خارج المنصة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                تفاصيل إضافية توضح المشكلة
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="يرجى ذكر أي تفاصيل إضافية لتسهيل مراجعة البلاغ من قِبل الإدارة..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 resize-none text-right placeholder-slate-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ للإدارة'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
