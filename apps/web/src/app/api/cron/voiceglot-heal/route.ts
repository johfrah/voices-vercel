import { NextRequest, NextResponse } from 'next/server';
import {
  getVoiceglotCoverageSnapshot,
  persistVoiceglotRunHealth,
  runVoiceglotHealBatch,
  VOICEGLOT_TARGET_LANGUAGES,
} from '@/lib/services/voiceglot-heal-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

function authorizeCron(request: NextRequest): { ok: boolean; reason?: string } {
  const expectedSecret = process.env.VERCEL_CRON_SECRET || process.env.CRON_SECRET;

  if (!expectedSecret) {
    // In production, cron endpoints must be secret-protected.
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'Missing VERCEL_CRON_SECRET/CRON_SECRET' };
    }
    return { ok: true };
  }

  const authHeader = request.headers.get('authorization') || '';
  const expectedHeader = `Bearer ${expectedSecret}`;
  if (authHeader !== expectedHeader) {
    return { ok: false, reason: 'Invalid cron authorization header' };
  }

  return { ok: true };
}

export async function GET(request: NextRequest) {
  try {
    const auth = authorizeCron(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batchSize = Math.max(1, Math.min(Number(searchParams.get('batch') || process.env.VOICEGLOT_CRON_BATCH_SIZE || '120'), 500));
    const maxBatches = Math.max(1, Math.min(Number(searchParams.get('max_batches') || process.env.VOICEGLOT_CRON_MAX_BATCHES || '4'), 12));
    const targetLanguages = VOICEGLOT_TARGET_LANGUAGES;

    let totalProcessed = 0;
    let totalHealed = 0;
    let totalCopied = 0;
    let totalFailed = 0;
    let pending = 0;
    let finished = false;

    for (let i = 0; i < maxBatches; i++) {
      const run = await runVoiceglotHealBatch({
        batchSize,
        targetLanguages,
      });

      totalProcessed += run.processed_count;
      totalHealed += run.healed_count;
      totalCopied += run.copied_count;
      totalFailed += run.failed_count;
      pending = run.pending_total;
      finished = run.finished;

      if (finished || run.processed_count === 0) break;
    }

    const coverage = await getVoiceglotCoverageSnapshot(targetLanguages);
    const healthPayload = {
      source: 'cron-voiceglot-heal',
      ran_at: new Date().toISOString(),
      batch_size: batchSize,
      max_batches: maxBatches,
      processed_count: totalProcessed,
      healed_count: totalHealed,
      copied_count: totalCopied,
      failed_count: totalFailed,
      pending_total: pending,
      finished,
      coverage,
    };

    await persistVoiceglotRunHealth(healthPayload);

    return NextResponse.json({
      success: true,
      ...healthPayload,
      message: `Voiceglot cron run klaar: ${totalHealed} vertaald, ${totalCopied} gekopieerd.`,
    });
  } catch (error: any) {
    console.error('[Voiceglot Cron] Failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown cron failure' },
      { status: 500 },
    );
  }
}

