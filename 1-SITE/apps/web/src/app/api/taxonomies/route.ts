import { NextResponse } from 'next/server';
import { DbService } from '@/lib/services/DbService';

/**
 *  TAXONOMY API (GOD MODE 2026)
 * Ontsluit de relationele taxonomies voor de UI.
 */

export async function GET() {
  try {
    const taxonomies = await DbService.getTaxonomies();
    return NextResponse.json(taxonomies);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load taxonomies' }, { status: 500 });
  }
}
