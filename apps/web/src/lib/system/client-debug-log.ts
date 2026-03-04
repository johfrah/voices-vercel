type ClientDebugPayload = {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: number;
};

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 300;

export function writeClientDebugLog(payload: ClientDebugPayload): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const key = `${payload.hypothesisId}:${payload.location}:${payload.message}`;
  const last = rateLimitMap.get(key) ?? 0;
  if (now - last < RATE_LIMIT_MS) return;
  rateLimitMap.set(key, now);

  fetch('/api/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data ?? {},
      timestamp: payload.timestamp ?? now
    }),
    keepalive: true
  }).catch(() => {});
}
