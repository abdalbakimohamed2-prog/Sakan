import React from 'react';
import {
  MapPin,
  GraduationCap,
  BedDouble,
  Bath,
  ShieldCheck,
  Heart,
  Users,
  Eye
} from 'lucide-react';
import { Property } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  onFavoriteChange?: (id: string, isFavorited: boolean) => void;
  onRequestViewing?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onFavoriteChange
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = React.useState(property.is_favorited || false);
  const [isFavLoading, setIsFavLoading] = React.useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('الرجاء تسجيل الدخول أولاً لإضافة السكن إلى المفضلة');
      return;
    }
    setIsFavLoading(true);
    try {
      const res = await api.toggleFavorite(property.id);
      setIsFavorited(res.favorited);
      if (onFavoriteChange) onFavoriteChange(property.id, res.favorited);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsFavLoading(false);
    }
  };

  const primaryImage = property.primary_image || (property.images && property.images[0]?.image_url) || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const genderLabel = property.gender_type === 'male' ? 'سكن شباب' :
                      property.gender_type === 'female' ? 'سكن طالبات' : 'متاح للجميع';

  const genderColor = property.gender_type === 'male' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30' :
                      property.gender_type === 'female' ? 'bg-pink-50 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30' :
                      'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30';

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={() => onSelect(property.id)}
      className="group bg-white dark:bg-[#111222] border border-purple-100 dark:border-purple-900/30 hover:border-purple-500/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Property Image & Overlays */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-purple-950/20">
        <img
          src={primaryImage}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-70" />

        {/* Verified Badge */}
        {property.verification_status === 'verified' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>معاينة موثقة من سكني</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isFavLoading}
          aria-label="حفظ في المفضلة"
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform active:scale-90 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`}
          />
        </button>

        {/* Gender Badge */}
        <div className="absolute bottom-3 right-3">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border backdrop-blur-sm ${genderColor}`}>
            {genderLabel}
          </span>
        </div>

        {/* Views Counter */}
        <div className="absolute bottom-3 left-3 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
          <Eye className="w-3 h-3 text-purple-400" />
          <span>{property.views_count || 0}</span>
        </div>
      </div>

      {/* Property Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-right">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {property.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 mr-1 font-semibold">
                ج.م / {property.price_period === 'semester' ? 'ترم' : 'شهر'}
              </span>
            </div>
          </div>

          {/* Property Name */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
            {property.name}
          </h3>

          {/* Area & Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="truncate">{property.area} - {property.address}</span>
          </div>

          {/* University Distance info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-gray-300 mb-3 bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="font-semibold text-[11px] truncate">قريب من: {property.university}</span>
          </div>

          {/* Specs: Rooms & Bathrooms */}
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-gray-400 pb-3 border-b border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{property.rooms} غرف</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{property.bathrooms} حمام</span>
            </div>
          </div>
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-gray-400 px-1 py-0.5">
                +{property.amenities.length - 3} آخر
              </span>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold group-hover:underline">
            تفاصيل السكن والمعاينة ←
          </span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            عرض
          </span>
        </div>
      </div>
    </div>
  );
};
