import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmergencyRecord,
  verifyIncidentRecord,
  assignIncidentTeam,
  transitionIncidentStatus,
  updateEmergencyDetails,
  updateEmergencyLiveLocation
} from './store.ts';

test('Guest One-Tap SOS lifecycle works end-to-end without description or GPS', async () => {
  // 1. Guest creates SOS with minimal info (no description, no GPS)
  const created = await createEmergencyRecord({
    category: 'Flood',
    landmark: 'Sylhet Sadar Bridge North',
    isAnonymous: true
  });

  assert.ok(created.incident.id.startsWith('RESQ-2026-'));
  assert.equal(created.trackingCode.length, 6);
  assert.equal(created.incident.status, 'PENDING');
  assert.equal(created.incident.location.locationSource, 'landmark');
  assert.ok(created.deliveryLogs.some((d) => d.channel === 'in_app' && d.status === 'delivered'));
  assert.ok(created.deliveryLogs.some((d) => d.channel === 'sms' && d.status === 'not_configured'));

  // 2. Guest adds optional details using trackingCode
  const updated = await updateEmergencyDetails(
    created.incident.id,
    { trackingCode: created.trackingCode },
    { affectedPeople: 4, hasTrapped: true, specialNeeds: 'Drinking water' }
  );
  assert.equal(updated.affectedPeople, 4);
  assert.equal(updated.hasTrapped, true);

  // 3. Wrong tracking code is rejected
  await assert.rejects(
    () =>
      updateEmergencyDetails(
        created.incident.id,
        { trackingCode: 'WRONG1' },
        { affectedPeople: 10 }
      ),
    /FORBIDDEN/
  );

  // 4. Live GPS tracking update
  const tracked = await updateEmergencyLiveLocation(
    created.incident.id,
    { trackingCode: created.trackingCode },
    { lat: 24.8949, lng: 91.8687, accuracyMeters: 18, isLiveTracking: true }
  );
  assert.equal(tracked.location.locationSource, 'gps');
  assert.equal(tracked.location.accuracyMeters, 18);

  // 5. Operator verifies and assigns team
  const verified = await verifyIncidentRecord(created.incident.id, 'Operator Test', 'operator');
  assert.equal(verified.status, 'VERIFIED');

  const assigned = await assignIncidentTeam(
    created.incident.id,
    'TEAM-VOL-05',
    'operator',
    'Operator Test'
  );
  assert.equal(assigned.incident.status, 'ASSIGNED');
  assert.equal(assigned.team.available, false);

  // 6. Responder accepts, progresses, and resolves
  const accepted = await transitionIncidentStatus(
    created.incident.id,
    'ACCEPTED',
    'rescue_team',
    'Team en route'
  );
  assert.equal(accepted.status, 'ACCEPTED');

  const inProgress = await transitionIncidentStatus(
    created.incident.id,
    'IN_PROGRESS',
    'rescue_team',
    'Arrived on scene'
  );
  assert.equal(inProgress.status, 'IN_PROGRESS');

  const resolved = await transitionIncidentStatus(
    created.incident.id,
    'RESOLVED',
    'rescue_team',
    'Evacuated safely'
  );
  assert.equal(resolved.status, 'RESOLVED');
  assert.equal(resolved.isLiveTracking, false);
});

test('Delayed GPS updates existing LOCATION_PENDING SOS without creating duplicates and keeps real dataSource', async () => {
  const pending = await createEmergencyRecord({
    category: 'Medical Emergency',
    isAnonymous: true
  });

  assert.equal(pending.incident.isDemo, false);
  assert.equal(pending.incident.dataSource, 'real');
  assert.equal(pending.incident.location.locationSource, 'unlocated');
  assert.equal(pending.incident.location.locationStatus, 'LOCATION_PENDING');
  assert.equal(pending.incident.location.lat, null);

  // Asynchronous Stage-B GPS fix arrives later on same ID (with isLiveTracking=false)
  const refined = await updateEmergencyLiveLocation(
    pending.incident.id,
    { trackingCode: pending.trackingCode },
    {
      lat: 22.3569,
      lng: 91.7832,
      accuracyMeters: 16,
      locationSource: 'gps',
      formattedAddress: 'GEC Circle, Chattogram',
      isLiveTracking: false
    }
  );

  assert.equal(refined.id, pending.incident.id);
  assert.equal(refined.location.locationSource, 'gps');
  assert.equal(refined.location.locationStatus, 'GPS_RECEIVED');
  assert.equal(refined.location.accuracyMeters, 16);
  assert.equal(refined.location.district, 'Chattogram');

  // Switching to manual map pin clears GPS accuracyMeters so manual pin is never confused with GPS ring
  const manual = await updateEmergencyDetails(
    pending.incident.id,
    { trackingCode: pending.trackingCode },
    { lat: 22.361, lng: 91.791, locationSource: 'map_manual' }
  );
  assert.equal(manual.location.locationSource, 'map_manual');
  assert.equal(manual.location.locationStatus, 'MANUAL_PIN');
  assert.equal(manual.location.accuracyMeters, undefined);
});

test('Shared location, manual address, and nearby landmark reference preserve victim GPS integrity', async () => {
  // 1. Shared Google Maps / OSM link source stays shared_location with no GPS accuracy ring
  const shared = await createEmergencyRecord({
    category: 'Road Accident',
    lat: 22.3256,
    lng: 91.8123,
    accuracyMeters: 99,
    locationSource: 'shared_location',
    formattedAddress: 'Agrabad Access Road, Chattogram',
    structuredAddress: {
      road: 'Agrabad Access Road',
      neighborhood: 'Agrabad',
      district: 'Chattogram'
    }
  });
  assert.equal(shared.incident.location.locationSource, 'shared_location');
  assert.equal(shared.incident.location.accuracyMeters, undefined);
  assert.equal(shared.incident.location.structuredAddress?.neighborhood, 'Agrabad');

  // Background Stage-B GPS must NOT silently overwrite a shared_location record
  const afterGpsAttempt = await updateEmergencyLiveLocation(
    shared.incident.id,
    { trackingCode: shared.trackingCode },
    { lat: 22.4, lng: 91.9, accuracyMeters: 12, locationSource: 'gps', isLiveTracking: false }
  );
  assert.equal(afterGpsAttempt.location.locationSource, 'shared_location');
  assert.equal(afterGpsAttempt.location.lat, 22.3256);

  // 2. GPS emergency attaching nearby landmark reference preserves actual victim GPS coordinates
  const gpsWithNearby = await createEmergencyRecord({
    category: 'Medical Emergency',
    lat: 22.3592,
    lng: 91.8305,
    accuracyMeters: 14,
    locationSource: 'gps',
    nearbyLandmarkName: 'Chittagong Medical College Hospital',
    nearbyLandmarkCategory: 'Hospital',
    nearbyLandmarkDistanceMeters: 210
  });
  assert.equal(gpsWithNearby.incident.location.locationSource, 'gps');
  assert.equal(gpsWithNearby.incident.location.lat, 22.3592);
  assert.equal(gpsWithNearby.incident.location.lng, 91.8305);
  assert.equal(gpsWithNearby.incident.location.accuracyMeters, 14);
  assert.equal(
    gpsWithNearby.incident.location.nearbyLandmarkName,
    'Chittagong Medical College Hospital'
  );
  assert.equal(gpsWithNearby.incident.location.nearbyLandmarkDistanceMeters, 210);

  // 3. Landmark starting with "Near" avoids duplicate "near Near" in title
  const nearPrefixed = await createEmergencyRecord({
    category: 'Flood',
    landmark: 'Near Pahartali Railway Gate',
    isAnonymous: true
  });
  assert.equal(nearPrefixed.incident.title, 'Flood SOS Near Pahartali Railway Gate');
});

