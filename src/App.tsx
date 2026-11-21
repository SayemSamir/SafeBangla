import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AlertBanner } from './components/common/AlertBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/home/HeroSection';
import { BangladeshGisMap } from './components/map/BangladeshGisMap';
import { RescueOperations } from './components/operations/RescueOperations';
import { TeamProjectHub } from './components/team/TeamProjectHub';
import { EmergencyTracker } from './components/tracking/EmergencyTracker';
import { SosModal } from './components/sos/SosModal';
import { MarkSafeModal } from './components/sos/MarkSafeModal';
import { FloatingSosBeacon } from './components/common/FloatingSosBeacon';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
      {activeTab === 'home' && <HeroSection />}
      {activeTab === 'map' && <BangladeshGisMap />}
      {activeTab === 'operations' && <RescueOperations />}
      {activeTab === 'track' && <EmergencyTracker />}
      {activeTab === 'team' && <TeamProjectHub />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
        <AlertBanner />
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />

        {/* Global Floating Emergency SOS Beacon (Desktop + Mobile) */}
        <FloatingSosBeacon />

        {/* Global Action Modals */}
        <SosModal />
        <MarkSafeModal />
      </div>
    </AppProvider>
  );
}
