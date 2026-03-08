import { afterEach, describe, expect, it } from 'vitest';
import { createAdminBridgeToken, verifyAdminBridgeToken } from './admin-bridge-token';

const ORIGINAL_ADMIN_BRIDGE_SECRET = process.env.ADMIN_BRIDGE_SECRET;
const ORIGINAL_ADMIN_AUTOLOGIN_KEY = process.env.ADMIN_AUTOLOGIN_KEY;

afterEach(() => {
  process.env.ADMIN_BRIDGE_SECRET = ORIGINAL_ADMIN_BRIDGE_SECRET;
  process.env.ADMIN_AUTOLOGIN_KEY = ORIGINAL_ADMIN_AUTOLOGIN_KEY;
});

describe('admin bridge token', () => {
  it('accepts a signed token and returns admin id', () => {
    process.env.ADMIN_BRIDGE_SECRET = 'test-secret';
    delete process.env.ADMIN_AUTOLOGIN_KEY;

    const token = createAdminBridgeToken(42, Math.floor(Date.now() / 1000));
    expect(token).toBeTruthy();
    expect(verifyAdminBridgeToken(token || '')).toEqual({ adminId: 42 });
  });

  it('rejects legacy unsigned bridge tokens', () => {
    process.env.ADMIN_BRIDGE_SECRET = 'test-secret';
    delete process.env.ADMIN_AUTOLOGIN_KEY;

    expect(verifyAdminBridgeToken('admin-bridge-1')).toBeNull();
  });

  it('rejects expired signed tokens', () => {
    process.env.ADMIN_BRIDGE_SECRET = 'test-secret';
    delete process.env.ADMIN_AUTOLOGIN_KEY;

    const oldIssuedAt = Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 400);
    const token = createAdminBridgeToken(7, oldIssuedAt);
    expect(token).toBeTruthy();
    expect(verifyAdminBridgeToken(token || '')).toBeNull();
  });
});
