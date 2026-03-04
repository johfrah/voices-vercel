import fs from 'node:fs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type DebugPayload = {
  hypothesisId?: string;
  location?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DebugPayload;
    const line = JSON.stringify({
      hypothesisId: payload.hypothesisId ?? 'UNKNOWN',
      location: payload.location ?? 'unknown',
      message: payload.message ?? 'debug',
      data: payload.data ?? {},
      timestamp: payload.timestamp ?? Date.now()
    });
    fs.appendFileSync('/opt/cursor/logs/debug.log', `${line}\n`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'debug-log-write-failed' },
      { status: 500 }
    );
  }
}
