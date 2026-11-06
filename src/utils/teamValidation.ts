import { TeamMember, AcademicProjectInfo } from '../types/team';
import { INITIAL_TEAM_MEMBERS, INITIAL_ACADEMIC_INFO } from '../data/teamData';

const STORAGE_KEY_MEMBERS = 'resq_team_members';
const STORAGE_KEY_ACADEMIC = 'resq_academic_info';

/**
 * Validates image upload file
 */
export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, WEBP, or GIF images are permitted.'
    };
  }

  // Max 2MB
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'File size must not exceed 2MB.'
    };
  }

  return { valid: true };
}

/**
 * Validates a web URL safely
 */
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr || !urlStr.trim()) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Load team members from localStorage with fallback to initial data
 */
export function loadPersistedTeamMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) return INITIAL_TEAM_MEMBERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  } catch (e) {
    console.warn('Could not read team members from localStorage', e);
  }
  return INITIAL_TEAM_MEMBERS;
}

/**
 * Save team members to localStorage
 */
export function savePersistedTeamMembers(members: TeamMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Could not save team members to localStorage', e);
  }
}

/**
 * Load academic project info with fallback
 */
export function loadPersistedAcademicInfo(): AcademicProjectInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACADEMIC);
    if (!raw) return INITIAL_ACADEMIC_INFO;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read academic info from localStorage', e);
  }
  return INITIAL_ACADEMIC_INFO;
}

/**
 * Save academic project info to localStorage
 */
export function savePersistedAcademicInfo(info: AcademicProjectInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACADEMIC, JSON.stringify(info));
  } catch (e) {
    console.error('Could not save academic info to localStorage', e);
  }
}

/**
 * Generates neutral initials avatar color and letters
 */
export function getInitialsAvatar(name: string): { initials: string; bgColor: string } {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name[0] || 'R').toUpperCase();

  const colors = [
    'from-cyan-600 to-blue-700',
    'from-teal-600 to-emerald-700',
    'from-indigo-600 to-purple-700',
    'from-sky-600 to-cyan-800',
    'from-blue-600 to-indigo-800'
  ];

  // Deterministic pick based on string char codes
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const bgColor = colors[sum % colors.length];

  return { initials, bgColor };
}
