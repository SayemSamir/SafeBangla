import type {
  EmergencyCategory,
  IncidentReport,
  IncidentStatus,
  RescueTeam,
  UserRole
} from '../types';
import { calculateHaversineDistance } from './geo';

export interface RecommendedTeam {
  team: RescueTeam;
  distanceKm: number | null;
  skillMatch: boolean;
  equipmentMatch: boolean;
  matchScore: number;
  reasons: string[];
}

const CATEGORY_EQUIPMENT_KEYWORDS: Record<EmergencyCategory, string[]> = {
  Flood: ['boat', 'raft', 'life vest', 'diving', 'sonar', 'water'],
  Drowning: ['boat', 'raft', 'life vest', 'diving', 'sonar'],
  Cyclone: ['boat', 'vhf', 'megaphone', 'purifier', 'first aid', 'stretcher'],
  Fire: ['ladder', 'foam', 'thermal', 'scba', 'fire'],
  'Building Collapse': ['ladder', 'thermal', 'hydraulic', 'stretcher', 'scba'],
  Earthquake: ['hydraulic', 'stretcher', 'first aid', 'scba', 'medical'],
  Landslide: ['stretcher', 'first aid', 'hydraulic', 'medical'],
  'Road Accident': ['stretcher', 'first aid', 'medical', 'trauma'],
  'Medical Emergency': ['medical', 'first aid', 'trauma', 'stretcher'],
  'Missing Person': ['sonar', 'vhf', 'boat', 'thermal', 'radio'],
  'Other Emergency': ['first aid', 'radio', 'stretcher']
};

export function recommendRescueTeams(
  incident: IncidentReport,
  teams: RescueTeam[]
): RecommendedTeam[] {
  const hasCoords =
    typeof incident.location.lat === 'number' &&
    typeof incident.location.lng === 'number';
  const keywords = CATEGORY_EQUIPMENT_KEYWORDS[incident.category] || ['first aid'];

  return teams
    .map((team) => {
      const distanceKm = hasCoords
        ? calculateHaversineDistance(
            incident.location.lat as number,
            incident.location.lng as number,
            team.currentLocation.lat,
            team.currentLocation.lng
          )
        : null;

      const skillMatch = team.skills.includes(incident.category);
      const equipmentText = team.equipment.join(' ').toLowerCase();
      const matchedEquipment = keywords.filter((kw) => equipmentText.includes(kw));
      const equipmentMatch = matchedEquipment.length > 0;
      const sameDistrict =
        team.baseDistrict.toLowerCase() === incident.location.district.toLowerCase();

      let score = 0;
      const reasons: string[] = [];

      if (team.available) {
        score += 40;
        reasons.push('Unit currently available');
      } else {
        score -= 50;
        reasons.push('Unit currently assigned to another mission');
      }

      if (skillMatch) {
        score += 30;
        reasons.push(`Trained for ${incident.category}`);
      }

      if (equipmentMatch) {
        score += 15;
        reasons.push(`Equipped (${matchedEquipment.slice(0, 2).join(', ')})`);
      }

      if (sameDistrict) {
        score += 10;
        reasons.push(`Based in ${team.baseDistrict}`);
      }

      if (distanceKm !== null) {
        const proximityBonus = Math.max(0, 25 - Math.min(25, distanceKm / 10));
        score += Math.round(proximityBonus * 10) / 10;
        reasons.push(`${distanceKm} km away`);
      }

      return {
        team,
        distanceKm,
        skillMatch,
        equipmentMatch,
        matchScore: Math.round(score * 10) / 10,
        reasons
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  PENDING: ['VERIFIED', 'REJECTED', 'CANCELLED'],
  VERIFIED: ['ASSIGNED', 'REJECTED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'IN_PROGRESS', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: [],
  REJECTED: []
};

const AUTHORIZED_OPERATOR_ROLES: UserRole[] = ['operator', 'district_admin', 'super_admin'];
const AUTHORIZED_RESPONDER_ROLES: UserRole[] = [
  'rescue_team',
  'volunteer',
  'operator',
  'district_admin',
  'super_admin'
];

export function canTransitionStatus(
  currentStatus: IncidentStatus,
  nextStatus: IncidentStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition directly from ${currentStatus} to ${nextStatus}.`
    };
  }

  if (nextStatus === 'VERIFIED' || nextStatus === 'ASSIGNED' || nextStatus === 'REJECTED') {
    if (!AUTHORIZED_OPERATOR_ROLES.includes(role)) {
      return {
        allowed: false,
        reason: 'Operator or Administrator authorization is required for verification and dispatch.'
      };
    }
  }

  if (nextStatus === 'ACCEPTED' || nextStatus === 'IN_PROGRESS' || nextStatus === 'RESOLVED') {
    if (!AUTHORIZED_RESPONDER_ROLES.includes(role)) {
      return {
        allowed: false,
        reason: 'Rescue responder or operator authorization is required.'
      };
    }
  }

  return { allowed: true };
}
