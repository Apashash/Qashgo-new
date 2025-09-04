
import React, { useState } from 'react';
import { Menu, X, Home, User, CreditCard, Gift, LogOut, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.528 8.528c3.056 0 4.664 2.112 4.664 4.664S15.584 17.856 12.528 17.856s-4.664-2.112-4.664-4.664c0-.048.016-.08.016-.128.08-2.336 1.856-4.416 4.648-4.528Z"/><path d="M17.192 8.528V4.8H20.8v6.464A4.656 4.656 0 0 1 16.144 16H8.256V4.8h3.632v3.728"/>
  </svg>
);


const Layout = ({ children, currentPage, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'withdrawal', label: t('withdrawal'), icon: CreditCard },
    { id: 'bonus', label: t('bonusClaim'), icon: Gift },
    { id: 'youtube', label: t('youtube'), icon: Youtube },
    { id: 'tiktok', label: t('tiktok'), icon: TikTokIcon },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-700 via-sky-800 to-sky-900 pattern-bg text-white">
      <header className="glass-effect border-b border-sky-300/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-red-400">QASHGO AGENCIES</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}>
                <Globe className="h-5 w-5 text-sky-300"/>
              </Button>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-sky-200/80">{t('helloUser', { username: '' }).replace(' !', ',')}</span>
                <span className="font-semibold text-sky-300">{user?.name}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-sky-300 hover:bg-sky-500/20"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden md:flex text-sky-300 hover:bg-sky-500/20"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 mobile-menu-overlay md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[90vw] glass-effect border-l border-sky-300/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-sky-300">{t('menu')}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sky-300 hover:bg-sky-500/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <nav className="space-y-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'default' : 'ghost'}
                        className={`w-full justify-start space-x-3 ${currentPage === item.id ? 'bg-sky-500 text-white' : 'text-sky-200 hover:bg-sky-500/20 hover:text-sky-100'}`}
                        onClick={() => {
                          onNavigate(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                  
                  <div className="pt-4 border-t border-sky-300/20">
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('logout')}</span>
                    </Button>
                  </div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden md:block absolute top-20 right-4 z-50 w-64 glass-effect rounded-lg border border-sky-300/20 p-4 shadow-xl"
          >
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                     className={`w-full justify-start space-x-3 ${currentPage === item.id ? 'bg-sky-500 text-white' : 'text-sky-200 hover:bg-sky-500/20 hover:text-sky-100'}`}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              
              <div className="pt-2 border-t border-sky-300/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;