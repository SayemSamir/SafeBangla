export type UserRole =
  | 'citizen'
  | 'volunteer'
  | 'rescue_team'
  | 'operator'
  | 'hospital_staff'
  | 'relief_org'
  | 'district_admin'
  | 'super_admin';

export type EmergencyCategory =
  | 'Flood'
  | 'Cyclone'
  | 'Fire'
  | 'Earthquake'
  | 'Landslide'
  | 'Building Collapse'
  | 'Road Accident'
  | 'Medical Emergency'
  | 'Drowning'
  | 'Missing Person'
  | 'Other Emergency';

export type EmergencySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED'
  | 'REJECTED';

export type MissionStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ESCALATED';

export type LocationSource =
  | 'gps'
  | 'map_manual'
  | 'address_manual'
  | 'landmark'
  | 'shared_location'
  | 'unlocated';

export type LocationStatus =
  | 'GPS_RECEIVED'
  | 'MANUAL_PIN'
  | 'LANDMARK_ONLY'
  | 'LOCATION_PENDING';

export type DataSource = 'real' | 'demo';

export interface StructuredAddress {
  houseNumber?: string;
  road?: string;
  neighborhood?: string;
  locality?: string;
  upazila?: string;
  district?: string;
  division?: string;
  postalCode?: string;
  country?: string;
}

export interface LocationCoordinates {
  lat: number | null;
  lng: number | null;
  division: string;
  district: string;
  upazila: string;
  addressDetails?: string;
  formattedAddress?: string;
  structuredAddress?: StructuredAddress;
  landmark?: string;
  nearbyLandmarkName?: string;
  nearbyLandmarkCategory?: string;
  nearbyLandmarkDistanceMeters?: number;
  accuracyMeters?: number;
  locationSource: LocationSource;
  locationStatus?: LocationStatus;
  locationTimestamp?: string;
}

export interface AIAssessment {
  suggestedCategory: EmergencyCategory;
  severityScore: number; // 1 - 10
  severityLevel: EmergencySeverity;
  confidence: number; // 0 - 1
  rationale: string[];
  isLikelyDuplicate: boolean;
  duplicateOfId?: string;
  damageTags?: string[];
  damageScore?: number;
}

export interface IncidentMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  caption?: string;
  mimeType?: string;
  aiDamageAssessment?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  previousStatus?: IncidentStatus;
  newStatus: IncidentStatus;
  details: string;
}

export interface IncidentReport {
  id: string; // e.g. "RESQ-2026-8941"
  trackingCode?: string; // 6-char guest verification code
  timestamp: string;
  lastUpdatedAt?: string;
  category: EmergencyCategory;
  title: string;
  description: string;
  location: LocationCoordinates;
  status: IncidentStatus;
  severity: EmergencySeverity;
  affectedPeople: number;
  hasInjured: boolean;
  hasTrapped: boolean;
  specialNeeds?: string;
  reporterName?: string;
  reporterPhone?: string;
  emergencyContactPhone?: string;
  isAnonymous: boolean;
  isGuest?: boolean;
  isDemo?: boolean;
  dataSource?: DataSource;
  isLiveTracking?: boolean;
  lastLocationUpdate?: string;
  assignedTeamId?: string;
  aiAssessment?: AIAssessment;
  media: IncidentMedia[];
  verifiedBy?: string;
  verifiedAt?: string;
  updates: {
    timestamp: string;
    message: string;
    updatedBy: string;
  }[];
  auditLogs?: AuditLogEntry[];
}

export interface RescueTeam {
  id: string;
  name: string;
  baseDistrict: string;
  division: string;
  type: 'Fire Service' | 'Red Crescent' | 'Coast Guard' | 'Army Disaster Unit' | 'Volunteer Unit';
  skills: EmergencyCategory[];
  contactPhone: string;
  memberCount: number;
  available: boolean;
  equipment: string[];
  currentLocation: { lat: number; lng: number };
  activeMissionId?: string;
  isDemo?: boolean;
  dataSource?: DataSource;
}

export interface Mission {
  id: string;
  incidentId: string;
  teamId: string;
  title: string;
  status: MissionStatus;
  priority: EmergencySeverity;
  startTime: string;
  estimatedCompletionTime?: string;
  completedTime?: string;
  notes: string;
  rescuedCount: number;
}

export interface CycloneShelter {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  capacity: number;
  currentOccupancy: number;
  hasDrinkingWater: boolean;
  hasElectricityOrSolar: boolean;
  hasMedicalPost: boolean;
  hasFemaleSafeSpace: boolean;
  contactNumber: string;
  lat: number;
  lng: number;
  isDemo?: boolean;
  dataSource?: DataSource;
}

export interface Hospital {
  id: string;
  name: string;
  division: string;
  district: string;
  type: 'Government Medical College' | 'District Sadar Hospital' | 'Upazila Health Complex' | 'Private';
  totalBeds: number;
  availableIcuBeds: number;
  availableGeneralBeds: number;
  hasEmergencyUnit: boolean;
  ambulanceAvailable: number;
  contactPhone: string;
  lat: number;
  lng: number;
  isDemo?: boolean;
  dataSource?: DataSource;
}

export interface ReliefResource {
  id: string;
  name: string;
  nameBn: string;
  category: 'Food' | 'Water' | 'Medicine' | 'Rescue Equipment' | 'Shelter Kits';
  quantity: number;
  unit: string;
  warehouseLocation: string;
  status: 'In Stock' | 'Low Stock' | 'Critical Shortage';
  minimumThreshold: number;
}

export interface DisasterAlert {
  id: string;
  titleEn: string;
  titleBn: string;
  type: 'Cyclone Warning' | 'Flood Flash Alert' | 'Heavy Rainfall' | 'Earthquake Advisory' | 'River Bank Erosion';
  warningLevel: 'Special Bulletin' | 'Warning Signal 4' | 'Danger Signal 7' | 'Great Danger Signal 10';
  affectedDistricts: string[];
  issuedAt: string;
  expiresAt: string;
  instructionsEn: string;
  instructionsBn: string;
  isBroadcasting: boolean;
  isDemo?: boolean;
  dataSource?: DataSource;
}

export interface DisasterPreparednessGuide {
  id: string;
  disasterType: string;
  titleEn: string;
  titleBn: string;
  before: { en: string; bn: string }[];
  during: { en: string; bn: string }[];
  after: { en: string; bn: string }[];
  emergencyKitList: { en: string; bn: string }[];
}

export interface NotificationDeliveryLog {
  id: string;
  incidentId: string;
  channel: 'in_app' | 'dashboard_alert' | 'email' | 'sms';
  status: 'delivered' | 'not_configured' | 'failed';
  recipientSummary: string;
  message: string;
  timestamp: string;
  providerNote: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  district: string;
  division: string;
  organization?: string;
  verified: boolean;
}
