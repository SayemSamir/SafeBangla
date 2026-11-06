import { TeamMember, AcademicProjectInfo, ProjectJourneyStage } from '../types/team';

/**
 * INITIAL VERIFIED FIVE-MEMBER TEAM PROFILES
 */
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Gazi Sayem Uddin Samir',
    academicRole: 'Undergraduate Student, Dept. of CSE',
    projectRole: 'Project Lead & Full-Stack Developer',
    shortBio: 'A Computer Science & Engineering student at BGC Trust University Bangladesh with an interest in programming, web development, and modern software solutions. Interested in building practical technology-driven applications that address real-world problems.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Tailwind CSS'],
    responsibilities: [],
    contributions: {
      summary: ''
    },
    githubUrl: 'https://github.com/SayemSamir',
    linkedinUrl: 'https://www.linkedin.com/in/gazi-sayem-uddin-samir',
    photoUrl: 'https://i.postimg.cc/3NpsGbKb/sayem.jpg',
    isPublic: true,
    displayOrder: 1
  },
  {
    id: 'member-2',
    name: 'Antunia Das',
    academicRole: 'Undergraduate Student, Dept. of CSE',
    projectRole: 'UI/UX & Frontend Developer',
    shortBio: 'A Computer Science & Engineering student interested in designing accessible and user-friendly digital experiences. Contributes to the development of intuitive interfaces for the RESQ BANGLADESH platform.',
    skills: ['UI/UX Design', 'React', 'Tailwind CSS', 'Figma', 'HTML/CSS'],
    responsibilities: [],
    contributions: {
      summary: 'To be updated'
    },
    githubUrl: 'https://github.com/antunia98',
    linkedinUrl: 'https://www.linkedin.com/in/antunia-das-7335812b8',
    photoUrl: 'https://i.postimg.cc/rpBg4yKT/antunia.jpg',
    isPublic: true,
    displayOrder: 2
  },
  {
    id: 'member-3',
    name: 'Ovin Paul',
    academicRole: 'Undergraduate Student, Dept. of CSE',
    projectRole: 'Backend & API Developer',
    shortBio: 'A Computer Science & Engineering student interested in backend engineering and application development. Focuses on the server-side systems that support reliable emergency reporting and response coordination.',
    skills: ['Python', 'FastAPI', 'Node.js', 'REST APIs', 'Database Integration'],
    responsibilities: [],
    contributions: {
      summary: 'To be updated'
    },
    githubUrl: 'https://github.com/Ovin88',
    linkedinUrl: 'https://www.linkedin.com/in/ovin-paul-2405b0440',
    photoUrl: 'https://i.postimg.cc/x8RPBKgG/ovin.jpg',
    isPublic: true,
    displayOrder: 3
  },
  {
    id: 'member-4',
    name: 'Montashir Nabil',
    academicRole: 'Undergraduate Student, Dept. of CSE',
    projectRole: 'Database & System Analyst',
    shortBio: 'A Computer Science & Engineering student interested in database systems, software analysis, and structured information management. Contributes to organizing the data and workflows required by the emergency response platform.',
    skills: ['SQL', 'PostgreSQL', 'System Analysis', 'ER Diagram', 'Data Modeling'],
    responsibilities: [],
    contributions: {
      summary: 'To be updated'
    },
    githubUrl: '',
    linkedinUrl: '',
    photoUrl: 'https://i.postimg.cc/4dRbd8Sg/nabil.jpg',
    isPublic: true,
    displayOrder: 4
  },
  {
    id: 'member-5',
    name: 'Sadman Samir',
    academicRole: 'Undergraduate Student, Dept. of CSE',
    projectRole: 'AI Research & QA Engineer',
    shortBio: 'A Computer Science & Engineering student interested in emerging technologies, intelligent applications, and software quality. Contributes to researching and evaluating features that can improve disaster response operations.',
    skills: ['Quality Assurance', 'AI Research', 'Bug Tracking', 'Technical Documentation'],
    responsibilities: [],
    contributions: {
      summary: 'To be updated'
    },
    githubUrl: '',
    linkedinUrl: '',
    photoUrl: 'https://i.postimg.cc/kMcFJvF2/sadman.jpg',
    isPublic: true,
    displayOrder: 5
  }
];

export const INITIAL_ACADEMIC_INFO: AcademicProjectInfo = {
  university: 'BGC Trust University Bangladesh',
  department: 'Computer Science & Engineering',
  courseTitle: 'Software Development Project -1',
  courseCode: 'CSE 3209',
  supervisor: 'Ferdous Ara',
  supervisorTitle: 'Faculty Supervisor, Dept. of Computer Science & Engineering',
  projectName: 'RESQ BANGLADESH',
  projectTitle: 'Smart Disaster & Emergency Response System',
  tagline: 'Connecting People, Saving Lives During Emergencies.',
  semester: '5th / 6th Semester',
  academicSession: '2024–2025',
  submissionDate: 'To be updated',
  teamNumber: 'Team-01',
  projectType: 'Academic Software Development Capstone',
  repositoryUrl: 'https://github.com/SayemSamir/SafeBangla',
  liveDemoUrl: 'https://resq-bangladesh-smart-disaster-emergency-response.ai.studio'
};

export const INITIAL_JOURNEY_STAGES: ProjectJourneyStage[] = [
  {
    id: 'stage-1',
    order: 1,
    stageName: 'Research & Planning',
    phaseLabel: 'Foundation',
    status: 'PRODUCTION_READY',
    description: 'Literature study of IEEE Paper #8538356, SDR-MIS architecture review, Bangladesh hazard mapping, and stakeholder requirement gathering.',
    deliverables: [
      'Disaster MIS architectural survey',
      'Division/District/Upazila geospatial catalog',
      'Emergency response stakeholder analysis'
    ],
    timeframe: 'Phase 1'
  },
  {
    id: 'stage-2',
    order: 2,
    stageName: 'Requirement Analysis',
    phaseLabel: 'Scoping & SRS',
    status: 'PRODUCTION_READY',
    description: 'Definition of 17-stage operational lifecycle, 8 role permissions, Haversine geospatial clustering, and emergency hotline integration.',
    deliverables: [
      'Software Requirements Specification (SRS)',
      'Threat model and privacy controls specification',
      'Role-based access matrix definition'
    ],
    timeframe: 'Phase 2'
  },
  {
    id: 'stage-3',
    order: 3,
    stageName: 'UI/UX Design',
    phaseLabel: 'Interface Design',
    status: 'PRODUCTION_READY',
    description: 'High-contrast emergency command center design system with deep navy palette (#0B132B), cyan/teal accents, accessible typography, and bilingual support.',
    deliverables: [
      'Mobile-first responsive emergency layout',
      'Emergency SOS trigger and quick triage modals',
      'Interactive OpenStreetMap GIS UI components'
    ],
    timeframe: 'Phase 3'
  },
  {
    id: 'stage-4',
    order: 4,
    stageName: 'Frontend Development',
    phaseLabel: 'Application Engine',
    status: 'INTEGRATED',
    description: 'Implementation of React 19 SPA, Tailwind CSS design system, bilingual translation layer, responsive operations dashboard, and audio-visual alert dispatch.',
    deliverables: [
      'Interactive GIS Map with radius duplicate detection',
      'Rescue Mission Kanban Dispatch board',
      'Relief inventory tracker and Hospital directory'
    ],
    timeframe: 'Phase 4'
  },
  {
    id: 'stage-5',
    order: 5,
    stageName: 'Backend Development',
    phaseLabel: 'Server Architecture',
    status: 'IN_DEVELOPMENT',
    description: 'REST API endpoints, JWT token authentication structure, WebSocket gateway for real-time dispatch, and rate limiting against API abuse.',
    deliverables: [
      'Modular REST API specifications',
      'Real-time WebSocket dispatch protocols',
      'Incident submission & status mutation endpoints'
    ],
    timeframe: 'Phase 5'
  },
  {
    id: 'stage-6',
    order: 6,
    stageName: 'Database Development',
    phaseLabel: 'Data Layer',
    status: 'IN_DEVELOPMENT',
    description: 'PostgreSQL relational schemas, PostGIS spatial indexing for fast proximity queries, and audit log tables for incident lifecycle tracking.',
    deliverables: [
      'Relational Entity-Relationship (ER) model',
      'Spatial coordinate indexing structure',
      'Incident update history and verification audit trail'
    ],
    timeframe: 'Phase 6'
  },
  {
    id: 'stage-7',
    order: 7,
    stageName: 'AI & GIS Integration',
    phaseLabel: 'Intelligence Engine',
    status: 'INTEGRATED',
    description: 'Heuristic and NLP emergency category classifier with bilingual support, severity scoring engine (1–10), and Haversine distance duplicate detection.',
    deliverables: [
      'Rule-based & keyword triage classifier (en/bn)',
      'Nearest cyclone shelter finder algorithm',
      'Incident spatial proximity cluster detector (<1.5 km)'
    ],
    timeframe: 'Phase 7'
  },
  {
    id: 'stage-8',
    order: 8,
    stageName: 'Testing & QA',
    phaseLabel: 'Verification',
    status: 'TESTED',
    description: 'Automated unit tests with Node test runner (7/7 suites passing), schema validation, mobile viewport verification, and accessibility audit.',
    deliverables: [
      'Automated geospatial calculation tests',
      'AI triage classification unit tests',
      'Browser UI validation and responsive checks'
    ],
    timeframe: 'Phase 8'
  },
  {
    id: 'stage-9',
    order: 9,
    stageName: 'Deployment & Operations',
    phaseLabel: 'Staging & Production',
    status: 'IN_DEVELOPMENT',
    description: 'Staging environment setup, production containerization, documentation publishing, and academic supervisor review.',
    deliverables: [
      'Production Vite build optimization',
      'Academic project presentation and documentation package',
      'Continuous deployment pipeline configuration'
    ],
    timeframe: 'Phase 9'
  }
];
