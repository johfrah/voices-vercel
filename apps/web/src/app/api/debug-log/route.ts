import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEBUG_LOG_PATH = '/opt/cursor/logs/debug.log';

type DebugPayload = {
  hypothesisId?: string;
  location?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DebugPayload;
    const logLine = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      hypothesisId: body?.hypothesisId || 'unknown',
      location: body?.location || 'unknown',
      message: body?.message || 'debug',
      data: body?.data || {},
      timestamp: typeof body?.timestamp === 'number' ? body.timestamp : Date.now(),
    };

    fs.appendFileSync(DEBUG_LOG_PATH, `${JSON.stringify(logLine)}\n`);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to write debug log' },
      { status: 500 }
    );
  }
}
