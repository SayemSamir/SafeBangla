import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendRescueTeams, canTransitionStatus } from './dispatch';
import { INITIAL_INCIDENTS, INITIAL_RESCUE_TEAMS } from '../data/bangladeshData';

test('recommendRescueTeams ranks available, skill-matched, nearby teams ahead of busy teams', () => {
  const landslideIncident = INITIAL_INCIDENTS.find((i) => i.category === 'Landslide')!;
  const ranked = recommendRescueTeams(landslideIncident, INITIAL_RESCUE_TEAMS);

  assert.ok(ranked.length > 0);
  assert.equal(ranked[0].team.available, true);
  assert.equal(ranked[0].team.id, 'TEAM-CG-04');
  assert.equal(ranked[0].skillMatch, true);
  assert.ok(typeof ranked[0].distanceKm === 'number');
});

test('canTransitionStatus enforces authorization and valid lifecycle transitions', () => {
  // Citizen cannot verify or assign
  assert.equal(canTransitionStatus('PENDING', 'VERIFIED', 'citizen').allowed, false);
  // Operator can verify
  assert.equal(canTransitionStatus('PENDING', 'VERIFIED', 'operator').allowed, true);
  // Cannot jump directly from PENDING to RESOLVED
  assert.equal(canTransitionStatus('PENDING', 'RESOLVED', 'super_admin').allowed, false);
  // Rescue team can accept an ASSIGNED mission and complete IN_PROGRESS
  assert.equal(canTransitionStatus('ASSIGNED', 'ACCEPTED', 'rescue_team').allowed, true);
  assert.equal(canTransitionStatus('ACCEPTED', 'IN_PROGRESS', 'rescue_team').allowed, true);
  assert.equal(canTransitionStatus('IN_PROGRESS', 'RESOLVED', 'rescue_team').allowed, true);
});
