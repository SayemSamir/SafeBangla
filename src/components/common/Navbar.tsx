import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Flame,
  MapPin,
  PhoneCall,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  Menu,
  X,
  HeartHandshake,
  Users,
  Search
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
    { id: 'map', labelEn: 'Live Map', labelBn: 'লাইভ ম্যাপ', icon: MapPin },
    {
      id: 'operations',
      labelEn: 'Operations',
      labelBn: 'উদ্ধার অভিযান',
      icon: ShieldAlert,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'track', labelEn: 'Track SOS', labelBn: 'ট্র্যাক এসওএস', icon: Search },
    { id: 'team', labelEn: 'Meet The Team', labelBn: 'টিম ও প্রজেক্ট', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800">
      {/* Compact Emergency Contact & Utility Strip */}
      <div className="bg-[#070D1E] border-b border-slate-800/80 px-3 sm:px-4 py-1 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-red-400 text-[11px]">
              <PhoneCall className="w-3 h-3 text-red-400" />
              {t('Official Hotlines:', 'সরকারি হেল্পলাইন:')}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <a
                href="tel:999"
                className="bg-red-600/20 text-red-200 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-600/35 font-bold transition-colors"
                title="National Emergency Service 999"
              >
                999
              </a>
              <a
                href="tel:1090"
                className="bg-cyan-600/20 text-cyan-200 border border-cyan-500/40 px-2 py-0.5 rounded hover:bg-cyan-600/35 font-bold transition-colors"
                title="Disaster Early Warning 1090"
              >
                1090
              </a>
              <a
                href="tel:333"
                className="hidden md:inline bg-emerald-600/20 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded hover:bg-emerald-600/35 font-bold transition-colors"
                title="National Citizen Service 333"
              >
                333
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMarkSafeModalOpen(true)}
              className="inline-flex items-center gap-1 bg-emerald-900/50 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded hover:bg-emerald-800/60 transition-colors text-[11px] cursor-pointer"
            >
              <HeartHandshake className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">{t('Mark Safe', 'নিরাপদ আছি')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextStatus = !isOnline;
                setIsOnline(nextStatus);
                if (nextStatus && offlineQueue.length > 0) {
                  void syncOfflineQueue();
                }
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] transition-colors cursor-pointer ${
                isOnline
                  ? 'bg-slate-900 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/50'
              }`}
              title="Toggle network state for offline queue testing"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>OFFLINE ({offlineQueue.length})</span>
                </>
              )}
            </button>

            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'bn' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাং
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 text-left"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 border border-red-400/40 shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-mono">
                RESQ
              </span>
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded tracking-wider">
                <span className="sm:hidden">BD</span>
                <span className="hidden sm:inline">BANGLADESH</span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80 font-medium hidden lg:block">
              {t('Connecting People, Saving Lives During Emergencies', 'মানুষের পাশে, দুর্যোগে জীবনরক্ষায়')}
            </p>
          </div>
        </button>

        {/* Desktop Nav Links (5 concise top-level views) */}
        <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded font-bold tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              aria-label="Select Role"
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

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white tabular-nums">
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
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-slate-400">
                      {t('No notifications yet.', 'এখনো কোনো বিজ্ঞপ্তি নেই।')}
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          void markNotificationRead(n.id);
                        }}
                        className={`py-2 px-1.5 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                          !n.read ? 'bg-cyan-950/20' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary SOS Button */}
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            aria-label="Open Emergency SOS"
            className="min-h-[40px] flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black px-3 sm:px-4 py-1.5 rounded-xl border border-red-400/60 transition-colors text-xs sm:text-sm shrink-0 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span className="tracking-wider whitespace-nowrap">
              <span className="sm:hidden">{t('SOS', 'এসওএস')}</span>
              <span className="hidden sm:inline">{t('SOS HELP', 'জরুরি এসওএস')}</span>
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="xl:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-800 p-2.5 rounded-xl">
            <label className="text-[11px] text-slate-300 block mb-1">
              {t('Switch Role (For Operators & Responders):', 'ভূমিকা পরিবর্তন করুন:')}
            </label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="w-full min-h-[44px] bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'bn' ? r.labelBn : r.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
