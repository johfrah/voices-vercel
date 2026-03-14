import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireAdmin } from '@/lib/auth/api-auth';
import { POST } from './route';

vi.mock('@/lib/auth/api-auth', () => ({
  requireAdmin: vi.fn(),
}));

describe('POST /api/admin/agents/run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks unauthorized callers before running commands', async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
    );

    const response = await POST(
      new Request('http://localhost/api/admin/agents/run', {
        method: 'POST',
        body: JSON.stringify({ agent: 'bob' }),
      }) as any
    );

    expect(response.status).toBe(401);
  });
});
