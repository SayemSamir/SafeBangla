import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Flame,
  MapPin,
  Bot,
  Package,
  Building2,
  BookOpen,
  BarChart3,
  PhoneCall,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  CheckCircle,
  Menu,
  X,
  FileCode2,
  HeartHandshake,
  Users
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    setSosModalOpen,
    setMarkSafeModalOpen,
    isOnline,
    setIsOnline,
    offlineQueue,
    syncOfflineQueue,
    notifications,
    markNotificationRead,
    incidents,
    t
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const pendingCount = incidents.filter((i) => i.status === 'PENDING').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const roles: { id: UserRole; labelEn: string; labelBn: string }[] = [
    { id: 'citizen', labelEn: 'Citizen (নাগরিক)', labelBn: 'নাগরিক' },
    { id: 'volunteer', labelEn: 'Volunteer (স্বেচ্ছাসেবক)', labelBn: 'স্বেচ্ছাসেবক' },
    { id: 'rescue_team', labelEn: 'Rescue Team (উদ্ধারকারী দল)', labelBn: 'উদ্ধারকারী দল' },
    { id: 'operator', labelEn: 'Operator (কন্ট্রোল রুম)', labelBn: 'কন্ট্রোল রুম' },
    { id: 'hospital_staff', labelEn: 'Hospital (হাসপাতাল)', labelBn: 'হাসপাতাল' },
    { id: 'relief_org', labelEn: 'Relief Org (ত্রাণ সংস্থা)', labelBn: 'ত্রাণ সংস্থা' },
    { id: 'district_admin', labelEn: 'District Admin (জেলা প্রশাসন)', labelBn: 'জেলা প্রশাসন' },
    { id: 'super_admin', labelEn: 'Super Admin (সুপার অ্যাডমিন)', labelBn: 'সুপার অ্যাডমিন' }
  ];

  const navItems = [
    { id: 'home', labelEn: 'Home', labelBn: 'মূলপাতা', icon: Flame },
    { id: 'map', labelEn: 'Live GIS Map', labelBn: 'লাইভ ম্যাপ', icon: MapPin },
    {
      id: 'operations',
      labelEn: 'Operations',
      labelBn: 'উদ্ধার অভিযান',
      icon: ShieldAlert,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'ai-center', labelEn: 'AI Intelligence', labelBn: 'এআই কন্ট্রোল', icon: Bot },
    { id: 'relief', labelEn: 'Relief & Supplies', labelBn: 'ত্রাণ ও লজিস্টিকস', icon: Package },
    { id: 'medical', labelEn: 'Hospitals & Shelters', labelBn: 'হাসপাতাল ও শেল্টার', icon: Building2 },
    { id: 'guides', labelEn: 'Safety Guides', labelBn: 'নিরাপত্তা নির্দেশিকা', icon: BookOpen },
    { id: 'analytics', labelEn: 'Analytics', labelBn: 'অ্যানালিটিক্স', icon: BarChart3 },
    { id: 'architecture', labelEn: 'Docs & Architecture', labelBn: 'আর্কিটেকচার', icon: FileCode2 },
    { id: 'team', labelEn: 'Meet The Team', labelBn: 'টিম ও প্রজেক্ট', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Bar */}
      <div className="bg-[#070D1E] border-b border-slate-800/80 px-3 sm:px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Emergency Hotlines */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider text-[11px]">
              <PhoneCall className="w-3 h-3 text-red-500 animate-pulse" />
              {t('Helplines:', 'হেল্পলাইন:')}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <a
                href="tel:999"
                className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-500/30 font-bold transition-colors"
                title="National Emergency Service"
              >
                999
              </a>
              <a
                href="tel:1090"
                className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded hover:bg-cyan-500/30 font-bold transition-colors"
                title="Disaster Early Warning Voice Portal"
              >
                1090
              </a>
              <a
                href="tel:333"
                className="hidden md:inline bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded hover:bg-emerald-500/30 transition-colors"
                title="Relief & Citizen Portal"
              >
                333
              </a>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Mark Safe Trigger */}
            <button
              onClick={() => setMarkSafeModalOpen(true)}
              className="flex items-center gap-1 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full hover:bg-emerald-600/50 transition-colors text-[11px]"
            >
              <HeartHandshake className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">{t('Mark Safe', 'নিরাপদ আছি')}</span>
            </button>

            {/* Online / Offline Simulator Toggle */}
            <button
              onClick={() => {
                const nextStatus = !isOnline;
                setIsOnline(nextStatus);
                if (nextStatus && offlineQueue.length > 0) {
                  syncOfflineQueue();
                }
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors ${
                isOnline
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              }`}
              title="Click to toggle network state for PWA offline testing"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>OFFLINE ({offlineQueue.length})</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === 'en'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === 'bn'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাং
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-700 to-amber-600 shadow-lg shadow-red-500/25 border border-red-400/40 group-hover:scale-105 transition-transform shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                RESQ
              </span>
              <span className="text-[9px] sm:text-xs bg-red-600/90 text-white font-bold px-1.5 py-0.5 rounded tracking-wider">
                <span className="sm:hidden">BD</span>
                <span className="hidden sm:inline">BANGLADESH</span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80 tracking-wide font-medium hidden md:block">
              {t('Smart Disaster & Emergency Response System', 'স্মার্ট দুর্যোগ ও জরুরি সাড়া ব্যবস্থাপনা')}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Role Switcher, Notifications & SOS Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Role selector dropdown */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2 py-1 rounded-lg text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {language === 'bn' ? r.labelBn : r.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-1.5 sm:p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-slate-200">
                  <span>{t('Emergency Notifications', 'জরুরি বিজ্ঞপ্তি')}</span>
                  <span className="text-[10px] text-cyan-400">
                    {unreadNotifs} {t('unread', 'নতুন')}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`py-2 px-1 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                        !n.read ? 'bg-cyan-950/20' : 'opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SOS Emergency Button */}
          <button
            onClick={() => setSosModalOpen(true)}
            aria-label="Open Emergency SOS Dispatch Modal"
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg shadow-red-600/40 border border-red-400/50 animate-emergency-pulse transition-colors text-xs sm:text-sm shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="tracking-wider text-xs sm:text-sm font-mono whitespace-nowrap">
              <span className="sm:hidden">{t('SOS', 'এসওএস')}</span>
              <span className="hidden sm:inline">{t('SOS REPORT', 'জরুরি এসওএস')}</span>
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          {/* Mobile Role Switcher */}
          <div className="bg-slate-800 p-2 rounded-lg mb-2">
            <span className="text-[11px] text-slate-400 block mb-1">
              {t('Switch User Role / Dashboard:', 'ভূমিকা পরিবর্তন করুন:')}
            </span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 text-white text-xs p-1.5 rounded border border-slate-700"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'bn' ? r.labelBn : r.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold text-left ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
