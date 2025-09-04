import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import RegisterForm from '@/components/RegisterForm';
import LoginForm from '@/components/LoginForm';
import PaymentPage from '@/components/PaymentPage';
import Dashboard from '@/components/Dashboard';
import Profile from '@/components/Profile';
import Withdrawal from '@/components/Withdrawal';
import BonusClaim from '@/components/BonusClaim';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import YoutubeVideosPage from '@/components/YoutubeVideosPage';
import TikTokVideosPage from '@/components/TikTokVideosPage';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminWithdrawals from '@/components/admin/AdminWithdrawals';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 pattern-bg text-white">
      {/* Header */}
      <header className="glass-effect border-b border-gray-700/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-400">QASHGO</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}>
                <Globe className="h-5 w-5 text-blue-400"/>
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium bg-gray-700/20 hover:bg-gray-700/30 transition-colors rounded-lg"
              >
                {t('login')}
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transition-colors rounded-lg"
              >
                {t('register')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-blue-400 to-gray-400 mb-6">
            {t('landingTitle')}
          </h1>
          <p className="text-xl text-gray-200/80 mb-8 max-w-2xl mx-auto">
            {t('landingSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => navigate('/register')}
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transition-colors rounded-lg"
            >
              {t('getStarted')}
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-lg font-semibold bg-gray-700/20 hover:bg-gray-700/30 transition-colors rounded-lg"
            >
              {t('alreadyHaveAccount')}
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect p-6 rounded-lg border border-gray-700/30 card-hover-red"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-200">{t('highEarnings')}</h3>
              <p className="text-gray-200/70">{t('highEarningsDesc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect p-6 rounded-lg border border-gray-700/30 card-hover-blue"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-200">{t('quickStart')}</h3>
              <p className="text-gray-200/70">{t('quickStartDesc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-effect p-6 rounded-lg border border-gray-700/30 card-hover-gray"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-200">{t('welcomeBonus')}</h3>
              <p className="text-gray-200/70">{t('welcomeBonusDesc')}</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center glass-effect p-8 rounded-lg border border-gray-700/30"
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-blue-400 to-gray-400 mb-4">
            {t('readyToStart')}
          </h2>
          <p className="text-gray-200/80 text-lg mb-6">
            {t('readyToStartDesc')}
          </p>
          <Button
            onClick={() => navigate('/register')}
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transition-colors rounded-lg"
          >
            {t('joinNow')}
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.account_active && location.pathname !== '/payment') {
     return <Navigate to="/payment" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


// Main App Component
const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pendingUser, setPendingUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    const localPendingUser = localStorage.getItem('pendingUser');
    if (localPendingUser) {
      setPendingUser(JSON.parse(localPendingUser));
    }
  }, []);

  useEffect(() => {
    if (!loading && !user && !pendingUser && 
        location.pathname !== '/login' && 
        location.pathname !== '/register' && 
        !location.pathname.startsWith('/register?ref=') &&
        location.pathname !== '/forgot-password' &&
        !location.pathname.startsWith('/admin') && 
        location.pathname !== '/' 
      ) {
      navigate('/');
    }
  }, [user, loading, location.pathname, navigate, pendingUser]);

  useEffect(() => {
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (user) { // Only set timer if user is logged in
        inactivityTimer = setTimeout(async () => {
          await logout();
          navigate('/login');
          toast({
            title: t('sessionExpired'),
            description: t('sessionExpiredDueToInactivity'),
            variant: "destructive"
          });
        }, INACTIVITY_TIMEOUT);
      }
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
      resetTimer(); // Initial timer start
    }

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user, logout, navigate, t, INACTIVITY_TIMEOUT]);


  const handleRegister = (userData) => {
    setPendingUser(userData);
    localStorage.setItem('pendingUser', JSON.stringify(userData));
    navigate('/payment');
  };

  const handlePaymentComplete = (activatedUser) => {
    setPendingUser(null);
    localStorage.removeItem('pendingUser');
    navigate('/dashboard');
  };

  const handleLogin = (userData) => {
    if (!userData.account_active) { 
      setPendingUser(userData);
      localStorage.setItem('pendingUser', JSON.stringify(userData));
      navigate('/payment');
    } else {
      if (userData.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (user && user.is_admin && ['admin-dashboard', 'admin-users', 'admin-withdrawals'].includes(page)) {
      navigate(`/admin/${page.split('-')[1]}`);
    } else {
      navigate(`/${page}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-gray-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />

        <Route 
          path="/register" 
          element={
            <RegisterForm 
              onRegister={handleRegister}
            />
          } 
        />

        <Route 
          path="/login" 
          element={
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToRegister={() => navigate('/register')}
            />
          } 
        />

        <Route path="/forgot-password" element={<ForgotPasswordForm />} />

        <Route 
          path="/payment" 
          element={
            pendingUser || (user && !user.account_active) ? (
              <PaymentPage 
                user={pendingUser || user}
                onPaymentComplete={handlePaymentComplete}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout currentPage="dashboard" onNavigate={handleNavigation}><Dashboard user={user} /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout currentPage="profile" onNavigate={handleNavigation}><Profile user={user} /></Layout></ProtectedRoute>} />
        <Route path="/withdrawal" element={<ProtectedRoute><Layout currentPage="withdrawal" onNavigate={handleNavigation}><Withdrawal user={user} /></Layout></ProtectedRoute>} />
        <Route path="/bonus" element={<ProtectedRoute><Layout currentPage="bonus" onNavigate={handleNavigation}><BonusClaim user={user} /></Layout></ProtectedRoute>} />
        <Route path="/youtube" element={<ProtectedRoute><Layout currentPage="youtube" onNavigate={handleNavigation}><YoutubeVideosPage user={user} /></Layout></ProtectedRoute>} />
        <Route path="/tiktok" element={<ProtectedRoute><Layout currentPage="tiktok" onNavigate={handleNavigation}><TikTokVideosPage user={user} /></Layout></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/withdrawals" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminWithdrawals /></AdminLayout></ProtectedRoute>} />


        <Route 
          path="*" 
          element={
            user ? 
              (user.is_admin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />)
             : 
              <Navigate to="/" replace />
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

// Root App Component
const App = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
      </div>
    }>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <AppContent />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </Suspense>
  );
};

export default App;