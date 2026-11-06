import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember, AcademicProjectInfo } from '../../types/team';
import {
  loadPersistedTeamMembers,
  savePersistedTeamMembers,
  loadPersistedAcademicInfo,
  savePersistedAcademicInfo
} from '../../utils/teamValidation';
import { INITIAL_TEAM_MEMBERS, INITIAL_ACADEMIC_INFO, INITIAL_JOURNEY_STAGES } from '../../data/teamData';
import { MemberCard } from './MemberCard';
import { MemberDetailModal } from './MemberDetailModal';
import { AdminEditModal } from './AdminEditModal';
import { AboutProjectView } from './AboutProjectView';
import { ProjectJourneyView } from './ProjectJourneyView';
import { ProjectDocsView } from './ProjectDocsView';
import {
  Users,
  Info,
  Milestone,
  BookOpen,
  Search,
  Filter,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

export const TeamProjectHub: React.FC = () => {
  const { currentRole, language, t } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'team' | 'about-project' | 'journey' | 'docs'>('team');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [academicInfo, setAcademicInfo] = useState<AcademicProjectInfo>(INITIAL_ACADEMIC_INFO);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Determine if current user has admin rights
  const isAdmin = currentRole === 'super_admin' || currentRole === 'district_admin';

  // Load from local persistence on mount
  useEffect(() => {
    setMembers(loadPersistedTeamMembers());
    setAcademicInfo(loadPersistedAcademicInfo());
  }, []);

  const handleSaveMember = (updatedMember: TeamMember) => {
    const updatedList = members.map(m => (m.id === updatedMember.id ? updatedMember : m));
    setMembers(updatedList);
    savePersistedTeamMembers(updatedList);
    showNotice(`Profile for ${updatedMember.name} updated successfully.`);
  };

  const handleUpdateAcademicInfo = (newInfo: AcademicProjectInfo) => {
    setAcademicInfo(newInfo);
    savePersistedAcademicInfo(newInfo);
    showNotice('Academic project information updated.');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset team and academic information back to default initial records?')) {
      setMembers(INITIAL_TEAM_MEMBERS);
      setAcademicInfo(INITIAL_ACADEMIC_INFO);
      savePersistedTeamMembers(INITIAL_TEAM_MEMBERS);
      savePersistedAcademicInfo(INITIAL_ACADEMIC_INFO);
      showNotice('Reset to initial verified records.');
    }
  };

  const showNotice = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Filter members by query and public status (admins see all)
  const filteredMembers = members
    .filter(m => (isAdmin ? true : m.isPublic))
    .filter(m => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = m.name.toLowerCase().includes(q);
      const roleMatch = (m.projectRole || '').toLowerCase().includes(q);
      const skillMatch = (m.skills || []).some(s => s.toLowerCase().includes(q));
      return nameMatch || roleMatch || skillMatch;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950 border border-cyan-500 rounded-2xl text-cyan-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0A192F] to-[#070D1E] border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Users className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {t('Meet Our Team', 'আমাদের টিম ও প্রজেক্ট পরিচিতি')}
              </h1>
            </div>
            <p className="text-sm font-semibold text-cyan-300 font-mono pl-1">
              {t(
                'Five Minds. One Mission. Connecting People, Saving Lives.',
                'পাঁচ চিন্তাশীল মন। একটাই লক্ষ্য—দুর্যোগে মানুষের পাশে, জীবন বাঁচানো।'
              )}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>
                {academicInfo.university} • Department of {academicInfo.department} • Course: {academicInfo.courseTitle} • Supervisor: {academicInfo.supervisor}
              </span>
            </p>
          </div>

          {/* Quick controls: Role indicator & Reset */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Admin Editing Mode Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
                <span>View-Only Mode</span>
              </span>
            )}

            {isAdmin && (
              <button
                onClick={handleResetDefaults}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Reset to default initial records"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-800/80">
          {[
            { id: 'team', labelEn: 'Meet Our Team', labelBn: 'টিম মেম্বারস', icon: Users },
            { id: 'about-project', labelEn: 'About the Project', labelBn: 'প্রজেক্ট পরিচিতি', icon: Info },
            { id: 'journey', labelEn: 'Project Journey', labelBn: 'ডেভেলপমেন্ট রোডম্যাপ', icon: Milestone },
            { id: 'docs', labelEn: 'Project Documentation', labelBn: 'ডকুমেন্টেশন ও স্পেকস', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/40'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: MEET OUR TEAM */}
      {activeSubTab === 'team' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('Search by member name, role, or skill...', 'মেম্বারের নাম, দায়িত্ব বা স্কিল দিয়ে খুঁজুন...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] self-end sm:self-center">
              <span>Showing {filteredMembers.length} of 5 Members</span>
              {!isAdmin && (
                <span className="text-slate-500 italic">
                  (Tip: Switch role to Super Admin in top bar to edit)
                </span>
              )}
            </div>
          </div>

          {/* Members 5-Card Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onViewDetails={m => setSelectedMember(m)}
                onEdit={m => setEditingMember(m)}
                t={t}
              />
            ))}
          </div>

          {/* Academic Supervisor Highlight Card */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0A192F] to-slate-900 border border-cyan-500/30 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-600/50 flex items-center justify-center text-cyan-300 font-mono text-xl font-bold">
                FA
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  Academic Project Supervisor
                </span>
                <h3 className="text-lg font-bold text-white font-mono">{academicInfo.supervisor}</h3>
                <p className="text-xs text-slate-300">
                  Department of Computer Science & Engineering, {academicInfo.university}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono space-y-1">
              <div>Course: {academicInfo.courseTitle}</div>
              <div>Team Identifier: {academicInfo.teamNumber || 'Team-01'}</div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ABOUT THE PROJECT */}
      {activeSubTab === 'about-project' && (
        <AboutProjectView
          academicInfo={academicInfo}
          isAdmin={isAdmin}
          onUpdateAcademicInfo={handleUpdateAcademicInfo}
          t={t}
        />
      )}

      {/* SUB-TAB 3: PROJECT JOURNEY */}
      {activeSubTab === 'journey' && (
        <ProjectJourneyView stages={INITIAL_JOURNEY_STAGES} t={t} />
      )}

      {/* SUB-TAB 4: PROJECT DOCUMENTATION */}
      {activeSubTab === 'docs' && <ProjectDocsView t={t} />}

      {/* Modals */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        isAdmin={isAdmin}
        onEdit={m => {
          setSelectedMember(null);
          setEditingMember(m);
        }}
        t={t}
      />

      <AdminEditModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        onSave={handleSaveMember}
        t={t}
      />
    </div>
  );
};
