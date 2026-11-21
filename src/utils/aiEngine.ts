import { AIAssessment, EmergencyCategory, EmergencySeverity } from '../types';

interface ClassifyInput {
  title: string;
  description: string;
  affectedPeople?: number;
  hasInjured?: boolean;
  hasTrapped?: boolean;
}

/**
 * Classifies disaster text into standard EmergencyCategory
 * Supports both Bengali and English keywords.
 */
export function classifyEmergencyCategory(text: string): {
  category: EmergencyCategory;
  confidence: number;
} {
  const lower = text.toLowerCase();

  // Flood / Water
  if (
    lower.includes('flood') ||
    lower.includes('water') ||
    lower.includes('inundat') ||
    lower.includes('submerg') ||
    lower.includes('বন্যা') ||
    lower.includes('প্লাবন') ||
    lower.includes('পানি বৃদ্ধি') ||
    lower.includes('হাওর')
  ) {
    return { category: 'Flood', confidence: 0.94 };
  }

  // Cyclone / Storm
  if (
    lower.includes('cyclone') ||
    lower.includes('storm') ||
    lower.includes('wind') ||
    lower.includes('surge') ||
    lower.includes('ঘূর্ণিঝড়') ||
    lower.includes('তুফান') ||
    lower.includes('সাইক্লোন') ||
    lower.includes('জলোচ্ছ্বাস')
  ) {
    return { category: 'Cyclone', confidence: 0.95 };
  }

  // Fire / Smoke
  if (
    lower.includes('fire') ||
    lower.includes('flame') ||
    lower.includes('smoke') ||
    lower.includes('burn') ||
    lower.includes('আগুন') ||
    lower.includes('অগ্নিকাণ্ড') ||
    lower.includes('ধোঁয়া')
  ) {
    return { category: 'Fire', confidence: 0.96 };
  }

  // Landslide / Mudslide
  if (
    lower.includes('landslide') ||
    lower.includes('mudslide') ||
    lower.includes('hill') ||
    lower.includes('পাহাড় ধস') ||
    lower.includes('মাটি ধস')
  ) {
    return { category: 'Landslide', confidence: 0.91 };
  }

  // Building Collapse
  if (
    lower.includes('collapse') ||
    lower.includes('rubble') ||
    lower.includes('building fall') ||
    lower.includes('ভবন ধস') ||
    lower.includes('ধ্বংসস্তূপ')
  ) {
    return { category: 'Building Collapse', confidence: 0.92 };
  }

  // Earthquake
  if (
    lower.includes('earthquake') ||
    lower.includes('tremor') ||
    lower.includes('quake') ||
    lower.includes('ভূমিকম্প') ||
    lower.includes('কম্পন')
  ) {
    return { category: 'Earthquake', confidence: 0.93 };
  }

  // Drowning
  if (
    lower.includes('drown') ||
    lower.includes('boat capsize') ||
    lower.includes('নৌকা ডুবি') ||
    lower.includes('ডুবে যাওয়া')
  ) {
    return { category: 'Drowning', confidence: 0.9 };
  }

  // Medical Emergency
  if (
    lower.includes('medical') ||
    lower.includes('cardiac') ||
    lower.includes('ambulance') ||
    lower.includes('চিকিৎসা') ||
    lower.includes('হার্ট অ্যাটাক') ||
    lower.includes('অসুস্থ')
  ) {
    return { category: 'Medical Emergency', confidence: 0.88 };
  }

  return { category: 'Other Emergency', confidence: 0.7 };
}

/**
 * Generates an Explainable AI assessment for an incident.
 * Evaluates human life risk, entrapment, injured counts, and category factors.
 */
export function generateAiAssessment(input: ClassifyInput): AIAssessment {
  const combinedText = `${input.title} ${input.description}`;
  const classification = classifyEmergencyCategory(combinedText);

  let score = 4.0; // Base score
  const rationale: string[] = [];

  // Category weights
  if (classification.category === 'Fire') {
    score += 2.0;
    rationale.push('Rapid flame and toxic smoke spread threat in dense settlements (+2.0)');
  } else if (classification.category === 'Building Collapse') {
    score += 2.5;
    rationale.push('High crush and structural asphyxiation hazard (+2.5)');
  } else if (classification.category === 'Flood') {
    score += 1.5;
    rationale.push('Water current and isolation risk (+1.5)');
  } else if (classification.category === 'Cyclone') {
    score += 1.8;
    rationale.push('Extreme wind and tidal surge hazard (+1.8)');
  }

  // Trapped factor
  if (input.hasTrapped) {
    score += 2.2;
    rationale.push('Active trapped victims requiring urgent physical extraction (+2.2)');
  }

  // Injured factor
  if (input.hasInjured) {
    score += 1.6;
    rationale.push('Immediate casualties needing medical stabilization & ambulance dispatch (+1.6)');
  }

  // Affected count factor
  const affected = input.affectedPeople || 0;
  if (affected > 50) {
    score += 2.0;
    rationale.push(`Mass casualty incident scale: >50 individuals impacted (+2.0)`);
  } else if (affected > 15) {
    score += 1.2;
    rationale.push(`Significant population affected: >15 individuals impacted (+1.2)`);
  } else if (affected > 0) {
    score += 0.5;
    rationale.push(`${affected} individuals reported at location (+0.5)`);
  }

  // Cap between 1.0 and 10.0
  const finalScore = Math.min(10.0, Math.max(1.0, Math.round(score * 10) / 10));

  let severityLevel: EmergencySeverity = 'Low';
  if (finalScore >= 8.5) {
    severityLevel = 'Critical';
  } else if (finalScore >= 6.5) {
    severityLevel = 'High';
  } else if (finalScore >= 4.0) {
    severityLevel = 'Medium';
  }

  return {
    suggestedCategory: classification.category,
    severityScore: finalScore,
    severityLevel,
    confidence: classification.confidence,
    rationale,
    isLikelyDuplicate: false,
    damageScore: Math.min(10, Math.round((finalScore * 0.95) * 10) / 10)
  };
}

/**
 * Image-based damage assessment analyzer
 * Simulates computer-vision damage classification from image metadata or content.
 */
export function analyzeImageDamage(imageFilenameOrUrl: string, category: EmergencyCategory) {
  const isSevere = imageFilenameOrUrl.length % 2 === 0;

  const tagPool = {
    Flood: ['High Water Inundation', 'Road Cutoff', 'Embankment Erosion', 'Submerged Ground Floor'],
    Cyclone: ['Severe Roof Damage', 'Tree Debris Obstruction', 'Tin Sheet Hazards', 'Polder Breach'],
    Fire: ['Structural Charring', 'Heavy Carbon Soot', 'Thermal Wall Weakening', 'Toxic Smoke Column'],
    Earthquake: ['Diagonal Shear Cracks', 'Masonry Spalling', 'Pancake Slab Hazard', 'Foundation Shift'],
    Landslide: ['Mud Debris Inflow', 'Carriageway Blockade', 'Retaining Wall Collapse']
  };

  const selectedTags = (tagPool[category as keyof typeof tagPool] || ['Physical Damage', 'Structural Stress']).slice(
    0,
    isSevere ? 3 : 2
  );

  return {
    damageScore: isSevere ? 8.6 : 6.2,
    integrityStatus: isSevere ? 'Critically Compromised' : 'Moderate Superficial Damage',
    confidence: 0.91,
    detectedHazards: selectedTags,
    recommendation: isSevere
      ? 'Immediate cordoning and structural engineer inspection required. Evacuate all occupants.'
      : 'Maintain safe distance from outer masonry. Safe for emergency worker entry with PPE.'
  };
}

/**
 * AI Emergency Assistant response generator
 * Provides immediate safety advice in English and Bengali based on disaster type.
 */
export function getAiSafetyGuidance(query: string, language: 'en' | 'bn'): string {
  const q = query.toLowerCase();

  if (q.includes('flood') || q.includes('পানি') || q.includes('বন্যা')) {
    return language === 'bn'
      ? 'বন্যা পরিস্থিতিতে তাৎক্ষণিক পদক্ষেপ: ১. বিদ্যুৎ মেইন সুইচ বন্ধ করুন। ২. পানীয় জলের টিউবওয়েল উঁচু করুন বা ক্লোরিন ট্যাবলেট দিয়ে পানি বিশুদ্ধ করে পান করুন। ৩. খাবার স্যালাইন (ORS) ও শুকনো খাবার সঙ্গে রাখুন। ৪. বন্যার তীব্র স্রোতে কখনো হেঁটে বা সাঁতরে পার হবেন না।'
      : 'Immediate flood safety measures: 1. Disconnect main electrical breakers. 2. Boil drinking water or use halogen chlorine tablets. 3. Keep oral rehydration salts (ORS) and dry rations handy. 4. Never attempt to wade or drive across swift-moving flood currents.';
  }

  if (q.includes('cyclone') || q.includes('ঝড়') || q.includes('সাইক্লোন')) {
    return language === 'bn'
      ? 'ঘূর্ণিঝড় সতর্কতা নির্দেশিকা: ১. ১০৯০ নম্বরে ডায়াল করে ঘূর্ণিঝড়ের সর্বশেষ সংকেত জানুন। ২. ৭ বা তার বেশি বিপদ সংকেত এলে নিকটবর্তী সাইক্লোন শেল্টারে আশ্রয় নিন। ৩. প্রয়োজনীয় দলিল ও মূল্যবান জিনিস বায়ুরোধী পলিথিনে বাঁধুন। ৪. ঝড়ের চোখ চলাকালে বাইরে বের হবেন না।'
      : 'Cyclone warning guidelines: 1. Dial 1090 for hourly meteorological alerts. 2. Relocate to the designated multi-purpose cyclone shelter if Danger Signal 7 or higher is hoisted. 3. Pack vital documents in airtight waterproof bags. 4. Do not venture outside during the temporary calm of the storm eye.';
  }

  if (q.includes('fire') || q.includes('আগুন')) {
    return language === 'bn'
      ? 'অগ্নিকাণ্ড জরুরি সতর্কতা: ১. ধোঁয়া থাকলে নিচু হয়ে হামাগুড়ি দিয়ে দ্রুত বের হন। ২. কখনো লিফট বা এলিভেটর ব্যবহার করবেন না। ৩. পোড়া জায়গায় ২০ মিনিট পরিষ্কার স্বাভাবিক পানি ঢালুন। ৪. অবিলম্বে ৯৯৯ অথবা ফায়ার সার্ভিসকে কল দিন।'
      : 'Fire emergency safety: 1. Crawl low beneath toxic rising smoke. 2. Never use elevators during a fire evacuation. 3. Cool burn wounds under clean running water for 20 minutes. 4. Immediately dial 999 or Fire Service & Civil Defence.';
  }

  if (q.includes('earthquake') || q.includes('ভূমিকম্প')) {
    return language === 'bn'
      ? 'ভূমিকম্পে জীবনরক্ষাকারী ৩ নিয়ম: ১. DROP: মাটিতে বসে পড়ুন। ২. COVER: শক্ত টেবিল বা খাটের নিচে আশ্রয় নিন। ৩. HOLD ON: শক্ত করে ধরে রাখুন যতক্ষণ না কম্পন থামে। কাঁচের জানালা ও ঝুলন্ত আসবাব থেকে দূরে থাকুন।'
      : 'Earthquake survival rule (Drop, Cover, Hold On): 1. DROP to your hands and knees. 2. Take COVER under a sturdy table or desk. 3. HOLD ON until shaking stops. Stay away from windows, heavy mirrors, and overhead fixtures.';
  }

  return language === 'bn'
    ? 'RESQ বাংলাদেশ এআই সহায়িকা: যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে জাতীয় জরুরি সেবা ৯৯৯ নম্বরে অথবা দুর্যোগ সতর্কবার্তা ১০৯০ নম্বরে বিনামূল্যে কল করুন। আপনার অবস্থান থেকে নিকটবর্তী আশ্রয়কেন্দ্র বা হাসপাতাল জানতে লাইভ ম্যাপ দেখুন।'
    : 'RESQ Bangladesh AI Assistant: For any life-threatening emergency, dial National Emergency 999 or Disaster Early Warning 1090 toll-free. Check the Live GIS Map to locate your nearest safe shelter and emergency medical center.';
}
