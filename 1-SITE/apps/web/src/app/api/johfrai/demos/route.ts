import { NextResponse } from 'next/server';
import { db } from '@/lib/system/voices-config';
import { actorDemos, actors, media } from '@/lib/system/voices-config';
import { and, eq, like, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector');
  const vibe = searchParams.get('vibe');
  const lang = searchParams.get('lang') || 'nl';

  try {
    // 1. Find Johfrah
    const [johfrah] = await db.select().from(actors).where(like(actors.firstName, 'Johfrah%')).limit(1);
    
    if (!johfrah) {
      return NextResponse.json({ error: 'Johfrah not found' }, { status: 404 });
    }

    // 2. Fetch demos for Johfrah
    let query = db.select({
      id: actorDemos.id,
      name: actorDemos.name,
      url: actorDemos.url,
      type: actorDemos.type,
      labels: media.labels,
      category: media.category,
      metadata: media.metadata, // Haal echte metadata op
    })
    .from(actorDemos)
    .leftJoin(media, eq(actorDemos.mediaId, media.id))
    .where(eq(actorDemos.actorId, johfrah.id));

    const demos = await query;

    // 3. Filter by sector or vibe
    let filteredDemos = demos;

    if (sector) {
      filteredDemos = filteredDemos.filter(d => 
        d.labels?.some(l => l.toLowerCase().includes(sector.toLowerCase())) ||
        d.name.toLowerCase().includes(sector.toLowerCase())
      );
    }

    if (vibe) {
      filteredDemos = filteredDemos.filter(d => 
        d.labels?.some(l => l.toLowerCase().includes(vibe.toLowerCase())) ||
        d.type?.toLowerCase().includes(vibe.toLowerCase())
      );
    }

    // 4. Map to a clean format
    const results = filteredDemos.map(d => {
      const audioUrl = d.url || '';
      const proxiedAudio = audioUrl.startsWith('http')
        ? audioUrl
        : (audioUrl ? `/api/proxy?path=${encodeURIComponent(audioUrl)}` : '');

      // Gebruik het echte script uit de metadata als het bestaat
      const realScript = (d.metadata as any)?.script || (d.metadata as any)?.transcription;

      return {
        id: d.id,
        title: d.name,
        audio_url: proxiedAudio,
        category: d.type || 'demo',
        labels: d.labels || [],
        script: realScript || null
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching Johfrai demos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
