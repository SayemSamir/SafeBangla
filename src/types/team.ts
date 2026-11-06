/**
 * RESQ BANGLADESH — Team & Academic Project Types
 * Course: Software Development Project -1
 * Institution: BGC Trust University Bangladesh, Dept. of CSE
 * Supervisor: Ferdous Ara
 */

export interface MemberContributions {
  frontend?: string;
  backend?: string;
  research?: string;
  documentation?: string;
  testing?: string;
  summary?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  academicRole?: string;
  projectRole?: string;
  shortBio?: string;
  skills: string[];
  responsibilities: string[];
  contributions: MemberContributions;
  githubUrl?: string;
  linkedinUrl?: string;
  photoUrl?: string;
  isPublic: boolean;
  displayOrder: number;
}

export interface AcademicProjectInfo {
  university: string;
  department: string;
  courseTitle: string;
  courseCode?: string;
  supervisor: string;
  supervisorTitle?: string;
  projectName: string;
  projectTitle: string;
  tagline: string;
  semester?: string;
  academicSession?: string;
  submissionDate?: string;
  teamNumber?: string;
  projectType: string;
  repositoryUrl: string;
  liveDemoUrl?: string;
}

export type JourneyStatus =
  | 'PLANNED'
  | 'IN_DEVELOPMENT'
  | 'INTEGRATED'
  | 'TESTED'
  | 'PRODUCTION_READY';

export interface ProjectJourneyStage {
  id: string;
  order: number;
  stageName: string;
  phaseLabel: string;
  status: JourneyStatus;
  description: string;
  deliverables: string[];
  timeframe?: string;
}
