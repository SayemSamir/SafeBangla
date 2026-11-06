import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AlertBanner } from './components/common/AlertBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/home/HeroSection';
import { BangladeshGisMap } from './components/map/BangladeshGisMap';
import { RescueOperations } from './components/operations/RescueOperations';
import { AiIntelligenceCenter } from './components/ai/AiIntelligenceCenter';
import { ReliefManagement } from './components/relief/ReliefManagement';
import { HospitalShelterDirectory } from './components/medical/HospitalShelterDirectory';
import { DisasterPreparedness } from './components/guides/DisasterPreparedness';
import { AdminAnalytics } from './components/analytics/AdminAnalytics';
import { ArchitectureDocs } from './components/about/ArchitectureDocs';
import { TeamProjectHub } from './components/team/TeamProjectHub';
import { SosModal } from './components/sos/SosModal';
import { MarkSafeModal } from './components/sos/MarkSafeModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {activeTab === 'home' && <HeroSection />}
      {activeTab === 'map' && <BangladeshGisMap />}
      {activeTab === 'operations' && <RescueOperations />}
      {activeTab === 'ai-center' && <AiIntelligenceCenter />}
      {activeTab === 'relief' && <ReliefManagement />}
      {activeTab === 'medical' && <HospitalShelterDirectory />}
      {activeTab === 'guides' && <DisasterPreparedness />}
      {activeTab === 'analytics' && <AdminAnalytics />}
      {activeTab === 'architecture' && <ArchitectureDocs />}
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

        {/* Global Action Modals */}
        <SosModal />
        <MarkSafeModal />
      </div>
    </AppProvider>
  );
}
