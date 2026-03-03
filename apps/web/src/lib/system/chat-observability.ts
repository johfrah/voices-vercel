type MetricKind = 'api' | 'sse';

interface MetricEvent {
  kind: MetricKind;
  action: string;
  ts: number;
  latency_ms: number;
  ok: boolean;
}

interface MetricSummary {
  total: number;
  errors: number;
  error_rate_pct: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  slow_over_100ms: number;
}

const RETAIN_MS = 15 * 60 * 1000;
const MAX_EVENTS = 4000;
const apiEvents: MetricEvent[] = [];
const sseEvents: MetricEvent[] = [];

const emptySummary = (): MetricSummary => ({
  total: 0,
  errors: 0,
  error_rate_pct: 0,
  avg_ms: 0,
  p50_ms: 0,
  p95_ms: 0,
  p99_ms: 0,
  slow_over_100ms: 0,
});

const quantile = (sorted: number[], q: number) => {
  if (!sorted.length) return 0;
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q)));
  return Number(sorted[idx].toFixed(2));
};

const trimEvents = (events: MetricEvent[]) => {
  const cutoff = Date.now() - RETAIN_MS;
  while (events.length > MAX_EVENTS) events.shift();
  while (events.length && events[0].ts < cutoff) events.shift();
};

const pushEvent = (events: MetricEvent[], event: MetricEvent) => {
  events.push(event);
  trimEvents(events);
};

const summarize = (events: MetricEvent[], windowMs: number): MetricSummary => {
  const cutoff = Date.now() - windowMs;
  const scoped = events.filter((event) => event.ts >= cutoff);
  if (!scoped.length) return emptySummary();

  const latencies = scoped.map((event) => event.latency_ms).sort((a, b) => a - b);
  const total = scoped.length;
  const errors = scoped.filter((event) => !event.ok).length;
  const avg = latencies.reduce((acc, value) => acc + value, 0) / total;
  const slow = latencies.filter((value) => value > 100).length;

  return {
    total,
    errors,
    error_rate_pct: Number(((errors / total) * 100).toFixed(2)),
    avg_ms: Number(avg.toFixed(2)),
    p50_ms: quantile(latencies, 0.5),
    p95_ms: quantile(latencies, 0.95),
    p99_ms: quantile(latencies, 0.99),
    slow_over_100ms: slow,
  };
};

const summarizeByAction = (events: MetricEvent[], windowMs: number) => {
  const cutoff = Date.now() - windowMs;
  const grouped = new Map<string, MetricEvent[]>();
  for (const event of events) {
    if (event.ts < cutoff) continue;
    const bucket = grouped.get(event.action) || [];
    bucket.push(event);
    grouped.set(event.action, bucket);
  }

  return Array.from(grouped.entries()).reduce<Record<string, MetricSummary>>((acc, [action, scoped]) => {
    acc[action] = summarize(scoped, windowMs);
    return acc;
  }, {});
};

export const recordChatApiMetric = (action: string, latencyMs: number, ok: boolean) => {
  pushEvent(apiEvents, {
    kind: 'api',
    action,
    ts: Date.now(),
    latency_ms: Number(latencyMs.toFixed(2)),
    ok,
  });
};

export const recordChatSseMetric = (action: string, latencyMs: number, ok: boolean) => {
  pushEvent(sseEvents, {
    kind: 'sse',
    action,
    ts: Date.now(),
    latency_ms: Number(latencyMs.toFixed(2)),
    ok,
  });
};

export const getChatObservabilitySnapshot = () => ({
  generated_at: new Date().toISOString(),
  api: {
    last_1m: summarize(apiEvents, 60_000),
    last_5m: summarize(apiEvents, 5 * 60_000),
    by_action_5m: summarizeByAction(apiEvents, 5 * 60_000),
  },
  sse: {
    last_1m: summarize(sseEvents, 60_000),
    last_5m: summarize(sseEvents, 5 * 60_000),
    by_action_5m: summarizeByAction(sseEvents, 5 * 60_000),
  },
});
