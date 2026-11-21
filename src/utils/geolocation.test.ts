import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidCoordinatePair,
  isWithinBangladeshBounds,
  isCoordinateFresh,
  resolveLocationStatus,
  shouldReplaceGpsFix,
  classifyGpsAccuracy,
  mapGeolocationError,
  GPS_FALLBACK_GUIDANCE_EN,
  buildExternalMapLinks,
  formatLocationStatusLabel,
  formatLocationSourceLabel,
  parseSharedLocationUrl,
  buildBangladeshQueryVariants
} from './geolocation';

test('isValidCoordinatePair rejects null island, NaN, and out-of-range coordinates', () => {
  assert.equal(isValidCoordinatePair(0, 0), false);
  assert.equal(isValidCoordinatePair(NaN, 90.4), false);
  assert.equal(isValidCoordinatePair(95, 90.4), false);
  assert.equal(isValidCoordinatePair(23.8103, 90.4125), true);
});

test('isWithinBangladeshBounds accurately identifies Dhaka vs outside coordinates', () => {
  assert.equal(isWithinBangladeshBounds(23.8103, 90.4125), true);
  assert.equal(isWithinBangladeshBounds(51.5074, -0.1278), false);
});

test('isCoordinateFresh enforces max age freshness threshold', () => {
  const now = 1_700_000_000_000;
  assert.equal(isCoordinateFresh(now - 30_000, now, 120_000), true);
  assert.equal(isCoordinateFresh(now - 180_000, now, 120_000), false);
  assert.equal(isCoordinateFresh(0, now, 120_000), false);
});

test('resolveLocationStatus accurately distinguishes GPS, Manual Pin, Shared Location, Landmark, and Pending', () => {
  assert.equal(resolveLocationStatus(23.81, 90.41, 'gps'), 'GPS_RECEIVED');
  assert.equal(resolveLocationStatus(23.81, 90.41, 'map_manual'), 'MANUAL_PIN');
  assert.equal(resolveLocationStatus(23.81, 90.41, 'address_manual'), 'MANUAL_PIN');
  assert.equal(resolveLocationStatus(23.81, 90.41, 'shared_location'), 'MANUAL_PIN');
  assert.equal(resolveLocationStatus(null, null, 'landmark', 'Near Mirpur 10'), 'LANDMARK_ONLY');
  assert.equal(resolveLocationStatus(null, null, 'unlocated'), 'LOCATION_PENDING');
  assert.equal(formatLocationStatusLabel('LOCATION_PENDING', 'unlocated'), 'Location Pending');
  assert.ok(formatLocationSourceLabel('shared_location').includes('SHARED_LOCATION'));
});

test('shouldReplaceGpsFix preserves manual pins, addresses, and shared locations while replacing coarse Stage A GPS', () => {
  for (const protectedSource of ['map_manual', 'address_manual', 'shared_location'] as const) {
    assert.equal(
      shouldReplaceGpsFix(
        { lat: 23.81, lng: 90.41, accuracyMeters: undefined, source: protectedSource },
        { lat: 23.82, lng: 90.42, accuracyMeters: 12 }
      ),
      false
    );
  }
  assert.equal(
    shouldReplaceGpsFix(
      { lat: null, lng: null, source: 'unlocated' },
      { lat: 23.82, lng: 90.42, accuracyMeters: 120 }
    ),
    true
  );
  assert.equal(
    shouldReplaceGpsFix(
      { lat: 23.81, lng: 90.41, accuracyMeters: 250, source: 'gps' },
      { lat: 23.8105, lng: 90.4105, accuracyMeters: 18 }
    ),
    true
  );
  assert.equal(
    shouldReplaceGpsFix(
      { lat: 23.81, lng: 90.41, accuracyMeters: 40, source: 'gps' },
      { lat: 23.8105, lng: 90.4105, accuracyMeters: 180 }
    ),
    false
  );
});

test('classifyGpsAccuracy distinguishes high, moderate, and poor precision', () => {
  assert.equal(classifyGpsAccuracy(12).tier, 'high');
  assert.equal(classifyGpsAccuracy(85).tier, 'moderate');
  assert.equal(classifyGpsAccuracy(450).tier, 'poor');
  assert.equal(classifyGpsAccuracy(450).isReliable, false);
});

test('mapGeolocationError provides calm fallback guidance for permission denied and timeout', () => {
  const denied = mapGeolocationError(1);
  assert.equal(denied.reason, 'permission_denied');
  assert.equal(denied.messageEn, GPS_FALLBACK_GUIDANCE_EN);

  const timeout = mapGeolocationError(3);
  assert.equal(timeout.reason, 'timeout');
  assert.equal(timeout.messageEn, GPS_FALLBACK_GUIDANCE_EN);
});

test('buildExternalMapLinks builds valid OSM and Google Maps URLs', () => {
  const links = buildExternalMapLinks(23.8103, 90.4125);
  assert.ok(links.openStreetMap.includes('openstreetmap.org'));
  assert.ok(links.googleMaps.includes('23.8103,90.4125'));
});

test('parseSharedLocationUrl extracts coordinates from valid Google Maps and OSM links and rejects unsafe URLs', () => {
  const gmAt = parseSharedLocationUrl('https://www.google.com/maps/@22.3237,91.8123,16z');
  assert.equal(gmAt.valid, true);
  assert.equal(gmAt.provider, 'google_maps');
  assert.equal(gmAt.lat, 22.3237);
  assert.equal(gmAt.lng, 91.8123);

  const gmQuery = parseSharedLocationUrl('https://www.google.com/maps/search/?api=1&query=22.3569,91.7832');
  assert.equal(gmQuery.valid, true);
  assert.equal(gmQuery.lat, 22.3569);

  const osm = parseSharedLocationUrl('https://www.openstreetmap.org/?mlat=23.7948&mlon=90.4049#map=16/23.7948/90.4049');
  assert.equal(osm.valid, true);
  assert.equal(osm.provider, 'openstreetmap');
  assert.equal(osm.lat, 23.7948);

  const xss = parseSharedLocationUrl('javascript:alert(1)');
  assert.equal(xss.valid, false);

  const arbitrary = parseSharedLocationUrl('https://evil.example.com/?q=23.8,90.4');
  assert.equal(arbitrary.valid, false);

  const shortlink = parseSharedLocationUrl('https://maps.app.goo.gl/abc123');
  assert.equal(shortlink.valid, false);
});

test('buildBangladeshQueryVariants produces English spelling variations', () => {
  const variants = buildBangladeshQueryVariants('Agrabad, Chittagong');
  assert.ok(variants.includes('Agrabad, Chittagong'));
  assert.ok(variants.includes('Agrabad, Chattogram'));
});

