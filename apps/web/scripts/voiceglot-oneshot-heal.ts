import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

type CliConfig = {
  batchSize: number;
  maxPasses: number;
  sleepMs: number;
  purgeAliases: boolean;
  canonicalizeFirst: boolean;
};

function parseArgs(argv: string[]): CliConfig {
  const args = new Map<string, string>();
  for (const token of argv) {
    const cleaned = String(token || '').trim();
    if (!cleaned.startsWith('--')) continue;
    const [key, value] = cleaned.split('=');
    args.set(key, value ?? 'true');
  }

  const readNumber = (key: string, fallback: number) => {
    const raw = Number(args.get(key) || fallback);
    if (!Number.isFinite(raw)) return fallback;
    return raw;
  };

  const readBoolean = (key: string, fallback: boolean) => {
    if (!args.has(key)) return fallback;
    const raw = String(args.get(key) || '').toLowerCase();
    if (raw === 'false' || raw === '0' || raw === 'no') return false;
    return true;
  };

  return {
    batchSize: Math.max(1, Math.min(readNumber('--batch-size', 500), 500)),
    maxPasses: Math.max(1, Math.min(readNumber('--max-passes', 1200), 5000)),
    sleepMs: Math.max(0, Math.min(readNumber('--sleep-ms', 150), 30000)),
    purgeAliases: readBoolean('--purge-aliases', true),
    canonicalizeFirst: readBoolean('--canonicalize-first', true),
  };
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  const serviceMod: any = await import('../src/lib/services/voiceglot-heal-service');
  const service = serviceMod?.default || serviceMod;

  const canonicalizeVoiceglotTranslations = service.canonicalizeVoiceglotTranslations as
    | ((options?: { purgeAliases?: boolean; canonicalLanguages?: readonly string[] }) => Promise<any>)
    | undefined;
  const runVoiceglotHealBatch = service.runVoiceglotHealBatch as
    | ((options?: { batchSize?: number; targetLanguages?: readonly string[] }) => Promise<any>)
    | undefined;
  const getVoiceglotCoverageSnapshot = service.getVoiceglotCoverageSnapshot as
    | ((targetLanguages?: readonly string[]) => Promise<any>)
    | undefined;
  const persistVoiceglotRunHealth = service.persistVoiceglotRunHealth as
    | ((payload: Record<string, unknown>) => Promise<void>)
    | undefined;
  const targetLanguages = service.VOICEGLOT_TARGET_LANGUAGES as readonly string[] | undefined;

  if (
    !canonicalizeVoiceglotTranslations ||
    !runVoiceglotHealBatch ||
    !getVoiceglotCoverageSnapshot ||
    !persistVoiceglotRunHealth ||
    !targetLanguages
  ) {
    throw new Error('Voiceglot one-shot: required service exports are missing');
  }

  console.log('[voiceglot-oneshot] start');
  console.log(
    JSON.stringify(
      {
        batch_size: config.batchSize,
        max_passes: config.maxPasses,
        sleep_ms: config.sleepMs,
        purge_aliases: config.purgeAliases,
        canonicalize_first: config.canonicalizeFirst,
        target_languages: targetLanguages,
      },
      null,
      2,
    ),
  );

  let canonicalResult: Record<string, unknown> | null = null;
  if (config.canonicalizeFirst) {
    canonicalResult = await canonicalizeVoiceglotTranslations({
      purgeAliases: config.purgeAliases,
      canonicalLanguages: targetLanguages,
    });
    console.log('[voiceglot-oneshot] canonicalize_done');
    console.log(JSON.stringify(canonicalResult, null, 2));
  }

  let processedCount = 0;
  let healedCount = 0;
  let failedCount = 0;
  let pendingTotal = 0;
  let finished = false;
  let lastPass = 0;

  for (let pass = 1; pass <= config.maxPasses; pass += 1) {
    lastPass = pass;
    const result = await runVoiceglotHealBatch({
      batchSize: config.batchSize,
      targetLanguages,
    });

    processedCount += Number(result.processed_count || 0);
    healedCount += Number(result.healed_count || 0);
    failedCount += Number(result.failed_count || 0);
    pendingTotal = Number(result.pending_total || 0);
    finished = Boolean(result.finished);

    console.log(
      `[voiceglot-oneshot] pass=${pass} processed=${result.processed_count} healed=${result.healed_count} failed=${result.failed_count} pending=${result.pending_total} finished=${result.finished}`,
    );

    if (finished || Number(result.processed_count || 0) === 0) {
      break;
    }

    if (config.sleepMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.sleepMs));
    }
  }

  const coverage = await getVoiceglotCoverageSnapshot(targetLanguages);
  const payload = {
    source: 'script-voiceglot-oneshot',
    ran_at: new Date().toISOString(),
    canonical: canonicalResult,
    pass_count: lastPass,
    processed_count: processedCount,
    healed_count: healedCount,
    failed_count: failedCount,
    pending_total: pendingTotal,
    finished,
    coverage,
    duration_ms: Date.now() - startedAt,
  };

  await persistVoiceglotRunHealth(payload);
  console.log('[voiceglot-oneshot] finished');
  console.log(JSON.stringify(payload, null, 2));

  if (!finished || pendingTotal > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error('[voiceglot-oneshot] failed', error);
  process.exit(1);
});
