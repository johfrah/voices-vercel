import { NextRequest, NextResponse } from 'next/server';
import { ContentEngine } from '@/lib/content-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const journey = searchParams.get('journey') || 'video';

  try {
    const blueprints = await ContentEngine.getBlueprints(journey);
    return NextResponse.json(blueprints);
  } catch (error) {
    console.error('Blueprints API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
