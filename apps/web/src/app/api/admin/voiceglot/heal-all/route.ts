import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import {
  getVoiceglotCoverageSnapshot,
  persistVoiceglotRunHealth,
  runVoiceglotHealBatch,
  VOICEGLOT_TARGET_LANGUAGES,
} from '@/lib/services/voiceglot-heal-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 *  API: VOICEGLOT HEAL-ALL (NUCLEAR SDK 2026)
 * 
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, healedCount: 0, message: 'Skipping heal-all during build' });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = Number(body?.batchSize || 80);
    const maxBatches = Math.max(1, Math.min(Number(body?.maxBatches || 3), 10));
    const targetLanguages = (Array.isArray(body?.targetLanguages) && body.targetLanguages.length > 0
      ? body.targetLanguages
      : VOICEGLOT_TARGET_LANGUAGES) as readonly string[];

    let totalProcessed = 0;
    let totalHealed = 0;
    let totalCopied = 0;
    let totalFailed = 0;
    let pending = 0;
    let finished = false;

    for (let i = 0; i < maxBatches; i++) {
      const result = await runVoiceglotHealBatch({
        batchSize,
        targetLanguages,
      });
      totalProcessed += result.processed_count;
      totalHealed += result.healed_count;
      totalCopied += result.copied_count;
      totalFailed += result.failed_count;
      pending = result.pending_total;
      finished = result.finished;

      if (finished || result.processed_count === 0) break;
    }

    const coverage = await getVoiceglotCoverageSnapshot(targetLanguages);
    await persistVoiceglotRunHealth({
      source: 'admin-heal-all',
      ran_at: new Date().toISOString(),
      processed_count: totalProcessed,
      healed_count: totalHealed,
      copied_count: totalCopied,
      failed_count: totalFailed,
      pending_total: pending,
      finished,
      coverage,
    });

    return NextResponse.json({
      success: true,
      processedCount: totalProcessed,
      healedCount: totalHealed,
      copiedCount: totalCopied,
      failedCount: totalFailed,
      pendingTotal: pending,
      finished,
      targetLanguages,
      coverage,
      message: `Voiceglot heal uitgevoerd: ${totalHealed} vertaald, ${totalCopied} gekopieerd.`,
    });

  } catch (error: any) {
    console.error('[API Voiceglot Heal-All SDK Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
