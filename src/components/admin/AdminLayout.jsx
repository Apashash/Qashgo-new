
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, CreditCard, LogOut, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const adminMenuItems = [
    { to: '/admin/dashboard', label: 'Tableau de Bord Admin', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Gestion des Utilisateurs', icon: Users },
    { to: '/admin/withdrawals', label: 'Gestion des Retraits', icon: CreditCard },
  ];

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ease-in-out
         ${isActive ? 'bg-sky-500 text-white shadow-md' : 'text-sky-100 hover:bg-sky-500/20 hover:text-sky-50'}`
      }
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white">
      <header className="glass-effect-dark border-b border-slate-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-red-400">QASHGO - ADMIN</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}>
                <Globe className="h-5 w-5 text-sky-300"/>
              </Button>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-slate-300/80">Admin:</span>
                <span className="font-semibold text-sky-400">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-sky-300 hover:bg-slate-700/50"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6">
        {/* Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 md:hidden w-64 glass-effect-dark border-r border-slate-700/50 p-6 z-30 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-3 mt-8 flex-1">
                {adminMenuItems.map(item => <NavItem key={item.to} {...item} />)}
              </nav>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start space-x-3 mt-auto text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </Button>
            </motion.aside>
          )}
        </AnimatePresence>
        
        <aside className="hidden md:block w-64 glass-effect-darker border-r border-slate-700/30 p-6 rounded-l-xl flex-shrink-0">
          <nav className="space-y-3 sticky top-24">
            {adminMenuItems.map(item => <NavItem key={item.to} {...item} />)}
            <div className="pt-6 mt-6 border-t border-slate-700/50">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start space-x-3 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto glass-effect-darker md:rounded-r-xl">
          {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
