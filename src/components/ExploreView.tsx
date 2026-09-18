import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
  BedDouble,
  RotateCcw,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface ExploreViewProps {
  properties: Property[];
  initialFilters?: {
    university?: string;
    area?: string;
    gender?: string;
    maxPrice?: number;
  };
  onSelectProperty: (id: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  properties,
  initialFilters = {},
  onSelectProperty
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [university, setUniversity] = useState(initialFilters.university || '');
  const [area, setArea] = useState(initialFilters.area || '');
  const [genderType, setGenderType] = useState(initialFilters.gender || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters.maxPrice || 7000);
  const [roomsFilter, setRoomsFilter] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc' | 'views'>('latest');

  // Filter and Sort logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => {
        // Search term
        if (searchTerm) {
          const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchArea = p.area.toLowerCase().includes(searchTerm.toLowerCase());
          const matchAddress = p.address.toLowerCase().includes(searchTerm.toLowerCase());
          const matchUni = p.university.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchName && !matchArea && !matchAddress && !matchUni) return false;
        }

        // University
        if (university && !p.university.includes(university)) return false;

        // Area
        if (area && !p.area.toLowerCase().includes(area.toLowerCase())) return false;

        // Gender
        if (genderType !== 'all') {
          if (p.gender_type !== genderType && p.gender_type !== 'any') return false;
        }

        // Max price
        if (p.price > maxPrice) return false;

        // Rooms
        if (roomsFilter !== 'all') {
          const r = Number(roomsFilter);
          if (p.rooms !== r) return false;
        }

        // Only Verified
        if (onlyVerified && p.verification_status !== 'verified') return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'views') return (b.views_count || 0) - (a.views_count || 0);
        // default latest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [properties, searchTerm, university, area, genderType, maxPrice, roomsFilter, onlyVerified, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setUniversity('');
    setArea('');
    setGenderType('all');
    setMaxPrice(7000);
    setRoomsFilter('all');
    setOnlyVerified(false);
    setSortBy('latest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-right font-['Cairo'] transition-colors duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
          استكشاف جميع السكنات الطلابية المتاحة
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1 font-medium">
          عثرنا على ({filteredProperties.length}) سكن مطابق لمعايير بحثك
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search & Quick Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم السكن أو المنطقة أو الكلية..."
              className="w-full min-h-[44px] pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 text-right"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3 top-3.5" />
          </div>

          {/* University Dropdown */}
          <div>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 text-right cursor-pointer"
            >
              <option value="">جميع الجامعات</option>
              <option value="جامعة القاهرة">جامعة القاهرة</option>
              <option value="جامعة عين شمس">جامعة عين شمس</option>
              <option value="جامعة حلوان">جامعة حلوان</option>
              <option value="جامعة الإسكندرية">جامعة الإسكندرية</option>
              <option value="الجامعة الأمريكية AUC">الجامعة الأمريكية (AUC)</option>
              <option value="الجامعة الألمانية GUC">الجامعة الألمانية (GUC)</option>
              <option value="جامعة الأزهر">جامعة الأزهر</option>
              <option value="جامعة المنصورة">جامعة المنصورة</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <select
              value={genderType}
              onChange={(e) => setGenderType(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 text-right cursor-pointer"
            >
              <option value="all">نوع السكن: الكل</option>
              <option value="male">سكن شباب (طلاب)</option>
              <option value="female">سكن طالبات (بنات)</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 text-right cursor-pointer"
            >
              <option value="latest">الترتيب: الأحدث إضافة</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="views">الأكثر مشاهدة وزيارة</option>
            </select>
          </div>

        </div>

        {/* Row 2: Price range + Verified Toggle + Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-purple-100 dark:border-purple-900/30 text-xs">
          
          <div className="flex items-center gap-3 w-full sm:w-80">
            <span className="text-slate-700 dark:text-gray-300 font-semibold whitespace-nowrap">الحد الأقصى للسعر:</span>
            <input
              type="range"
              min="1000"
              max="8000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <span className="font-extrabold text-purple-700 dark:text-purple-300 whitespace-nowrap min-w-[70px]">
              {maxPrice.toLocaleString('ar-EG')} ج.م
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Only Verified toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-purple-950 border-purple-300 dark:border-purple-800 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                سكنات موثقة فقط
              </span>
            </label>

            <button
              onClick={handleResetFilters}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 text-slate-700 dark:text-gray-300 hover:text-purple-900 dark:hover:text-white border border-purple-200 dark:border-purple-800/40 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>

        </div>

      </div>

      {/* Properties Results Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-[#121428] rounded-3xl border border-purple-100 dark:border-purple-900/30 p-6 sm:p-8 space-y-3 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">لم نعثر على سكنات مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
            جرب تخفيف الفلاتر أو زيادة نطاق السعر الأقصى أو اختيار «جميع الجامعات».
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold mt-2 shadow-sm cursor-pointer"
          >
            إعادة تعيين كافة الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProperties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      )}

    </div>
  );
};
