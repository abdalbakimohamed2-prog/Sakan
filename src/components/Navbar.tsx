import React, { useState } from 'react';
import {
  Building2,
  Sun,
  Moon,
  User as UserIcon,
  Bell,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Heart,
  Home,
  Search,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppNotification } from '../types';
import { api } from '../lib/api';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: (initialTab?: 'login' | 'register') => void;
  onSelectProperty?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal
}) => {
  const { user, logout, unreadCount, refreshUnreadCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications();
      await refreshUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#0b0c16]/95 border-b border-purple-100 dark:border-purple-900/30 text-slate-800 dark:text-white shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Cairo']">
                سَـكَـنِـي
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                سكن الطلاب
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-600 dark:text-purple-300/70 hidden sm:block font-medium">
              المعاينة الموثقة للسكن الجامعي
            </p>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            id="nav-home-btn"
            onClick={() => setCurrentView('home')}
            className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'home'
                ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <button
            id="nav-explore-btn"
            onClick={() => setCurrentView('explore')}
            className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'explore'
                ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>اكتشف السكن</span>
          </button>

          <a
            href="#how-it-works"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
          >
            كيف يعمل؟
          </a>

          <a
            href="#why-sakani"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('why-sakani')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
          >
            عن سكني
          </a>

          <a
            href="#faq"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
          >
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Right Action Tools: Dark/Light, Notifications, Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Dark / Light Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'التحويل إلى الوضع الفاتح (Light Mode)' : 'التحويل إلى الوضع الداكن (Dark Mode)'}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer shadow-xs"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 animate-spin-once" />
            ) : (
              <Moon className="w-5 h-5 text-purple-700" />
            )}
          </button>

          {/* If user logged in: Notifications */}
          {user && (
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={handleToggleNotifications}
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer relative"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '+9' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#131528] border border-purple-100 dark:border-purple-900/60 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-right">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-purple-100 dark:border-purple-900/30">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">الإشعارات</span>
                    {notifications.some(n => n.is_read === 0) && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-purple-100 dark:divide-purple-900/20">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-sm text-slate-500 dark:text-gray-400">لا توجد إشعارات حالياً</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 hover:bg-purple-50/70 dark:hover:bg-purple-950/30 transition-colors ${
                            n.is_read === 0 ? 'bg-purple-50/40 dark:bg-purple-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-purple-900 dark:text-purple-200">{n.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-gray-400">
                              {new Date(n.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Controls */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700/40 text-slate-900 dark:text-white transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                  {user.name.slice(0, 1)}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none">{user.name.split(' ')[0]}</p>
                  <span className="text-[10px] text-purple-600 dark:text-purple-300/80 font-medium">
                    {user.role === 'admin' ? 'مدير المنصة' : user.role === 'owner' ? 'مالك سكن' : 'طالب'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#131528] border border-purple-100 dark:border-purple-900/50 rounded-2xl shadow-2xl p-1.5 z-50 text-right"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      id="admin-dashboard-link"
                      onClick={() => setCurrentView('admin')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors font-bold cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        لوحة تحكم المشرف
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-600 text-white font-mono">/admin</span>
                    </button>
                  )}

                  {user.role === 'owner' && (
                    <button
                      id="owner-dashboard-link"
                      onClick={() => setCurrentView('owner')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors font-bold cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      لوحة المالك وإدارة السكنات
                    </button>
                  )}

                  {user.role === 'student' && (
                    <button
                      id="student-dashboard-link"
                      onClick={() => setCurrentView('student')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors font-bold cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      المفضلة وطلبات المعاينة
                    </button>
                  )}

                  <button
                    id="logout-btn"
                    onClick={() => { logout(); setCurrentView('home'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors mt-1 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="login-modal-trigger"
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <button
                id="register-modal-trigger"
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-sm shadow-purple-600/30 transition-all hover:scale-102 cursor-pointer"
              >
                حساب جديد
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger (44px min target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-slate-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-white/5 flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-purple-600" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0e101f] border-b border-purple-100 dark:border-purple-900/40 px-4 py-4 space-y-2 text-right shadow-xl">
          <button
            onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
            className={`w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold ${
              currentView === 'home'
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-slate-800 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            الرئيسية
          </button>
          
          <button
            onClick={() => { setCurrentView('explore'); setMobileMenuOpen(false); }}
            className={`w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold ${
              currentView === 'explore'
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-slate-800 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            اكتشف السكن
          </button>

          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            كيف يعمل؟
          </a>

          <a
            href="#why-sakani"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            عن سكني
          </a>

          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            الأسئلة الشائعة
          </a>

          {user ? (
            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30 space-y-1">
              {user.role === 'admin' && (
                <button
                  onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-between"
                >
                  <span>لوحة تحكم المشرف</span>
                  <span className="font-mono text-[10px]">/admin</span>
                </button>
              )}
              {user.role === 'owner' && (
                <button
                  onClick={() => { setCurrentView('owner'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  لوحة المالك وإدارة السكنات
                </button>
              )}
              {user.role === 'student' && (
                <button
                  onClick={() => { setCurrentView('student'); setMobileMenuOpen(false); }}
                  className="w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  المفضلة ومواعيد المعاينة
                </button>
              )}
              <button
                onClick={() => { logout(); setCurrentView('home'); setMobileMenuOpen(false); }}
                className="w-full text-right py-2.5 px-3.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-purple-100 dark:border-purple-900/30 flex flex-col gap-2">
              <button
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/40"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { openAuthModal('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-sm"
              >
                إنشاء حساب جديد
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
