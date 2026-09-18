import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'owner'>('student');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (regPassword.length < 6) {
      setError('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone: phone || undefined,
        password: regPassword,
        role
      });
      setSuccessMsg('تم إنشاء الحساب بنجاح!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo filler
  const handleQuickLogin = (userType: 'admin' | 'owner' | 'student') => {
    setTab('login');
    if (userType === 'admin') {
      setIdentifier('admin@sakani.app');
      setPassword('AdminPassword123!');
    } else if (userType === 'owner') {
      setIdentifier('owner@sakani.app');
      setPassword('OwnerPassword123!');
    } else {
      setIdentifier('student@sakani.app');
      setPassword('StudentPassword123!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-right">
      <div
        className="bg-white dark:bg-[#121428] border border-purple-100 dark:border-purple-900/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative transition-colors max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-950/40 hover:bg-slate-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30 mb-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Cairo']">منصة سَـكَـنِـي</h2>
          <p className="text-xs text-purple-600 dark:text-purple-300/80 mt-0.5 font-medium">سكن الطلاب الآمن والموثق</p>
        </div>

        {/* Tabs: Login / Register */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 mb-5">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Quick Demo Access Pills */}
        <div className="mb-5 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 text-right">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            حسابات تجريبية جاهزة للدخول السريع:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 border border-purple-200 dark:border-purple-700/50 text-[11px] font-semibold text-purple-800 dark:text-purple-200 cursor-pointer shadow-2xs"
            >
              👑 المشرف (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('owner')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 border border-purple-200 dark:border-purple-700/50 text-[11px] font-semibold text-purple-800 dark:text-purple-200 cursor-pointer shadow-2xs"
            >
              🏢 مالك سكن (Owner)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 border border-purple-200 dark:border-purple-700/50 text-[11px] font-semibold text-purple-800 dark:text-purple-200 cursor-pointer shadow-2xs"
            >
              🎓 طالب (Student)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-700 dark:text-rose-300 font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-semibold">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@sakani.app أو 01012345678"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => alert('يمكنك استخدام الحساب التجريبي أو التواصل مع الدعم: support@sakani.app')}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-gray-400 select-none cursor-pointer font-medium">
                تذكرني على هذا الجهاز
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                نوع الحساب
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>طالب جامعي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    role === 'owner'
                      ? 'bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>مالك سكن</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <UserIcon className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">رقم الهاتف (للتواصل)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 text-right"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والتسجيل'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
