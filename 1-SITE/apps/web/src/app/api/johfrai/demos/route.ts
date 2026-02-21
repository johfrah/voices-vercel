import { NextResponse } from 'next/server';
import { db } from '@db';
import { actorDemos, actors, media } from '@db/schema';
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
    // We look for demos in actorDemos and join with media to get labels
    let query = db.select({
      id: actorDemos.id,
      name: actorDemos.name,
      url: actorDemos.url,
      type: actorDemos.type,
      labels: media.labels,
      category: media.category,
    })
    .from(actorDemos)
    .leftJoin(media, eq(actorDemos.mediaId, media.id))
    .where(eq(actorDemos.actorId, johfrah.id));

    const demos = await query;

    // 3. Filter by sector or vibe if provided
    // This is a client-side filter for now to be flexible, or we can do it in SQL
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

      return {
        id: d.id,
        title: d.name,
        audio_url: proxiedAudio,
        category: d.type || 'demo',
        labels: d.labels || [],
        // Mock script for "Adopt Script" functionality
        // In a real scenario, this would come from a 'scripts' table or media metadata
        script: d.labels?.some(l => l.toLowerCase().includes('script')) 
          ? `(Welkomstboodschap)\nBedankt voor het bellen naar onze ${sector || 'organisatie'}. We verbinden u door met een van onze medewerkers.` 
          : null
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching Johfrai demos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
