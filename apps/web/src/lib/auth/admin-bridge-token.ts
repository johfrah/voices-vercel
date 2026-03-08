import crypto from 'node:crypto';

const ADMIN_BRIDGE_TOKEN_PREFIX = 'admin-bridge-v1';
const MAX_TOKEN_AGE_SECONDS = 60 * 60 * 24 * 366;
const CLOCK_SKEW_SECONDS = 5 * 60;

function getBridgeSecret(): string | null {
  const raw = process.env.ADMIN_BRIDGE_SECRET || process.env.ADMIN_AUTOLOGIN_KEY || '';
  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : null;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createAdminBridgeToken(adminId: number, issuedAt: number = Math.floor(Date.now() / 1000)): string | null {
  if (!Number.isInteger(adminId) || adminId <= 0) return null;
  const secret = getBridgeSecret();
  if (!secret) return null;

  const payload = `${ADMIN_BRIDGE_TOKEN_PREFIX}:${adminId}:${issuedAt}`;
  const signature = signPayload(payload, secret);
  return `${payload}:${signature}`;
}

export function verifyAdminBridgeToken(token: string): { adminId: number } | null {
  if (typeof token !== 'string' || token.trim().length === 0) return null;
  const secret = getBridgeSecret();
  if (!secret) return null;

  const [prefix, adminIdRaw, issuedAtRaw, signature] = token.split(':');
  if (prefix !== ADMIN_BRIDGE_TOKEN_PREFIX || !adminIdRaw || !issuedAtRaw || !signature) {
    return null;
  }

  const adminId = Number.parseInt(adminIdRaw, 10);
  const issuedAt = Number.parseInt(issuedAtRaw, 10);
  if (!Number.isInteger(adminId) || adminId <= 0 || !Number.isInteger(issuedAt) || issuedAt <= 0) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now + CLOCK_SKEW_SECONDS) return null;
  if (now - issuedAt > MAX_TOKEN_AGE_SECONDS) return null;

  const payload = `${ADMIN_BRIDGE_TOKEN_PREFIX}:${adminId}:${issuedAt}`;
  const expectedSignature = signPayload(payload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== providedBuffer.length) return null;
  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) return null;

  return { adminId };
}
