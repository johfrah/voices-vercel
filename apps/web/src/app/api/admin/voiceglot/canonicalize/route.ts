import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import {
  canonicalizeVoiceglotTranslations,
  getVoiceglotCoverageSnapshot,
  persistVoiceglotRunHealth,
  runVoiceglotHealBatch,
  VOICEGLOT_TARGET_LANGUAGES,
} from '@/lib/services/voiceglot-heal-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, skipped: true, reason: 'Skipping canonicalize during build' });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const purgeAliases = body?.purgeAliases !== false;
    const runHeal = body?.runHeal !== false;
    const batchSize = Math.max(1, Math.min(Number(body?.batchSize || 350), 500));
    const maxBatches = Math.max(1, Math.min(Number(body?.maxBatches || 6), 30));

    const canonical = await canonicalizeVoiceglotTranslations({
      purgeAliases,
      canonicalLanguages: VOICEGLOT_TARGET_LANGUAGES,
    });

    let totalProcessed = 0;
    let totalHealed = 0;
    let totalFailed = 0;
    let pending = 0;
    let finished = false;

    if (runHeal) {
      for (let i = 0; i < maxBatches; i++) {
        const run = await runVoiceglotHealBatch({
          batchSize,
          targetLanguages: VOICEGLOT_TARGET_LANGUAGES,
        });
        totalProcessed += run.processed_count;
        totalHealed += run.healed_count;
        totalFailed += run.failed_count;
        pending = run.pending_total;
        finished = run.finished;
        if (finished || run.processed_count === 0) break;
      }
    }

    const coverage = await getVoiceglotCoverageSnapshot(VOICEGLOT_TARGET_LANGUAGES);
    await persistVoiceglotRunHealth({
      source: 'admin-voiceglot-canonicalize',
      ran_at: new Date().toISOString(),
      purge_aliases: purgeAliases,
      run_heal: runHeal,
      canonical,
      processed_count: totalProcessed,
      healed_count: totalHealed,
      failed_count: totalFailed,
      pending_total: pending,
      finished,
      coverage,
    });

    return NextResponse.json({
      success: true,
      canonical,
      processedCount: totalProcessed,
      healedCount: totalHealed,
      failedCount: totalFailed,
      pendingTotal: pending,
      finished,
      coverage,
    });
  } catch (error: any) {
    console.error('[API Voiceglot Canonicalize Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Canonicalize failed' }, { status: 500 });
  }
}

