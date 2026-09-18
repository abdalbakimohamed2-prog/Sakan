import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard/OwnerDashboard';
import { StudentDashboard } from './components/StudentDashboard/StudentDashboard';
import { PropertyModal } from './components/PropertyModal';
import { BookingModal } from './components/BookingModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { api } from './lib/api';
import { Property, SiteContent } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'admin' | 'owner' | 'student'>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [reportingProperty, setReportingProperty] = useState<Property | null>(null);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; tab: 'login' | 'register' }>({
    isOpen: false,
    tab: 'login'
  });

  // Explore search filters from Hero
  const [exploreFilters, setExploreFilters] = useState<{
    university?: string;
    area?: string;
    gender?: string;
    maxPrice?: number;
  }>({});

  // Load initial properties & content
  const loadData = async () => {
    try {
      const [propsRes, contentRes] = await Promise.all([
        api.getProperties(),
        api.getContent()
      ]);
      setProperties(propsRes.properties);
      setSiteContent(contentRes.content);
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check URL parameters for direct property sharing (?property=id) or hash (#admin)
    const params = new URLSearchParams(window.location.search);
    const propId = params.get('property');
    if (propId) {
      setSelectedPropertyId(propId);
    }

    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setCurrentView('admin');
    }
  }, []);

  const handleOpenAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalState({ isOpen: true, tab });
  };

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };

  const handleRequestViewing = (property: Property) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }
    setBookingProperty(property);
  };

  const handleReportProperty = (property: Property) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }
    setReportingProperty(property);
  };

  const handleExploreWithFilters = (filters: { university?: string; area?: string; gender?: string; maxPrice?: number }) => {
    setExploreFilters(filters);
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard for Admin view
  const renderCurrentView = () => {
    if (currentView === 'admin') {
      if (user?.role !== 'admin') {
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-6 text-center text-right font-['Cairo']">
            <div className="bg-white dark:bg-[#121428] border border-purple-200 dark:border-purple-900/40 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">منطقة الإدارة (Admin) محمية</h2>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                لوحة تحكم الإدارة مخصصة فقط لمدير المنصة. يرجى تسجيل الدخول بحساب المشرف.
              </p>
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                تسجيل الدخول بحساب المشرف
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-purple-900 text-xs font-semibold transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        );
      }
      return <AdminDashboard onBackToHome={() => setCurrentView('home')} />;
    }

    if (currentView === 'owner') {
      if (user?.role !== 'owner' && user?.role !== 'admin') {
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-6 text-center text-right font-['Cairo']">
            <div className="bg-white dark:bg-[#121428] border border-purple-200 dark:border-purple-900/40 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">لوحة تحكم مالك السكن</h2>
              <p className="text-xs text-slate-600 dark:text-gray-400">يرجى تسجيل الدخول بحساب مالك سكن لإدارة عقاراتك.</p>
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                تسجيل الدخول كمالك
              </button>
            </div>
          </div>
        );
      }
      return <OwnerDashboard onBackToHome={() => setCurrentView('home')} />;
    }

    if (currentView === 'student') {
      if (!user) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-6 text-center text-right font-['Cairo']">
            <div className="bg-white dark:bg-[#121428] border border-purple-200 dark:border-purple-900/40 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">لوحة تحكم الطالب</h2>
              <p className="text-xs text-slate-600 dark:text-gray-400">سجل الدخول كطالب لعرض مفضلتك ومتابعة مواعيد المعاينة.</p>
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        );
      }
      return (
        <StudentDashboard
          onBackToHome={() => setCurrentView('home')}
          onSelectProperty={handleSelectProperty}
        />
      );
    }

    if (currentView === 'explore') {
      return (
        <ExploreView
          properties={properties}
          initialFilters={exploreFilters}
          onSelectProperty={handleSelectProperty}
        />
      );
    }

    // Default: HomeView
    return (
      <HomeView
        content={siteContent}
        featuredProperties={properties.slice(0, 6)}
        onSelectProperty={handleSelectProperty}
        onExploreWithFilters={handleExploreWithFilters}
        openAuthModal={handleOpenAuthModal}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0b0c16] text-slate-900 dark:text-white flex flex-col font-['Cairo'] selection:bg-purple-600 selection:text-white transition-colors duration-200">
      {/* Navigation Bar */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          setCurrentView={(v) => {
            setCurrentView(v as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          openAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        {renderCurrentView()}
      </div>

      {/* Footer */}
      {currentView !== 'admin' && (
        <Footer
          content={siteContent}
          onNavigate={(v) => {
            setCurrentView(v as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Global Modals */}
      <PropertyModal
        propertyId={selectedPropertyId}
        onClose={() => setSelectedPropertyId(null)}
        onRequestViewing={handleRequestViewing}
        onReport={handleReportProperty}
      />

      <BookingModal
        property={bookingProperty}
        onClose={() => setBookingProperty(null)}
        onSuccess={() => {
          loadData();
        }}
      />

      <ReportModal
        property={reportingProperty}
        onClose={() => setReportingProperty(null)}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialTab={authModalState.tab}
        onClose={() => setAuthModalState({ isOpen: false, tab: 'login' })}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
