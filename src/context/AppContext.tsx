import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  IncidentReport,
  RescueTeam,
  CycloneShelter,
  Hospital,
  ReliefResource,
  DisasterAlert,
  IncidentStatus,
  MissionStatus
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESCUE_TEAMS,
  INITIAL_SHELTERS,
  INITIAL_HOSPITALS,
  INITIAL_RESOURCES,
  INITIAL_ALERTS
} from '../data/bangladeshData';

interface SafePerson {
  id: string;
  name: string;
  phone: string;
  location: string;
  notes: string;
  timestamp: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'info' | 'dispatch';
}

interface AppContextType {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidents: IncidentReport[];
  rescueTeams: RescueTeam[];
  shelters: CycloneShelter[];
  hospitals: Hospital[];
  resources: ReliefResource[];
  alerts: DisasterAlert[];
  safePeople: SafePerson[];
  notifications: NotificationItem[];
  offlineQueue: IncidentReport[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  sosModalOpen: boolean;
  setSosModalOpen: (open: boolean) => void;
  markSafeModalOpen: boolean;
  setMarkSafeModalOpen: (open: boolean) => void;
  addIncident: (newIncident: IncidentReport) => void;
  verifyIncident: (incidentId: string, operatorName: string) => void;
  assignMission: (incidentId: string, teamId: string) => void;
  updateMissionStatus: (incidentId: string, status: MissionStatus, note?: string) => void;
  markPersonSafe: (person: Omit<SafePerson, 'id' | 'timestamp'>) => void;
  requestReliefStock: (resourceId: string, amount: number) => void;
  syncOfflineQueue: () => void;
  markNotificationRead: (id: string) => void;
  t: (keyEn: string, keyBn: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('resq_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(INITIAL_RESCUE_TEAMS);
  const [shelters, setShelters] = useState<CycloneShelter[]>(INITIAL_SHELTERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [resources, setResources] = useState<ReliefResource[]>(INITIAL_RESOURCES);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(INITIAL_ALERTS);
  const [safePeople, setSafePeople] = useState<SafePerson[]>([
    {
      id: 'SAFE-1',
      name: 'Farhana Yasmin',
      phone: '01712345678',
      location: 'Teknaf High School Shelter, Cox\'s Bazar',
      notes: 'Reached shelter safely with 2 kids and elder mother.',
      timestamp: '2026-11-05T16:00:00Z'
    },
    {
      id: 'SAFE-2',
      name: 'Mahbubur Rahman',
      phone: '01898765432',
      location: 'Tahirpur Upazila Parishad, Sunamganj',
      notes: 'Safe on high ground, livestock secured.',
      timestamp: '2026-11-05T17:30:00Z'
    }
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOTIF-1',
      title: 'Special Cyclone Warning (Signal 7)',
      message: 'Coastal evacuation orders issued for Cox\'s Bazar and Chattogram polders.',
      timestamp: '10m ago',
      read: false,
      type: 'urgent'
    },
    {
      id: 'NOTIF-2',
      title: 'Rescue Mission Dispatched',
      message: 'Swiftwater Rescue Unit deployed to Tahirpur flash flood zone.',
      timestamp: '25m ago',
      read: false,
      type: 'dispatch'
    }
  ]);
  const [offlineQueue, setOfflineQueue] = useState<IncidentReport[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [markSafeModalOpen, setMarkSafeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('resq_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = (keyEn: string, keyBn: string) => {
    return language === 'bn' ? keyBn : keyEn;
  };

  const addIncident = (newIncident: IncidentReport) => {
    if (!isOnline) {
      setOfflineQueue((prev) => [newIncident, ...prev]);
      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          title: language === 'bn' ? 'অফলাইনে সংরক্ষিত' : 'Saved Offline',
          message:
            language === 'bn'
              ? 'ইন্টারনেট সংযোগ না থাকায় আপনার SOS ড্রাফট হিসেবে জমা হয়েছে। সংযোগ পেলেই স্বয়ংক্রিয় সিঙ্ক হবে।'
              : 'Stored offline locally. Will automatically transmit once internet connects.',
          timestamp: 'Just now',
          read: false,
          type: 'info'
        },
        ...prev
      ]);
      return;
    }

    setIncidents((prev) => [newIncident, ...prev]);
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        title: language === 'bn' ? 'নতুন জরুরি রিপোর্ট প্রাপ্তি' : 'New Emergency SOS Received',
        message: `${newIncident.category} reported at ${newIncident.location.upazila}, ${newIncident.location.district}`,
        timestamp: 'Just now',
        read: false,
        type: 'urgent'
      },
      ...prev
    ]);
  };

  const verifyIncident = (incidentId: string, operatorName: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'VERIFIED' as IncidentStatus,
            verifiedBy: operatorName,
            verifiedAt: new Date().toISOString(),
            updates: [
              ...inc.updates,
              {
                timestamp: new Date().toISOString(),
                message: `Incident verified by operator ${operatorName}. Ready for rescue team dispatch.`,
                updatedBy: operatorName
              }
            ]
          };
        }
        return inc;
      })
    );
  };

  const assignMission = (incidentId: string, teamId: string) => {
    const team = rescueTeams.find((t) => t.id === teamId);
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'ASSIGNED' as IncidentStatus,
            assignedTeamId: teamId,
            updates: [
              ...inc.updates,
              {
                timestamp: new Date().toISOString(),
                message: `Assigned to rescue unit: ${team?.name || teamId}`,
                updatedBy: 'Operations Dispatcher'
              }
            ]
          };
        }
        return inc;
      })
    );

    setRescueTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            available: false,
            activeMissionId: `MISSION-${incidentId}`
          };
        }
        return t;
      })
    );
  };

  const updateMissionStatus = (incidentId: string, status: MissionStatus, note?: string) => {
    let incidentStatus: IncidentStatus = 'IN_PROGRESS';
    if (status === 'COMPLETED') incidentStatus = 'RESOLVED';
    if (status === 'CANCELLED') incidentStatus = 'CANCELLED';

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: incidentStatus,
            updates: [
              ...inc.updates,
              {
                timestamp: new Date().toISOString(),
                message: note || `Mission status updated to ${status}`,
                updatedBy: 'Field Rescue Team'
              }
            ]
          };
        }
        return inc;
      })
    );

    // If completed or cancelled, free the assigned rescue team
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      const targetInc = incidents.find((i) => i.id === incidentId);
      if (targetInc?.assignedTeamId) {
        setRescueTeams((prev) =>
          prev.map((team) =>
            team.id === targetInc.assignedTeamId
              ? { ...team, available: true, activeMissionId: undefined }
              : team
          )
        );
      }
    }
  };

  const markPersonSafe = (person: Omit<SafePerson, 'id' | 'timestamp'>) => {
    const newRecord: SafePerson = {
      ...person,
      id: `SAFE-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setSafePeople((prev) => [newRecord, ...prev]);
  };

  const requestReliefStock = (resourceId: string, amount: number) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          const newQty = Math.max(0, res.quantity - amount);
          return {
            ...res,
            quantity: newQty,
            status:
              newQty === 0
                ? 'Critical Shortage'
                : newQty < res.minimumThreshold
                ? 'Low Stock'
                : 'In Stock'
          };
        }
        return res;
      })
    );
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setIncidents((prev) => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        title: language === 'bn' ? 'সিঙ্ক সম্পন্ন' : 'Sync Complete',
        message:
          language === 'bn'
            ? 'অফলাইনে সংরক্ষিত সকল জরুরি বার্তা সার্ভারে সফলভাবে পাঠানো হয়েছে।'
            : 'All offline emergency reports synchronized successfully with command server.',
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        incidents,
        rescueTeams,
        shelters,
        hospitals,
        resources,
        alerts,
        safePeople,
        notifications,
        offlineQueue,
        isOnline,
        setIsOnline,
        sosModalOpen,
        setSosModalOpen,
        markSafeModalOpen,
        setMarkSafeModalOpen,
        addIncident,
        verifyIncident,
        assignMission,
        updateMissionStatus,
        markPersonSafe,
        requestReliefStock,
        syncOfflineQueue,
        markNotificationRead,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
