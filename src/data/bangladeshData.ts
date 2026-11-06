import {
  IncidentReport,
  RescueTeam,
  CycloneShelter,
  Hospital,
  ReliefResource,
  DisasterAlert,
  DisasterPreparednessGuide
} from '../types';

export interface DistrictInfo {
  name: string;
  nameBn: string;
  division: string;
  lat: number;
  lng: number;
  riskProfile: 'High Flood' | 'Severe Cyclone' | 'Landslide Prone' | 'Urban Fire & Earthquake' | 'River Erosion';
  upazilas: string[];
}

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  {
    name: 'Cox\'s Bazar',
    nameBn: 'কক্সবাজার',
    division: 'Chattogram',
    lat: 21.4272,
    lng: 92.0058,
    riskProfile: 'Severe Cyclone',
    upazilas: ['Sadar', 'Teknaf', 'Ukhiya', 'Chakaria', 'Maheshkhali', 'Pekua', 'Kutubdia', 'Ramu']
  },
  {
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    division: 'Chattogram',
    lat: 22.3569,
    lng: 91.7832,
    riskProfile: 'Landslide Prone',
    upazilas: ['Kotwali', 'Panchlaish', 'Mirsharai', 'Sitakunda', 'Anwara', 'Banshkhali', 'Hathazari', 'Sandwip']
  },
  {
    name: 'Sylhet',
    nameBn: 'সিলেট',
    division: 'Sylhet',
    lat: 24.8949,
    lng: 91.8687,
    riskProfile: 'High Flood',
    upazilas: ['Sadar', 'Companiganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Golapganj', 'Beanibazar']
  },
  {
    name: 'Sunamganj',
    nameBn: 'সুনামগঞ্জ',
    division: 'Sylhet',
    lat: 25.0658,
    lng: 91.3950,
    riskProfile: 'High Flood',
    upazilas: ['Sadar', 'Tahirpur', 'Derai', 'Jamalganj', 'Dharmapasha', 'Shalla', 'Jagannathpur']
  },
  {
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    division: 'Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    riskProfile: 'Urban Fire & Earthquake',
    upazilas: ['Dhanmondi', 'Mirpur', 'Gulshan', 'Mohammadpur', 'Uttara', 'Old Dhaka', 'Keraniganj', 'Savar']
  },
  {
    name: 'Kurigram',
    nameBn: 'কুড়িগ্রাম',
    division: 'Rangpur',
    lat: 25.8072,
    lng: 89.6295,
    riskProfile: 'High Flood',
    upazilas: ['Sadar', 'Chilmari', 'Ulipur', 'Nageshwari', 'Bhurungamari', 'Rajarhat', 'Rowmari']
  },
  {
    name: 'Khulna',
    nameBn: 'খুলনা',
    division: 'Khulna',
    lat: 22.8456,
    lng: 89.5403,
    riskProfile: 'Severe Cyclone',
    upazilas: ['Sadar', 'Koyra', 'Paikgachha', 'Dacope', 'Dumuria', 'Rupsha', 'Batiaghata']
  },
  {
    name: 'Satkhira',
    nameBn: 'সাতক্ষীরা',
    division: 'Khulna',
    lat: 22.7185,
    lng: 89.0705,
    riskProfile: 'Severe Cyclone',
    upazilas: ['Sadar', 'Shyamnagar', 'Assasuni', 'Kaliganj', 'Debhata', 'Tala', 'Kalaroa']
  },
  {
    name: 'Barishal',
    nameBn: 'বরিশাল',
    division: 'Barishal',
    lat: 22.7010,
    lng: 90.3535,
    riskProfile: 'Severe Cyclone',
    upazilas: ['Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Mehendiganj']
  },
  {
    name: 'Bhola',
    nameBn: 'ভোলা',
    division: 'Barishal',
    lat: 22.6859,
    lng: 90.6481,
    riskProfile: 'Severe Cyclone',
    upazilas: ['Sadar', 'Char Fasson', 'Monpura', 'Lalmohan', 'Borhanuddin', 'Daulatkhan']
  },
  {
    name: 'Sirajganj',
    nameBn: 'সিরাজগঞ্জ',
    division: 'Rajshahi',
    lat: 24.4534,
    lng: 89.7008,
    riskProfile: 'River Erosion',
    upazilas: ['Sadar', 'Kazipur', 'Shahjadpur', 'Belkuchi', 'Ullapara', 'Tarash', 'Chauhali']
  }
];

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Khulna',
  'Barishal',
  'Rajshahi',
  'Rangpur',
  'Mymensingh'
];

export const EMERGENCY_HOTLINES = [
  {
    number: '999',
    titleEn: 'National Emergency Service',
    titleBn: 'জাতীয় জরুরি সেবা',
    descEn: 'Police, Fire Service & Civil Defence, Government Ambulance',
    descBn: 'পুলিশ, ফায়ার সার্ভিস ও সিভিল ডিফেন্স, অ্যাম্বুলেন্স সেবা',
    category: 'Universal',
    isTollFree: true
  },
  {
    number: '1090',
    titleEn: 'Disaster Early Warning IVR',
    titleBn: 'দুর্যোগের আগাম সতর্কবার্তা',
    descEn: 'BMD Cyclone & Flood Forecasts, Sea warning signals updated hourly',
    descBn: 'আবহাওয়া অধিদপ্তর ও বন্যা পূর্বাভাস সতর্কীকরণ কেন্দ্র',
    category: 'Weather & Cyclone',
    isTollFree: true
  },
  {
    number: '16107',
    titleEn: 'Disaster Management Emergency Cell',
    titleBn: 'দুর্যোগ ব্যবস্থাপনা নিয়ন্ত্রণ কক্ষ',
    descEn: 'Ministry of Disaster Management and Relief (MoDMR) 24/7 Command',
    descBn: 'দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয় ২৪/৭ নিয়ন্ত্রণ কক্ষ',
    category: 'Relief & Crisis',
    isTollFree: false
  },
  {
    number: '333',
    titleEn: 'National Citizen Service & Relief',
    titleBn: 'জাতীয় তথ্য ও জরুরি ত্রাণ সেবা',
    descEn: 'Government public services, food assistance & upazila disaster aid',
    descBn: 'জরুরি খাদ্য ও ত্রাণ সহায়তা প্রাপ্তির সরকারি হেল্পলাইন',
    category: 'Relief',
    isTollFree: true
  },
  {
    number: '16263',
    titleEn: 'Shastho Batayon (Health Line)',
    titleBn: 'স্বাস্থ্য বাতায়ন',
    descEn: 'DGHS 24-hour doctor consultation and hospital referral',
    descBn: 'স্বাস্থ্য অধিদপ্তর সার্বক্ষণিক ডাক্তার পরামর্শ ও জরুরি সেবা',
    category: 'Medical',
    isTollFree: false
  },
  {
    number: '109',
    titleEn: 'Helpline for Women & Children',
    titleBn: 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন',
    descEn: 'Protection & special emergency shelter support',
    descBn: 'জরুরি আশ্রয় ও আইনি সুরক্ষা সহায়তা',
    category: 'Protection',
    isTollFree: true
  }
];

export const INITIAL_ALERTS: DisasterAlert[] = [
  {
    id: 'ALERT-BD-2026-01',
    titleEn: 'Special Weather Bulletin: Bay of Bengal Cyclone Warning',
    titleBn: 'বিশেষ আবহাওয়া বার্তা: বঙ্গোপসাগরে ঘূর্ণিঝড় সতর্কবার্তা',
    type: 'Cyclone Warning',
    warningLevel: 'Danger Signal 7',
    affectedDistricts: ['Cox\'s Bazar', 'Chattogram', 'Bhola', 'Barishal', 'Satkhira'],
    issuedAt: '2026-11-05T14:30:00Z',
    expiresAt: '2026-11-07T18:00:00Z',
    instructionsEn: 'Coastal residents advised to relocate to designated cyclone shelters. Fishing boats and trawlers strictly advised not to venture into deep sea.',
    instructionsBn: 'উপকূলীয় এলাকার বাসিন্দাদের নিকটবর্তী বহুমুখী ঘূর্ণিঝড় আশ্রয়কেন্দ্রে আশ্রয় নেওয়ার পরামর্শ দেওয়া হচ্ছে। মাছ ধরার ট্রলারসমূহকে নিরাপদ আশ্রয়ে থাকতে বলা হলো।',
    isBroadcasting: true
  },
  {
    id: 'ALERT-BD-2026-02',
    titleEn: 'Surma & Kushiyara River Flash Flood Advisory',
    titleBn: 'সুরমা ও কুশিয়ারা নদীর আকস্মিক বন্যা সতর্কতা',
    type: 'Flood Flash Alert',
    warningLevel: 'Warning Signal 4',
    affectedDistricts: ['Sylhet', 'Sunamganj'],
    issuedAt: '2026-11-05T09:00:00Z',
    expiresAt: '2026-11-06T23:59:00Z',
    instructionsEn: 'Water levels rising rapidly in Gowainghat and Tahirpur haor basins. Move livestock, dry rations, and potable water to raised platforms.',
    instructionsBn: 'গোয়াইনঘাট ও তাহিরপুর হাওর এলাকায় পানি দ্রুত বৃদ্ধি পাচ্ছে। গবাদি পশু, শুকনো খাবার ও সুপেয় পানি উঁচু স্থানে স্থানান্তর করুন।',
    isBroadcasting: true
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'RESQ-2026-1042',
    timestamp: '2026-11-05T17:15:00Z',
    category: 'Flood',
    title: 'Flash Flood Inundation & Trapped Families in Tahirpur',
    description: 'Flash flood waters breached village embankment near Shalla-Tahirpur border. Over 18 families including children and elderly marooned on roof of local primary school without clean water.',
    location: {
      lat: 25.0880,
      lng: 91.1890,
      division: 'Sylhet',
      district: 'Sunamganj',
      upazila: 'Tahirpur',
      addressDetails: 'Uttar Sreepur Union, Paschim Para School'
    },
    status: 'IN_PROGRESS',
    severity: 'Critical',
    affectedPeople: 45,
    hasInjured: true,
    hasTrapped: true,
    specialNeeds: '6 infants, 4 elderly citizens, urgent clean drinking water required',
    reporterName: 'Kabir Hossain (Local Union Parishad Member)',
    reporterPhone: '01711928374',
    isAnonymous: false,
    assignedTeamId: 'TEAM-FS-01',
    aiAssessment: {
      suggestedCategory: 'Flood',
      severityScore: 9.4,
      severityLevel: 'Critical',
      confidence: 0.96,
      rationale: [
        'Water level rising over 1.5m above danger mark',
        'Multiple vulnerable demographics trapped (children & elderly)',
        'Access cut off by road, requires specialized motorized rescue dinghy'
      ],
      isLikelyDuplicate: false,
      damageTags: ['Embankment Breach', 'High Water Inundation', 'Isolated Settlement'],
      damageScore: 8.8
    },
    media: [
      {
        id: 'MED-01',
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        type: 'image',
        caption: 'School building surrounded by swirling flood currents',
        aiDamageAssessment: 'Visible high-level submersion of ground floor. Inaccessible by standard foot or wheeled transit.'
      }
    ],
    verifiedBy: 'HQ Operator Salma Akter',
    verifiedAt: '2026-11-05T17:22:00Z',
    updates: [
      {
        timestamp: '2026-11-05T17:22:00Z',
        message: 'Incident verified via UP Chairman phone interview.',
        updatedBy: 'Operator Salma'
      },
      {
        timestamp: '2026-11-05T17:35:00Z',
        message: 'Sunamganj Fire Service Water Rescue Unit dispatched with 2 high-power rescue boats.',
        updatedBy: 'Commander Rafiq'
      }
    ]
  },
  {
    id: 'RESQ-2026-1043',
    timestamp: '2026-11-05T17:40:00Z',
    category: 'Cyclone',
    title: 'Kutubdia Coastal Tidal Surge & Damaged Fishermen Dwellings',
    description: 'High wind gusts and 6-foot tidal surge breached the southern polder in Ali Akbar Deil. Several mud and tin houses flattened, residents evacuated to nearby cyclone shelter.',
    location: {
      lat: 21.7820,
      lng: 91.8600,
      division: 'Chattogram',
      district: 'Cox\'s Bazar',
      upazila: 'Kutubdia',
      addressDetails: 'Ali Akbar Deil, Ward 4'
    },
    status: 'ASSIGNED',
    severity: 'High',
    affectedPeople: 80,
    hasInjured: true,
    hasTrapped: false,
    specialNeeds: 'First aid for cuts, dry rations and blankets',
    reporterName: 'Jashim Uddin (CPP Volunteer)',
    reporterPhone: '01819283746',
    isAnonymous: false,
    assignedTeamId: 'TEAM-CPP-02',
    aiAssessment: {
      suggestedCategory: 'Cyclone',
      severityScore: 8.2,
      severityLevel: 'High',
      confidence: 0.94,
      rationale: [
        'Direct coastal exposure to Bay of Bengal surge',
        'Structural damage to non-engineered residential units',
        'Organized shelter evacuation in progress'
      ],
      isLikelyDuplicate: false,
      damageTags: ['Roof Damage', 'Tidal Surge Inflow', 'Debris Obstruction'],
      damageScore: 7.9
    },
    media: [
      {
        id: 'MED-02',
        url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
        type: 'image',
        caption: 'Tin sheet wreckage from cyclone wind force'
      }
    ],
    verifiedBy: 'District Officer Tanveer',
    verifiedAt: '2026-11-05T17:48:00Z',
    updates: [
      {
        timestamp: '2026-11-05T17:48:00Z',
        message: 'Red Crescent CPP volunteers actively distributing relief biscuits and oral saline.',
        updatedBy: 'Tanveer Ahmed'
      }
    ]
  },
  {
    id: 'RESQ-2026-1044',
    timestamp: '2026-11-05T18:10:00Z',
    category: 'Fire',
    title: 'Chemical Warehouse Fire in Postogola, Old Dhaka',
    description: 'Dense smoke and chemical flare-ups reported in a footwear adhesive storage warehouse. Flames threatening adjacent 5-story residential building.',
    location: {
      lat: 23.7020,
      lng: 90.4310,
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Old Dhaka',
      addressDetails: 'Postogola Bridge Approach Road'
    },
    status: 'IN_PROGRESS',
    severity: 'Critical',
    affectedPeople: 60,
    hasInjured: true,
    hasTrapped: true,
    specialNeeds: 'Burn trauma response, burn dressing units, evacuation ladders',
    reporterName: 'Anwar Parvez',
    reporterPhone: '01912837465',
    isAnonymous: false,
    assignedTeamId: 'TEAM-FS-03',
    aiAssessment: {
      suggestedCategory: 'Fire',
      severityScore: 9.7,
      severityLevel: 'Critical',
      confidence: 0.98,
      rationale: [
        'Chemical flammable accelerants present in densely packed urban setting',
        'Occupants in adjacent residential units at high suffocation risk',
        'Narrow lane access requires multi-pump relay'
      ],
      isLikelyDuplicate: false,
      damageTags: ['Chemical Fire', 'Structural Collapse Hazard', 'High Smoke Density'],
      damageScore: 9.3
    },
    media: [],
    verifiedBy: 'FSCD Central Control Room',
    verifiedAt: '2026-11-05T18:13:00Z',
    updates: [
      {
        timestamp: '2026-11-05T18:14:00Z',
        message: '4 Fire firefighting units from Postogola and Sadarghat actively working at scene.',
        updatedBy: 'Control Room Officer'
      }
    ]
  },
  {
    id: 'RESQ-2026-1045',
    timestamp: '2026-11-05T18:25:00Z',
    category: 'Landslide',
    title: 'Hillside Mudslide Blocking Sitakunda Coastal Highway',
    description: 'Continuous torrential rains triggered a 30-meter mudslide from Chandranath hill slope, overturning an intercity passenger bus and blocking emergency lane.',
    location: {
      lat: 22.6180,
      lng: 91.6600,
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'Sitakunda',
      addressDetails: 'Sitakunda Bypass near Chandranath Hill'
    },
    status: 'VERIFIED',
    severity: 'High',
    affectedPeople: 32,
    hasInjured: true,
    hasTrapped: false,
    specialNeeds: 'Heavy hydraulic earthmovers, spine boards, ambulance fleet',
    reporterName: 'Highway Patrol Sergeant Mizan',
    reporterPhone: '01712093847',
    isAnonymous: false,
    aiAssessment: {
      suggestedCategory: 'Landslide',
      severityScore: 8.5,
      severityLevel: 'High',
      confidence: 0.92,
      rationale: [
        'Major transportation artery obstructed',
        'Multiple casualties trapped in mud debris',
        'Secondary mudslide risk elevated due to persistent downpour'
      ],
      isLikelyDuplicate: false,
      damageTags: ['Highway Blockade', 'Soil Liquefaction', 'Vehicle Entrapment'],
      damageScore: 8.1
    },
    media: [],
    updates: []
  }
];

export const INITIAL_RESCUE_TEAMS: RescueTeam[] = [
  {
    id: 'TEAM-FS-01',
    name: 'Sunamganj Swiftwater Rescue Unit',
    baseDistrict: 'Sunamganj',
    division: 'Sylhet',
    type: 'Fire Service',
    contactPhone: '01713028301',
    memberCount: 14,
    available: false,
    equipment: ['Speed Rescue Boat (x3)', 'Diving Gear', 'Sonar Sensor', 'First Aid Trauma Pack', 'Life Vests (x60)'],
    currentLocation: { lat: 25.0750, lng: 91.2100 },
    activeMissionId: 'MISSION-2026-01'
  },
  {
    id: 'TEAM-CPP-02',
    name: 'BDRCS Cyclone Preparedness Programme Unit 4',
    baseDistrict: 'Cox\'s Bazar',
    division: 'Chattogram',
    type: 'Red Crescent',
    contactPhone: '01814039202',
    memberCount: 22,
    available: false,
    equipment: ['Megaphones', 'VHF Radios', 'First Aid Kits (x10)', 'Stretcher Packs', 'Emergency Water Purifier'],
    currentLocation: { lat: 21.7850, lng: 91.8650 },
    activeMissionId: 'MISSION-2026-02'
  },
  {
    id: 'TEAM-FS-03',
    name: 'FSCD Dhaka Hazardous Materials & Fire Special Force',
    baseDistrict: 'Dhaka',
    division: 'Dhaka',
    type: 'Fire Service',
    contactPhone: '01915049303',
    memberCount: 18,
    available: false,
    equipment: ['Hydraulic Turntable Ladder', 'Thermal Imaging Camera', 'Chemical Foam Injectors', 'SCBA Gear'],
    currentLocation: { lat: 23.7025, lng: 90.4305 },
    activeMissionId: 'MISSION-2026-03'
  },
  {
    id: 'TEAM-CG-04',
    name: 'Bangladesh Coast Guard Quick Reaction Coastal Flotilla',
    baseDistrict: 'Chattogram',
    division: 'Chattogram',
    type: 'Coast Guard',
    contactPhone: '01716059404',
    memberCount: 30,
    available: true,
    equipment: ['High-Speed Metal Shark Boats', 'Satellite Comm Buoys', 'Emergency Medical Evacuation Bed'],
    currentLocation: { lat: 22.2500, lng: 91.7500 }
  },
  {
    id: 'TEAM-VOL-05',
    name: 'RESQ Volunteer Youth Brigade - Sylhet Division',
    baseDistrict: 'Sylhet',
    division: 'Sylhet',
    type: 'Volunteer Unit',
    contactPhone: '01717069505',
    memberCount: 45,
    available: true,
    equipment: ['Dry Food Distribution Packs', 'Hand Crank Radios', 'Inflatable Rafts', 'Basic First Aid Kits'],
    currentLocation: { lat: 24.8949, lng: 91.8687 }
  }
];

export const INITIAL_SHELTERS: CycloneShelter[] = [
  {
    id: 'SHELTER-CXB-01',
    name: 'Teknaf High School Cyclone Shelter & Safe Haven',
    division: 'Chattogram',
    district: 'Cox\'s Bazar',
    upazila: 'Teknaf',
    capacity: 1500,
    currentOccupancy: 850,
    hasDrinkingWater: true,
    hasElectricityOrSolar: true,
    hasMedicalPost: true,
    hasFemaleSafeSpace: true,
    contactNumber: '01819384756',
    lat: 20.8650,
    lng: 92.2980
  },
  {
    id: 'SHELTER-KUT-02',
    name: 'Ali Akbar Deil Multi-Purpose Cyclone Shelter',
    division: 'Chattogram',
    district: 'Cox\'s Bazar',
    upazila: 'Kutubdia',
    capacity: 1200,
    currentOccupancy: 950,
    hasDrinkingWater: true,
    hasElectricityOrSolar: true,
    hasMedicalPost: true,
    hasFemaleSafeSpace: true,
    contactNumber: '01819384757',
    lat: 21.7800,
    lng: 91.8590
  },
  {
    id: 'SHELTER-SYL-03',
    name: 'Gowainghat Model College Flood Shelter Center',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Gowainghat',
    capacity: 900,
    currentOccupancy: 640,
    hasDrinkingWater: true,
    hasElectricityOrSolar: false,
    hasMedicalPost: true,
    hasFemaleSafeSpace: true,
    contactNumber: '01718293847',
    lat: 25.1020,
    lng: 92.0150
  },
  {
    id: 'SHELTER-KHU-04',
    name: 'Koyra South Polder Multi-purpose Cyclone Shelter',
    division: 'Khulna',
    district: 'Khulna',
    upazila: 'Koyra',
    capacity: 1400,
    currentOccupancy: 520,
    hasDrinkingWater: true,
    hasElectricityOrSolar: true,
    hasMedicalPost: true,
    hasFemaleSafeSpace: true,
    contactNumber: '01919283746',
    lat: 22.3410,
    lng: 89.3010
  },
  {
    id: 'SHELTER-BHO-05',
    name: 'Char Fasson Coastal Community Safe Shelter',
    division: 'Barishal',
    district: 'Bhola',
    upazila: 'Char Fasson',
    capacity: 2000,
    currentOccupancy: 1100,
    hasDrinkingWater: true,
    hasElectricityOrSolar: true,
    hasMedicalPost: true,
    hasFemaleSafeSpace: true,
    contactNumber: '01719283745',
    lat: 22.1850,
    lng: 90.7100
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-DHK-01',
    name: 'Dhaka Medical College & Hospital (DMCH)',
    division: 'Dhaka',
    district: 'Dhaka',
    type: 'Government Medical College',
    totalBeds: 2600,
    availableIcuBeds: 14,
    availableGeneralBeds: 185,
    hasEmergencyUnit: true,
    ambulanceAvailable: 8,
    contactPhone: '02-55165088',
    lat: 23.7258,
    lng: 90.3976
  },
  {
    id: 'HOSP-CTG-02',
    name: 'Chattogram Medical College Hospital (CMCH)',
    division: 'Chattogram',
    district: 'Chattogram',
    type: 'Government Medical College',
    totalBeds: 2200,
    availableIcuBeds: 8,
    availableGeneralBeds: 140,
    hasEmergencyUnit: true,
    ambulanceAvailable: 6,
    contactPhone: '031-616382',
    lat: 22.3585,
    lng: 91.8290
  },
  {
    id: 'HOSP-SYL-03',
    name: 'Sylhet MAG Osmani Medical College Hospital',
    division: 'Sylhet',
    district: 'Sylhet',
    type: 'Government Medical College',
    totalBeds: 900,
    availableIcuBeds: 6,
    availableGeneralBeds: 92,
    hasEmergencyUnit: true,
    ambulanceAvailable: 5,
    contactPhone: '0821-713487',
    lat: 24.8998,
    lng: 91.8542
  },
  {
    id: 'HOSP-CXB-04',
    name: 'Cox\'s Bazar District Sadar Hospital (250 Bed)',
    division: 'Chattogram',
    district: 'Cox\'s Bazar',
    type: 'District Sadar Hospital',
    totalBeds: 250,
    availableIcuBeds: 4,
    availableGeneralBeds: 28,
    hasEmergencyUnit: true,
    ambulanceAvailable: 4,
    contactPhone: '0341-63820',
    lat: 21.4350,
    lng: 91.9820
  },
  {
    id: 'HOSP-SUN-05',
    name: 'Sunamganj District Sadar Hospital',
    division: 'Sylhet',
    district: 'Sunamganj',
    type: 'District Sadar Hospital',
    totalBeds: 250,
    availableIcuBeds: 2,
    availableGeneralBeds: 34,
    hasEmergencyUnit: true,
    ambulanceAvailable: 3,
    contactPhone: '0871-61320',
    lat: 25.0680,
    lng: 91.4020
  }
];

export const INITIAL_RESOURCES: ReliefResource[] = [
  {
    id: 'RES-01',
    name: 'High-Energy Emergency Biscuits (BP-5 / WFP Spec)',
    nameBn: 'উচ্চ পুষ্টিসমৃদ্ধ জরুরি শুকনো বিস্কুট',
    category: 'Food',
    quantity: 45000,
    unit: 'Packs',
    warehouseLocation: 'Chattogram Regional Depot',
    status: 'In Stock',
    minimumThreshold: 10000
  },
  {
    id: 'RES-02',
    name: 'Bottled Purified Drinking Water (2 Liters)',
    nameBn: 'নিরাপদ বোতলজাত খাবার পানি (২ লিটার)',
    category: 'Water',
    quantity: 18500,
    unit: 'Bottles',
    warehouseLocation: 'Sylhet Haor Relief Hub',
    status: 'Low Stock',
    minimumThreshold: 20000
  },
  {
    id: 'RES-03',
    name: 'Water Purification Halazone / Aquatabs (Tablets)',
    nameBn: 'পানি বিশুদ্ধকরণ ক্লোরিন ট্যাবলেট',
    category: 'Water',
    quantity: 350000,
    unit: 'Tablets',
    warehouseLocation: 'Sunamganj Depot',
    status: 'In Stock',
    minimumThreshold: 50000
  },
  {
    id: 'RES-04',
    name: 'Oral Rehydration Salts (ORS) Sachets',
    nameBn: 'খাবার স্যালাইন (ওআরএস)',
    category: 'Medicine',
    quantity: 82000,
    unit: 'Sachets',
    warehouseLocation: 'Cox\'s Bazar Base',
    status: 'In Stock',
    minimumThreshold: 15000
  },
  {
    id: 'RES-05',
    name: 'SOLAS Approved Adult Life Jackets',
    nameBn: 'জরুরি লাইফ জ্যাকেট',
    category: 'Rescue Equipment',
    quantity: 820,
    unit: 'Units',
    warehouseLocation: 'Barishal Port Warehouse',
    status: 'Low Stock',
    minimumThreshold: 1200
  },
  {
    id: 'RES-06',
    name: 'Heavy-Duty Motorized Inflatable Rescue Dinghies',
    nameBn: 'মোটরচালিত উদ্ধারকারী ইনফ্লেটেবল বোট',
    category: 'Rescue Equipment',
    quantity: 8,
    unit: 'Boats',
    warehouseLocation: 'Sunamganj Forward Post',
    status: 'Critical Shortage',
    minimumThreshold: 20
  },
  {
    id: 'RES-07',
    name: 'Emergency Waterproof Tarpaulin Family Tents',
    nameBn: 'জরুরি ত্রিপল ও পারিবারিক তাবু কিট',
    category: 'Shelter Kits',
    quantity: 3400,
    unit: 'Kits',
    warehouseLocation: 'Dhaka Central Disaster Depot',
    status: 'In Stock',
    minimumThreshold: 1500
  }
];

export const PREPAREDNESS_GUIDES: DisasterPreparednessGuide[] = [
  {
    id: 'GUIDE-CYC',
    disasterType: 'Cyclone',
    titleEn: 'Cyclone Safety & Preparedness (ঘূর্ণিঝড় প্রস্তুতি)',
    titleBn: 'ঘূর্ণিঝড় প্রস্তুতি ও জীবনরক্ষা নির্দেশিকা',
    before: [
      {
        en: 'Listen closely to BMD weather bulletins on radio, television, or dial 1090 toll-free.',
        bn: 'রেডিও, টেলিভিশনে নিয়মিত আবহাওয়া বুলেটিন শুনুন অথবা ১০৯০ নম্বরে বিনামূল্যে ডায়াল করুন।'
      },
      {
        en: 'Locate the nearest cyclone shelter, plan the safest evacuation path for children and livestock.',
        bn: 'নিকটতম বহুমুখী সাইক্লোন শেল্টারের অবস্থান জেনে রাখুন এবং শিশু ও গৃহপালিত পশুর নিরাপদ পথ নির্ধারণ করুন।'
      },
      {
        en: 'Reinforce rooftops, tie thatched structures securely, and prune brittle tree branches.',
        bn: 'ঘরের চাল মজবুত করে বাঁধুন এবং আশপাশের ঝুঁকিপূর্ণ গাছের ডালপালা ছাঁটাই করুন।'
      },
      {
        en: 'Pack national IDs, land deeds, and school certificates inside airtight waterproof plastic sleeves.',
        bn: 'জাতীয় পরিচয়পত্র, জমির দলিল ও গুরুত্বপূর্ণ কাগজপত্র পলিথিনে বায়ুরোধীভাবে মুড়িয়ে রাখুন।'
      }
    ],
    during: [
      {
        en: 'Immediately move to cyclone shelter upon Signal 7 or higher. Never delay.',
        bn: '৭ নম্বর বিপদ সংকেত বা তার বেশি হলে কালবিলম্ব না করে দ্রুত আশ্রয়কেন্দ্রে চলে যান।'
      },
      {
        en: 'Beware of the cyclone "Eye": a sudden calm does not mean the storm has passed; the second half will return with reversed wind directions.',
        bn: 'ঝড়ের "চোখ" বা সাময়িক শান্তাবস্থায় বিভ্রান্ত হবেন না; বাতাস বিপরীত দিক থেকে দ্বিগুণ শক্তিতে আবার আঘাত হানবে।'
      },
      {
        en: 'Switch off main gas valves and electricity meters to avert electrocution and post-storm fire.',
        bn: 'বৈদ্যুতিক মেইন সুইচ ও গ্যাস লাইন বন্ধ রাখুন।'
      }
    ],
    after: [
      {
        en: 'Do not touch fallen electrical cables or submerged transformers.',
        bn: 'ছিঁড়ে পড়া বৈদ্যুতিক তার বা পানির নিচে থাকা তার স্পর্শ করবেন না।'
      },
      {
        en: 'Boil all drinking water or use halogen water purification tablets to prevent waterborne cholera or diarrhea.',
        bn: 'পানি ভালো করে ফুটিয়ে অথবা পানি বিশুদ্ধকরণ ট্যাবলেট দিয়ে পান করুন।'
      },
      {
        en: 'Aid rescue teams by reporting trapped neighbors through RESQ SOS button.',
        bn: 'আটকে পড়া প্রতিবেশীদের খবর RESQ অ্যাপের এসওএস বোতাম দিয়ে উদ্ধারকারী দলকে জানান।'
      }
    ],
    emergencyKitList: [
      { en: 'Dry food (Chira, Muri, Molasses, High-energy biscuits) for 5 days', bn: '৫ দিনের শুকনো খাবার (চিঁড়া, মুড়ি, গুড়, বিস্কুট)' },
      { en: 'Bottled potable water & water purification tablets', bn: 'বিশুদ্ধ খাবার পানি ও হ্যালোজেন ট্যাবলেট' },
      { en: 'Battery-powered flashlight & spare batteries', bn: 'টর্চলাইট ও অতিরিক্ত ব্যাটারি' },
      { en: 'First Aid Kit: Antiseptic, bandages, ORS, paracetamol', bn: 'প্রাথমিক চিকিৎসা কিট: স্যাভলন, ব্যান্ডেজ, ওআরএস, প্যারাসিটামল' },
      { en: 'Portable power bank fully charged for emergency phone call', bn: 'ফুল চার্জ করা পাওয়ার ব্যাংক' }
    ]
  },
  {
    id: 'GUIDE-FLD',
    disasterType: 'Flood',
    titleEn: 'Flood & Flash Flood Survival (বন্যা ও আকস্মিক ঢল)',
    titleBn: 'বন্যা ও পাহাড়ি ঢল থেকে বাঁচার নির্দেশিকা',
    before: [
      {
        en: 'Monitor FFWC river gauge levels. Elevate food grain, seeds, and portable stoves above high-water mark.',
        bn: 'বন্যা পূর্বাভাস সতর্কীকরণ কেন্দ্রের তথ্য খেয়াল রাখুন। খাদ্যশস্য ও চুলা পানির লেভেলের ওপরে রাখুন।'
      },
      {
        en: 'Prepare an emergency raft using banana plant stems, bamboo, or sealed plastic drums.',
        bn: 'কলাগাছ, বাঁশ বা খালি ড্রাম দিয়ে জরুরি ভেল তৈরি করে রাখুন।'
      }
    ],
    during: [
      {
        en: 'Never attempt to walk, swim, or drive through fast-moving flood waters. Six inches of rapid water can knock an adult down.',
        bn: 'তীব্র স্রোতের পানিতে হাঁটা বা সাঁতার কাটার চেষ্টা করবেন না। মাত্র ৬ ইঞ্চি দ্রুতগতির পানি প্রাপ্তবয়স্ক মানুষকে ভাসিয়ে নিতে পারে।'
      },
      {
        en: 'Guard against snakebites in flooded areas; keep carbolic acid or stick ready in temporary shelters.',
        bn: 'বন্যার পানিতে সাপের উপদ্রব থেকে সতর্ক থাকুন এবং লাঠি বা কার্বলিক অ্যাসিড কাছে রাখুন।'
      }
    ],
    after: [
      {
        en: 'Disinfect household tube-wells using bleaching powder before consuming groundwater.',
        bn: 'বন্যা শেষে টিউবওয়েলের পানি ব্যবহারের আগে ব্লিচিং পাউডার দিয়ে জীবাণুমুক্ত করুন।'
      },
      {
        en: 'Inspect house foundation poles before moving back inside.',
        bn: 'ঘরে ওঠার আগে ভিটে ও খুঁটির স্থায়িত্ব পরীক্ষা করে নিন।'
      }
    ],
    emergencyKitList: [
      { en: 'Oral Rehydration Salts (ORS) packets (minimum 20 packets)', bn: 'কমপক্ষে ২০ প্যাকেট ওআরএস খাবার স্যালাইন' },
      { en: 'Bleaching powder & chlorine purification drops', bn: 'ব্লিচিং পাউডার ও ক্লোরিন ড্রপস' },
      { en: 'Waterproof matchbox and candles', bn: 'প্লাস্টিক ব্যাগে মোড়ানো ম্যাচ ও মোমবাতি' },
      { en: 'Whistle for attracting rescue boats in dark or fog', bn: 'উদ্ধারকারী দলের দৃষ্টি আকর্ষণে বাঁশি (হুইসেল)' }
    ]
  },
  {
    id: 'GUIDE-FIR',
    disasterType: 'Fire',
    titleEn: 'Urban Fire Safety & Escape (অগ্নিকাণ্ড প্রতিরোধ ও উদ্ধার)',
    titleBn: 'শহুরে অগ্নিকাণ্ড ও জরুরি উদ্ধার নির্দেশিকা',
    before: [
      {
        en: 'Identify two separate escape staircases in your residential or office building.',
        bn: 'বাসা বা অফিসে অন্তত দুটি পৃথক জরুরি নির্গমন সিঁড়ি চিহ্নিত করে রাখুন।'
      },
      {
        en: 'Never store gas cylinders in unventilated narrow passages or near electrical panels.',
        bn: 'বায়ু চলাচলহীন স্থানে বা বৈদ্যুতিক তারের পাশে এলপিজি গ্যাস সিলিন্ডার রাখবেন না।'
      }
    ],
    during: [
      {
        en: 'Drop to your hands and knees and crawl low under smoke. Smoke and toxic gases rise.',
        bn: 'ধোঁয়া থাকলে উপুড় হয়ে হামাগুড়ি দিয়ে বের হন; বিষাক্ত ধোঁয়া ওপরে থাকে।'
      },
      {
        en: 'Feel door panels and metal knobs with the back of your hand before turning; if hot, do not open.',
        bn: 'দরজা খোলার আগে হাতের উল্টো পিঠ দিয়ে দরজার হাতল ছুঁয়ে তাপ পরীক্ষা করুন।'
      },
      {
        en: 'NEVER use elevators or lifts during a fire alarm. Always take fire exit stairs.',
        bn: 'অগ্নিসংকেতের সময় কখনো লিফট ব্যবহার করবেন না। সিঁড়ি দিয়ে নামুন।'
      }
    ],
    after: [
      {
        en: 'Cool burns under clean running tap water for 20 minutes. Do not apply toothpaste or grease.',
        bn: 'পোড়া স্থানে ২০ মিনিট ধরে স্বাভাবিক কলের পানি ঢালুন। টুথপেস্ট বা ডিম লাগাবেন না।'
      },
      {
        en: 'Dial 999 or FSCD headquarters immediately for trapped victim extraction.',
        bn: 'আটকে পড়া মানুষদের উদ্ধার করতে তাৎক্ষণিক ৯৯৯ অথবা ফায়ার সার্ভিসকে ফোন দিন।'
      }
    ],
    emergencyKitList: [
      { en: 'ABC dry powder fire extinguisher (1-2 kg for home)', bn: 'বাসার জন্য এবিসি ড্রাই পাউডার ফায়ার এক্সটিংগুইশার' },
      { en: 'Smoke escape mask or wet cotton towels', bn: 'স্মোক মাস্ক অথবা সুতি গামছা' },
      { en: 'Heavy-duty cotton rope for emergency lowering', bn: 'জরুরি অবতরণের জন্য মজবুত সুতি দড়ি' }
    ]
  },
  {
    id: 'GUIDE-EQK',
    disasterType: 'Earthquake',
    titleEn: 'Earthquake Safety: Drop, Cover, Hold On (ভূমিকম্প প্রস্তুতি)',
    titleBn: 'ভূমিকম্পে জীবনরক্ষাকারী পদক্ষেপ: ড্রপ, কভার, হোল্ড অন',
    before: [
      {
        en: 'Anchor heavy book cabinets, ceiling fans, and water heaters firmly to walls.',
        bn: 'ভারী আলমারি, বুকশেলফ ও ওয়াটার হিটার দেয়ালের সাথে শক্ত করে আটকে রাখুন।'
      }
    ],
    during: [
      {
        en: 'DROP to the floor, take COVER under a sturdy table or desk, and HOLD ON until tremors stop.',
        bn: 'মাটিতে বসে পড়ুন (DROP), শক্ত টেবিল বা খাটের নিচে আশ্রয় নিন (COVER), এবং শক্ত করে ধরে রাখুন (HOLD ON)।'
      },
      {
        en: 'Stay away from exterior glass windows, mirrors, and hanging light fixtures.',
        bn: 'কাঁচের জানালা, আয়না ও ঝুলন্ত ফ্যান থেকে দূরে থাকুন।'
      },
      {
        en: 'If outdoors, move to an open field away from high-rise buildings and electric lines.',
        bn: 'খোলা রাস্তায় থাকলে বহুতল ভবন ও বৈদ্যুতিক তার থেকে দূরে খোলা জায়গায় যান।'
      }
    ],
    after: [
      {
        en: 'Expect aftershocks. Carefully evacuate the building once primary tremor stops.',
        bn: 'আফটারশক বা পরবর্তী মৃদু কম্পনের জন্য প্রস্তুত থাকুন। কম্পন থামলে ধীরে সিঁড়ি দিয়ে নামুন।'
      },
      {
        en: 'Do not strike matchsticks or turn on electrical switches in case of gas line rupture.',
        bn: 'গ্যাস লাইন ফেটে যাওয়ার ঝুঁকি থাকায় দিয়াশলাই জ্বালাবেন না বা সুইচে হাত দেবেন না।'
      }
    ],
    emergencyKitList: [
      { en: 'Hard helmet or thick book for head protection', bn: 'মাথা বাঁচানোর হেলমেট বা শক্ত বই' },
      { en: 'High decibel emergency whistle', bn: 'ধ্বংসস্তূপে আটকালে দৃষ্টি আকর্ষণ করার উচ্চশব্দের বাঁশি' },
      { en: 'Multi-tool knife and work gloves', bn: 'মাল্টিটুল ছুরি ও ভারী কাজের গ্লাভস' }
    ]
  }
];
