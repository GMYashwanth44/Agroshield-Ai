import React, { useState, useEffect } from 'react';
import {
  Shield, Leaf, Globe, User, ShoppingCart, Wifi, WifiOff,
  Sparkles, Menu, X, Check, Bell, Activity
} from 'lucide-react';
import { useTranslation, LANGUAGES } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { offlineStore } from '../../services/offlineStore';

export const Navbar = ({ onOpenDemoTour, onOpenCart, cartCount = 0, currentTab, setCurrentTab }) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, switchRole } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending offline records
    const checkSync = async () => {
      try {
        const pending = await offlineStore.getPendingReports();
        setPendingSyncCount(pending.length);
      } catch (e) {}
    };
    checkSync();
    const interval = setInterval(checkSync, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const navItemsByRole = {
    farmer: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'scan', label: 'Scan Crop' },
      { id: 'reports', label: 'My Reports' },
      { id: 'community_intelligence', label: 'Community Intel' },
      { id: 'map', label: 'Disease Map' },
      { id: 'weather', label: 'Weather & Soil' },
      { id: 'diary', label: 'Crop Diary' },
      { id: 'marketplace', label: 'Marketplace' },
      { id: 'prices', label: 'Mandi Prices' }
    ],
    officer: [
      { id: 'officer_dashboard', label: 'Surveillance Hub' },
      { id: 'officer_queue', label: 'Verification Queue' },
      { id: 'officer_outbreaks', label: 'Hotspots & Outbreaks' },
      { id: 'map', label: 'Regional Map' }
    ],
    admin: [
      { id: 'admin_dashboard', label: 'Admin Console' },
      { id: 'marketplace', label: 'Marketplace Management' },
      { id: 'officer_outbreaks', label: 'Surveillance Analytics' }
    ]
  };

  const navLinks = navItemsByRole[user?.role || 'farmer'] || navItemsByRole.farmer;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setCurrentTab(user?.role === 'officer' ? 'officer_dashboard' : user?.role === 'admin' ? 'admin_dashboard' : 'dashboard')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Shield className="w-6 h-6 stroke-[2.2]" />
              <Leaf className="w-3.5 h-3.5 text-lime-300 absolute -top-1 -right-1 stroke-[2.5]" />
              <Activity className="w-2.5 h-2.5 text-white/80 absolute bottom-1.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-950 font-sans">
                  AGROSHIELD <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  SIH
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-none hidden sm:block">
                Detect Early • Act Smart • Protect Crops
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentTab === item.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center gap-2">
            {/* SIH Presentation Runner Button */}
            <button
              onClick={onOpenDemoTour}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition animate-pulse"
              title="Step-by-step SIH Hackathon Demo Walkthrough"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIH Demo</span>
            </button>

            {/* Offline / Sync Status Badge */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isOnline
                  ? pendingSyncCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>{pendingSyncCount > 0 ? `Sync (${pendingSyncCount})` : 'Online'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-rose-500" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Language Selector Dropdown (6 Languages) */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{language}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Choose Language
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                        language === l.code ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Button (for Farmer role) */}
            {user?.role === 'farmer' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                title="Agri Marketplace Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher & User Profile */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block leading-none text-slate-900 font-bold">{user?.full_name}</span>
                  <span className="text-[10px] text-emerald-600 uppercase font-bold">{user?.role}</span>
                </div>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-500">{user?.email}</p>
                  </div>
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Switch Active Demo Role
                  </div>
                  <button
                    onClick={() => {
                      switchRole('farmer');
                      setCurrentTab('dashboard');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                      user?.role === 'farmer' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <span>👨‍🌾 Farmer (Ramesh Gowda)</span>
                    {user?.role === 'farmer' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('officer');
                      setCurrentTab('officer_dashboard');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                      user?.role === 'officer' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <span>🛡️ Agri Officer (Dr. Ananya)</span>
                    {user?.role === 'officer' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setCurrentTab('admin_dashboard');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                      user?.role === 'admin' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <span>⚙️ System Admin</span>
                    {user?.role === 'admin' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold ${
                  currentTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
