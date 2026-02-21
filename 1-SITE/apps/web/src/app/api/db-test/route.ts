import { db } from '@db';
import { appConfigs } from '@db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log(' DATABASE TEST: Attempting to fetch appConfigs...');
    const configs = await db.select().from(appConfigs).limit(1);
    return NextResponse.json({ success: true, count: configs.length, firstKey: configs[0]?.key });
  } catch (error: any) {
    console.error(' DATABASE TEST FAILURE:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
