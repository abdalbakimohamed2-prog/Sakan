import React from 'react';
import { Building2, Phone, Mail, MessageCircle, MapPin, Heart, ShieldCheck } from 'lucide-react';
import { SiteContent } from '../types';

export const Footer: React.FC<{
  content?: SiteContent;
  onNavigate: (view: string) => void;
}> = ({ content, onNavigate }) => {
  const contact = content?.contact_info || {
    phone: '01000000000',
    email: 'support@sakani.app',
    whatsapp: '01000000000',
    address: 'القاهرة، جمهورية مصر العربية'
  };

  return (
    <footer id="contact" className="bg-slate-100 dark:bg-[#0a0a14] border-t border-purple-100 dark:border-purple-900/30 text-slate-900 dark:text-white pt-12 pb-8 text-right font-['Cairo'] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-purple-600/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                سَـكَـنِـي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-md leading-relaxed">
              «سكني» هي أول منصة مصرية متخصصة وموثقة لسكن الطلاب، تهدف للقضاء على عشوائية السماسرة والإعلانات الوهمية عبر توفير معاينات ميدانية موثقة ومطابقة حقيقية لكافة التفاصيل والأسعار.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 py-1.5 px-3 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>معاينات موثقة ومضمونة 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-gray-400">
              <li>
                <button onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer">
                  تصفح كافة السكنات
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  كيف تعمل المنصة؟
                </a>
              </li>
              <li>
                <a href="#why-sakani" className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  لماذا تختار سكني؟
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">تواصل معنا</h4>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-gray-400">
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>{contact.email}</span>
              </a>
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>محادثة واتساب مباشرة</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>{contact.address}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-purple-200/60 dark:border-purple-900/30 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} سكني (Sakani) - جميع الحقوق محفوظة لطلاب الجامعات المصرية.</p>
          <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
            <span>صُنع بشغف لدعم طلاب الجامعات</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
