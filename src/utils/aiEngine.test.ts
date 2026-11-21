import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEmergencyCategory, generateAiAssessment } from './aiEngine';

test('classifyEmergencyCategory detects flood in English and Bengali', () => {
  const enResult = classifyEmergencyCategory('Flash flood waters rising quickly in Tahirpur');
  assert.equal(enResult.category, 'Flood');
  assert.ok(enResult.confidence > 0.8);

  const bnResult = classifyEmergencyCategory('হাওরে পানির উচ্চতা বেড়ে বাড়িঘর ডুবে গেছে');
  assert.equal(bnResult.category, 'Flood');
  assert.ok(bnResult.confidence > 0.8);
});

test('classifyEmergencyCategory detects cyclone and fire accurately', () => {
  const cycResult = classifyEmergencyCategory('ঘূর্ণিঝড়ে উপকূলীয় এলাকায় তীব্র ঝড়ো বাতাস ও জলোচ্ছ্বাস');
  assert.equal(cycResult.category, 'Cyclone');

  const fireResult = classifyEmergencyCategory('Chemical warehouse fire with high smoke and flames');
  assert.equal(fireResult.category, 'Fire');
});

test('generateAiAssessment produces higher severity score for trapped victims and large casualty count', () => {
  const mildReport = generateAiAssessment({
    title: 'Water puddling on secondary road',
    description: 'Minor water stagnation',
    affectedPeople: 2,
    hasInjured: false,
    hasTrapped: false
  });

  const severeReport = generateAiAssessment({
    title: 'Massive factory fire with trapped workers',
    description: 'Flames blocking stairwells, workers on rooftop',
    affectedPeople: 80,
    hasInjured: true,
    hasTrapped: true
  });

  assert.ok(
    severeReport.severityScore > mildReport.severityScore,
    `Severe score (${severeReport.severityScore}) must exceed mild score (${mildReport.severityScore})`
  );
  assert.equal(severeReport.severityLevel, 'Critical');
  assert.ok(severeReport.rationale.length >= 3);
});
