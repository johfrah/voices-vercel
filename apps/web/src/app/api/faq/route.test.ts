import { beforeEach, describe, expect, it, vi } from 'vitest';

type SupabaseResult = {
  data: Record<string, unknown>[] | null;
  error: Error | null;
};

function createSupabaseQueryChain(result: SupabaseResult) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    is: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  } as {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    or: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.is.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockResolvedValue(result);

  return chain;
}

async function loadRouteWithMocks(options?: {
  executeImpl?: () => Promise<unknown>;
  supabaseResult?: SupabaseResult;
}) {
  vi.resetModules();

  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

  const execute = vi.fn(options?.executeImpl ?? (async () => []));
  const report = vi.fn();
  const queryChain = createSupabaseQueryChain(
    options?.supabaseResult ?? { data: [], error: null }
  );
  const from = vi.fn(() => queryChain);
  const createClient = vi.fn(() => ({ from }));

  vi.doMock('@/lib/system/voices-config', () => ({
    db: { execute },
  }));

  vi.doMock('@/lib/services/server-watchdog', () => ({
    ServerWatchdog: { report },
  }));

  vi.doMock('@supabase/supabase-js', () => ({
    createClient,
  }));

  const mod = await import('./route');
  return { GET: mod.GET, execute, report, queryChain, from, createClient };
}

describe('GET /api/faq', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid limit values', async () => {
    const { GET, execute } = await loadRouteWithMocks();
    const response = await GET({ url: 'https://www.voices.be/api/faq?limit=0' } as never);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Invalid limit parameter' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid world_id values', async () => {
    const { GET, execute } = await loadRouteWithMocks();
    const response = await GET(
      { url: 'https://www.voices.be/api/faq?journey=studio&world_id=-1' } as never
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Invalid world_id parameter' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('falls back to Supabase, clamps limit and preserves snake_case payload', async () => {
    const { GET, queryChain, report } = await loadRouteWithMocks({
      executeImpl: async () => {
        throw new Error('drizzle unavailable');
      },
      supabaseResult: {
        data: [
          {
            id: '7',
            questionNl: 'Vraag',
            answerNl: 'Antwoord',
            questionEn: 'Question',
            answerEn: 'Answer',
            category: 'studio',
            worldId: 2,
            isPublic: true,
            helpfulCount: 9,
            displayOrder: 1,
          },
        ],
        error: null,
      },
    });

    const response = await GET({ url: 'https://www.voices.be/api/faq?journey=studio&limit=99' } as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(queryChain.in).toHaveBeenCalledWith('category', ['studio', 'general']);
    expect(queryChain.or).toHaveBeenCalledWith('world_id.eq.2,world_id.is.null');
    expect(queryChain.limit).toHaveBeenCalledWith(15);
    expect(payload).toEqual([
      {
        id: 7,
        question_nl: 'Vraag',
        answer_nl: 'Antwoord',
        question_en: 'Question',
        answer_en: 'Answer',
        category: 'studio',
        world_id: 2,
        is_public: true,
        helpful_count: 9,
        display_order: 1,
      },
    ]);
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        component: 'api/faq',
        level: 'warn',
      })
    );
  });

  it('defaults unknown journeys to general with global world filter', async () => {
    const { GET, queryChain } = await loadRouteWithMocks({
      executeImpl: async () => {
        throw new Error('drizzle unavailable');
      },
      supabaseResult: { data: [], error: null },
    });

    const response = await GET({ url: 'https://www.voices.be/api/faq?journey=not-a-journey' } as never);

    expect(response.status).toBe(200);
    expect(queryChain.eq).toHaveBeenCalledWith('is_public', true);
    expect(queryChain.eq).toHaveBeenCalledWith('category', 'general');
    expect(queryChain.is).toHaveBeenCalledWith('world_id', null);
    expect(queryChain.or).not.toHaveBeenCalled();
  });
});
