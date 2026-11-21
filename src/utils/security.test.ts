import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePlainText,
  maskPhoneNumber,
  generateTrackingCode,
  validateMediaUpload,
  SlidingWindowRateLimiter
} from './security';

test('sanitizePlainText strips HTML tags and control characters', () => {
  assert.equal(sanitizePlainText('<script>alert(1)</script>Help us!'), 'alert(1)Help us!');
  assert.equal(sanitizePlainText('  Road 5, Mirpur  '), 'Road 5, Mirpur');
});

test('maskPhoneNumber hides middle digits to protect victim privacy', () => {
  assert.equal(maskPhoneNumber('01712345678'), '017****5678');
  assert.equal(maskPhoneNumber('Hidden'), 'Hidden');
});

test('generateTrackingCode generates uppercase alphanumeric codes of requested length', () => {
  const code = generateTrackingCode(6);
  assert.equal(code.length, 6);
  assert.match(code, /^[A-Z2-9]{6}$/);
});

test('validateMediaUpload enforces MIME allowlist and byte limit', () => {
  assert.equal(validateMediaUpload('image/jpeg', 1024).valid, true);
  assert.equal(validateMediaUpload('audio/webm;codecs=opus', 2048).valid, true);
  assert.equal(validateMediaUpload('application/x-msdownload', 1024).valid, false);
  assert.equal(validateMediaUpload('image/png', 10 * 1024 * 1024).valid, false);
});

test('SlidingWindowRateLimiter blocks bursts above threshold', () => {
  const limiter = new SlidingWindowRateLimiter(2, 10000);
  assert.equal(limiter.check('ip-1', 1000).allowed, true);
  assert.equal(limiter.check('ip-1', 2000).allowed, true);
  assert.equal(limiter.check('ip-1', 3000).allowed, false);
  assert.equal(limiter.check('ip-1', 12000).allowed, true);
});
