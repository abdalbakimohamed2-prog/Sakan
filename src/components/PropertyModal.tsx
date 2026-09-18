import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  GraduationCap,
  BedDouble,
  Bath,
  ShieldCheck,
  Heart,
  Calendar,
  Phone,
  AlertTriangle,
  Share2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Wifi,
  Sparkles,
  Info
} from 'lucide-react';
import { Property } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface PropertyModalProps {
  propertyId: string | null;
  onClose: () => void;
  onRequestViewing: (property: Property) => void;
  onReport: (property: Property) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  propertyId,
  onClose,
  onRequestViewing,
  onReport
}) => {
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    api.getProperty(propertyId)
      .then(res => {
        setProperty(res.property);
        setIsFavorited(res.property.is_favorited || false);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (!propertyId) return null;

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('الرجاء تسجيل الدخول لحفظ السكن في المفضلة');
      return;
    }
    try {
      const res = await api.toggleFavorite(propertyId);
      setIsFavorited(res.favorited);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '?property=' + propertyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const images = property?.images && property.images.length > 0
    ? property.images.map(img => img.image_url)
    : [property?.primary_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'];

  return (
    <div
      id="property-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121427] border border-purple-100 dark:border-purple-900/50 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-right my-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !property ? (
          <div className="p-12 text-center text-slate-500 dark:text-gray-400">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold">جاري تحميل بيانات السكن والمعاينة الموثقة...</p>
          </div>
        ) : (
          <div>
            {/* Header & Controls */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="مشاركة رابط السكن"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {copySuccess && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/30 font-bold">
                    تم نسخ الرابط!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavoriteToggle}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-white'}`} />
                  <span>{isFavorited ? 'في المفضلة' : 'حفظ'}</span>
                </button>
                <button
                  onClick={() => onReport(property)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>إبلاغ</span>
                </button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="p-4 sm:p-6 pb-2">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Chevrons if multi-images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                      aria-label="الصورة التالية"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Verified badge */}
                {property.verification_status === 'verified' && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-md">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>معاينة موثقة من فريق سكني</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-purple-600 scale-102 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Title & Price Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {property.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      {property.area} - {property.address}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/40">
                      <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      {property.university}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-left bg-purple-50/80 dark:bg-purple-950/40 p-3 sm:p-4 rounded-2xl border border-purple-200 dark:border-purple-800/40 flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300">
                    {property.price.toLocaleString('ar-EG')} ج.م
                  </div>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
                    لكل {property.price_period === 'semester' ? 'فصل دراسي (ترم)' : 'شهر'} شامل الخدمات
                  </span>
                </div>
              </div>

              {/* Verified Inspection Banner */}
              {property.verification_status === 'verified' && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-right">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                      تقرير التوثيق الميداني من سكني (Verified)
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1 leading-relaxed">
                      تمت زيارة هذا السكن ميدانياً من قبل موثق معتمد في منصة سكني. تم التحقق من سلامة الأثاث، ومطابقة الصور 100% للواقع، والتأكد من عدم وجود أي زيادة في الأسعار أو عمولة سمسار.
                    </p>
                  </div>
                </div>
              )}

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3.5 rounded-2xl text-center">
                  <BedDouble className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">عدد الغرف</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{property.rooms} غرف</span>
                </div>

                <div className="bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3.5 rounded-2xl text-center">
                  <Bath className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">دورات المياه</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{property.bathrooms} حمامات</span>
                </div>

                <div className="bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3.5 rounded-2xl text-center">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">فئة السكن</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {property.gender_type === 'male' ? 'طلاب (شباب)' : property.gender_type === 'female' ? 'طالبات (بنات)' : 'متاح للجميع'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3.5 rounded-2xl text-center">
                  <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">المشاهدات</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{property.views_count || 0} طالب</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">وصف السكن</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-purple-950/15 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">المرافق والخدمات المتوفرة</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {property.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/25 border border-purple-100 dark:border-purple-900/30 text-xs text-slate-700 dark:text-gray-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Viewing Request Box CTA */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-base sm:text-lg font-black mb-1">
                    جاهز لمعاينة السكن على أرض الواقع؟
                  </h4>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    احجز موعد معاينة ميدانية موثقة مع إدارة السكن بدون أي عمولة سمسرة (مجاناً).
                  </p>
                </div>

                <button
                  onClick={() => onRequestViewing(property)}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-purple-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  طلب موعد معاينة موثقة
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
