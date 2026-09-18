import React, { useState } from 'react';
import {
  Search,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  HeartHandshake,
  DollarSign,
  Users,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { Property, SiteContent } from '../types';
import { PropertyCard } from './PropertyCard';

interface HomeViewProps {
  content: SiteContent;
  featuredProperties: Property[];
  onSelectProperty: (id: string) => void;
  onExploreWithFilters: (filters: { university?: string; area?: string; gender?: string; maxPrice?: number }) => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  content,
  featuredProperties,
  onSelectProperty,
  onExploreWithFilters,
  openAuthModal
}) => {
  // Search bar states
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [areaQuery, setAreaQuery] = useState('');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroTitle = content.hero_title || 'سكنك الجامعي الموثوق.. بالقرب من جامعتك وبدون سماسرة';
  const heroSubtitle = content.hero_subtitle || '«سكني» منصة متخصصة لطلاب الجامعات تجمع أفضل خيارات السكن الطلابي مع إمكانية طلب معاينة ميدانية حقيقية وموثقة قبل التعاقد.';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreWithFilters({
      university: selectedUniversity || undefined,
      area: areaQuery || undefined,
      gender: selectedGender !== 'all' ? selectedGender : undefined,
      maxPrice: maxPrice || undefined
    });
  };

  const defaultFaqs: { q: string; a: string }[] = [
    {
      q: 'ما هي ميزة «المعاينة الموثقة» في منصة سكني؟',
      a: 'المعاينة الموثقة تعني أن فريق منصة «سكني» قام بالنزول شخصياً وميدانياً للسكن، وفحص نظافة الغرف، وجودة التكييف وشبكة الواي فاي، والتأكد من مطابقة السعر الفعلي والمواصفات بدون أي مبالغة أو صور وهمية.'
    },
    {
      q: 'ما هو «سكن 500 وحدة» المعروض على المنصة؟',
      a: '«500 وحدة» هو اسم لمبنى سكن طلابي حقيقي ومعروف بالقرب من جامعة القاهرة (منطقة بين السرايات / الدقي). الاسم يرمز للمبنى والوحدات السكنية الملحقة به وليس سعر الإيجار.'
    },
    {
      q: 'هل توجد أي عمولات أو رسوم سمسرة إضافية؟',
      a: 'لا على الإطلاق! منصة «سكني» تهدف تماماً للقضاء على جشع السماسرة. التواصل مجاني ومباشر مع إدارة السكن أو المالك بعد طلب المعاينة.'
    },
    {
      q: 'كيف يمكنني حجز موعد معاينة ميدانية؟',
      a: 'ببساطة، ادخل على صفحة السكن، واضغط على زر «طلب معاينة موثقة»، وحدد التاريخ والوقت المناسب لجدولك الدراسي. سيصل إشعار فوري لإدارة السكن لتأكيد الموعد واستقبالك.'
    },
    {
      q: 'أنا مالك سكن، كيف يمكنني إدراج مبناي أو شقتي؟',
      a: 'يمكنك إنشاء حساب جديد واختيار نوع الحساب «مالك سكن»، ثم إضافة تفاصيل السكن وصوره من لوحة التحكم، وسيقوم فريق التوثيق لدينا بمراجعة السكن وتفعيله فوراً.'
    }
  ];

  const faqs = (content.faq && content.faq.length > 0 ? content.faq : defaultFaqs) as { q: string; a: string }[];

  return (
    <div className="space-y-12 sm:space-y-20 lg:space-y-24 text-right transition-colors duration-200">
      
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 sm:w-80 h-72 sm:h-80 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>المنصة الأولى الموثقة لسكن الطلاب في مصر</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight sm:leading-tight tracking-tight">
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SEARCH & FILTER BAR */}
          {/* ---------------------------------------------------- */}
          <div className="mt-6 sm:mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white dark:bg-[#13152a] p-4 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 dark:shadow-purple-950/40 space-y-4 transition-colors"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                
                {/* University Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    الجامعة أو المعهد
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right cursor-pointer"
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

                {/* Area Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    المنطقة أو الحي
                  </label>
                  <input
                    type="text"
                    value={areaQuery}
                    onChange={(e) => setAreaQuery(e.target.value)}
                    placeholder="مثال: بين السرايات، الدقي، مدينة نصر..."
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>

                {/* Gender selection */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    نوع السكن
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 min-h-[44px]">
                    <button
                      type="button"
                      onClick={() => setSelectedGender('all')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedGender === 'all'
                          ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-white'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGender('male')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedGender === 'male'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-slate-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-white'
                      }`}
                    >
                      طلاب
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGender('female')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedGender === 'female'
                          ? 'bg-pink-600 border-pink-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-slate-600 dark:text-gray-400 hover:text-pink-700 dark:hover:text-white'
                      }`}
                    >
                      طالبات
                    </button>
                  </div>
                </div>

              </div>

              {/* Price Range & Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-purple-100 dark:border-purple-900/30">
                <div className="w-full sm:w-1/2 flex items-center gap-3">
                  <span className="text-xs text-slate-700 dark:text-gray-300 font-bold whitespace-nowrap">
                    الحد الأقصى للسعر:
                  </span>
                  <input
                    type="range"
                    min="1000"
                    max="8000"
                    step="250"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 whitespace-nowrap min-w-[70px]">
                    {maxPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <button
                  type="submit"
                  id="hero-search-btn"
                  className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>البحث في السكنات المتاحة</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. STATS BAR */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 text-center shadow-sm">
          <div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">100%</div>
            <p className="text-xs text-purple-700 dark:text-purple-300/90 font-bold">معاينات موثقة ومطابقة</p>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">0 ج.م</div>
            <p className="text-xs text-purple-700 dark:text-purple-300/90 font-bold">عمولة سمسرة (مجاناً)</p>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">+1,200</div>
            <p className="text-xs text-purple-700 dark:text-purple-300/90 font-bold">طالب عثروا على سكن</p>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">+15</div>
            <p className="text-xs text-purple-700 dark:text-purple-300/90 font-bold">جامعة ومعهد مغطاة</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. FEATURED PROPERTIES (INCL. 500 WAHDA) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>مختارة وموثقة ميدانياً</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              أبرز السكنات المتاحة حالياً
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1">
              جميع السكنات المعروضة هنا خضعت للتوثيق الميداني والتحقق من النظافة والأسعار
            </p>
          </div>

          <button
            onClick={() => onExploreWithFilters({})}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>استعراض كافة السكنات</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Grid of properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredProperties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. WHY SAKANI? (PROBLEMS SOLVED) */}
      {/* ---------------------------------------------------- */}
      <section id="why-sakani" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/70 dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 rounded-3xl p-6 sm:p-10 lg:p-12">
          
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>معايير أمان موثوقة</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">
              لماذا يختار طلاب الجامعات منصة «سكني»؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
              بنينا «سكني» لمعالجة كافة المشاكل الحقيقية التي يواجهها المغتربون سنوياً أثناء البحث عن سكن دراسي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">معاينة موثقة ومؤكدة</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                لا مزيد من الصور المفبركة أو القديمة؛ كل سكن يحمل شارة التوثيق تم زيارته والتأكد من مطابقته تماماً.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-purple-600/20 border border-emerald-200 dark:border-purple-500/40 flex items-center justify-center text-emerald-700 dark:text-purple-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">أسعار شفافة بدون وسيط</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                السعر المعلن هو السعر الحقيقي شاملاً الخدمات بدون فرض أي عمولات سمسرة أو رسوم غير معلنة.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">قريب من جامعتك</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                فلترة ذكية بالسير على الأقدام أو دقائق المواصلات من كليتك لتوفير وقتك وجهدك الدراسي اليومي.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">حجز موعد بضغطة زر</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                اختر التاريخ والوقت المناسب لك لزيارة السكن ومقابلة الإدارة بدون مكالمات متكررة أو عشوائية.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. HOW IT WORKS */}
      {/* ---------------------------------------------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">خطوات سهلة ومباشرة</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2">كيف تعمل منصة «سكني»؟</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">ثلاث خطوات بسيطة تفصلك عن سكنك الدراسي المثالي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 relative shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-lg mb-4 shadow-md shadow-purple-600/40">
              1
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2">ابحث بالقرب من جامعتك</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              استخدم فلاتر البحث لاختيار الجامعة، الميزانية الشهرية، ونوع السكن (شباب أو طالبات) وتعرف على المسافة والخدمات المتاحة.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 relative shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-lg mb-4 shadow-md shadow-purple-600/40">
              2
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2">اطلب موعد معاينة موثقة</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              اختر اليوم والساعة الأنسب لجدولك لإجراء زيارة ميدانية ومطابقة الغرف والاطمئنان لكافة تفاصيل السكن على أرض الواقع.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 relative shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-lg mb-4 shadow-md shadow-purple-600/40">
              3
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2">استقر بأمان وراحة بال</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              تواصل مباشرة مع إدارة السكن ووقع عقدك بدون أي وسيط أو سمسار وبكل أمان وشفافية تامة طوال العام الدراسي.
            </p>
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. FAQ ACCORDION SECTION */}
      {/* ---------------------------------------------------- */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>إجابات واضحة لجميع استفساراتك</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">الأسئلة الشائعة</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/40 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full min-h-[48px] p-4 sm:p-5 flex items-center justify-between text-right gap-4 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed border-t border-purple-100 dark:border-purple-900/20 bg-purple-50/40 dark:bg-purple-950/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. CTA BANNER */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl border border-purple-700/40 text-center space-y-5 sm:space-y-6">
          <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white">
              هل أنت مالك سكن وترغب في استضافة الطلاب؟
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              سجل سكنك الآن في منصة «سكني» مجاناً واحصل على توثيق رسمي وزيارات طلابية مستمرة طوال العام الدراسي.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-purple-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              سجل سكنك الآن كمالك
            </button>
            <button
              onClick={() => onExploreWithFilters({})}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-purple-950/60 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm border border-purple-500/40 transition-colors cursor-pointer"
            >
              استكشف السكنات كطالب
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
