export function sanitizePlainText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'Not provided';
  const cleaned = phone.trim();
  if (cleaned === 'Hidden' || cleaned === 'Not provided') return cleaned;
  if (cleaned.length <= 4) return '****';
  if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 2)}***${cleaned.slice(-2)}`;
  }
  return `${cleaned.slice(0, 3)}****${cleaned.slice(-4)}`;
}

export function generateTrackingCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return out;
}

const ALLOWED_MEDIA_MIMES: Record<string, { type: 'image' | 'video' | 'audio'; ext: string }> = {
  'image/jpeg': { type: 'image', ext: 'jpg' },
  'image/png': { type: 'image', ext: 'png' },
  'image/webp': { type: 'image', ext: 'webp' },
  'audio/webm': { type: 'audio', ext: 'webm' },
  'audio/ogg': { type: 'audio', ext: 'ogg' },
  'audio/mp4': { type: 'audio', ext: 'm4a' },
  'audio/mpeg': { type: 'audio', ext: 'mp3' },
  'video/mp4': { type: 'video', ext: 'mp4' },
  'video/webm': { type: 'video', ext: 'webm' }
};

export function validateMediaUpload(
  mimeType: string,
  byteLength: number,
  maxBytes = 4 * 1024 * 1024
): { valid: boolean; mediaType?: 'image' | 'video' | 'audio'; ext?: string; error?: string } {
  const baseMime = (mimeType || '').split(';')[0].trim().toLowerCase();
  const info = ALLOWED_MEDIA_MIMES[baseMime];
  if (!info) {
    return {
      valid: false,
      error: 'Unsupported media format. Allowed: JPG, PNG, WebP, MP4, WebM, MP3, OGG.'
    };
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { valid: false, error: 'Empty media file.' };
  }
  if (byteLength > maxBytes) {
    return {
      valid: false,
      error: `File too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))} MB.`
    };
  }
  return { valid: true, mediaType: info.type, ext: info.ext };
}

export class SlidingWindowRateLimiter {
  private hits = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) || []).filter((ts) => ts > cutoff);
    if (recent.length >= this.maxRequests) {
      const oldest = recent[0];
      const retryAfterMs = Math.max(1000, this.windowMs - (now - oldest));
      this.hits.set(key, recent);
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000)
      };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
