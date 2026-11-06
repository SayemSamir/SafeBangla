import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance, findNearestShelter, findPotentialDuplicates } from './geo';
import { CycloneShelter, IncidentReport } from '../types';

test('calculateHaversineDistance returns 0 for identical coordinates', () => {
  const dist = calculateHaversineDistance(23.8103, 90.4125, 23.8103, 90.4125);
  assert.equal(dist, 0);
});

test('calculateHaversineDistance calculates realistic distance between Dhaka and Chattogram', () => {
  // Dhaka (23.8103, 90.4125) to Chattogram (22.3569, 91.7832) is ~215 km
  const dist = calculateHaversineDistance(23.8103, 90.4125, 22.3569, 91.7832);
  assert.ok(dist > 200 && dist < 240, `Expected ~215km, got ${dist}`);
});

test('findNearestShelter correctly selects the geographically closest shelter', () => {
  const shelters: CycloneShelter[] = [
    {
      id: 'SHELTER-A',
      name: 'Far Shelter',
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'Kotwali',
      capacity: 500,
      currentOccupancy: 100,
      hasDrinkingWater: true,
      hasElectricityOrSolar: true,
      hasMedicalPost: false,
      hasFemaleSafeSpace: true,
      contactNumber: '01800000000',
      lat: 22.35,
      lng: 91.80
    },
    {
      id: 'SHELTER-B',
      name: 'Near Shelter',
      division: 'Chattogram',
      district: 'Cox\'s Bazar',
      upazila: 'Teknaf',
      capacity: 1000,
      currentOccupancy: 400,
      hasDrinkingWater: true,
      hasElectricityOrSolar: true,
      hasMedicalPost: true,
      hasFemaleSafeSpace: true,
      contactNumber: '01811111111',
      lat: 20.87,
      lng: 92.30
    }
  ];

  const result = findNearestShelter(20.865, 92.298, shelters);
  assert.ok(result !== null);
  assert.equal(result?.shelter.id, 'SHELTER-B');
  assert.ok(result.distanceKm < 5, `Expected <5km, got ${result.distanceKm}`);
});

test('findPotentialDuplicates identifies reports within 1.5km of same category', () => {
  const existingIncidents: IncidentReport[] = [
    {
      id: 'RESQ-EXISTING-1',
      timestamp: '2026-11-05T10:00:00Z',
      category: 'Flood',
      title: 'Water rising',
      description: 'Streets flooded',
      location: {
        lat: 25.088,
        lng: 91.189,
        division: 'Sylhet',
        district: 'Sunamganj',
        upazila: 'Tahirpur'
      },
      status: 'VERIFIED',
      severity: 'High',
      affectedPeople: 10,
      hasInjured: false,
      hasTrapped: false,
      isAnonymous: false,
      media: [],
      updates: []
    }
  ];

  // Nearby flood (~0.1 km away)
  const dupes = findPotentialDuplicates(25.0885, 91.1892, 'Flood', existingIncidents, 1.5);
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].id, 'RESQ-EXISTING-1');

  // Different category at same location should NOT be duplicate
  const diffCategory = findPotentialDuplicates(25.0885, 91.1892, 'Fire', existingIncidents, 1.5);
  assert.equal(diffCategory.length, 0);

  // Far location (>50 km away) should NOT be duplicate
  const farAway = findPotentialDuplicates(24.5, 90.5, 'Flood', existingIncidents, 1.5);
  assert.equal(farAway.length, 0);
});
