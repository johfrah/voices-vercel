import { getArtist } from "@/lib/api-server";
import { 
  PageWrapperInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Suspense } from "react";
import { ArtistDetailClient } from "./ArtistDetailClient";
import { db } from "@/lib/sync/bridge";
import { orders } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default function ArtistDetailPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <ArtistDetailContent params={params} />
    </Suspense>
  );
}

async function ArtistDetailContent({ params }: { params: { slug: string } }) {
  const cleanSlug = params.slug.replace(/\/$/, '');
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const host = headersList.get('host') || '';
  const pathname = headersList.get('x-voices-pathname') || '';

  console.log(' [ArtistDetailContent] Debug:', { cleanSlug, lang, host, pathname });

  const isYoussef = cleanSlug === 'youssef' || cleanSlug === 'youssef-zaki' || host.includes('youssefzaki.eu');
  
  // NUCLEAR MANDATE: Fetch ALL artist data from the NEW 'artists' table.
  let artist = await getArtist(cleanSlug, lang).catch(async (err) => {
    console.warn(` [ArtistDetailContent] Failed to fetch artist for slug "${cleanSlug}":`, err.message);
    if (isYoussef) {
      console.log(' [ArtistDetailContent] Attempting fallback to slug "youssef"...');
      return await getArtist('youssef', lang).catch(() => null);
    }
    return null;
  });

  if (!artist) {
    console.error(' [ArtistDetailContent] Artist not found after all attempts.');
    return (
      <PageWrapperInstrument className="flex items-center justify-center min-h-screen">
        <HeadingInstrument level={1}><VoiceglotText translationKey="artist.not_found" defaultText="Artist not found" /></HeadingInstrument>
      </PageWrapperInstrument>
    );
  }

  // Transform Artist to ArtistData (Nuclear Sync)
  const artistData = {
    ...artist,
    id: artist.id.toString(),
    display_name: artist.displayName || artist.firstName,
    photo_url: artist.photoUrl,
    bio: artist.bio,
    vision: (artist.iapContext as any)?.vision,
    albums: (artist.iapContext as any)?.albums || [],
    demos: (artist.iapContext as any)?.demos || [],
    socials: (artist.iapContext as any)?.socials || {},
    donation_goal: (artist.iapContext as any)?.donation_goal || 0,
    donation_current: (artist.iapContext as any)?.donation_current || 0,
    donor_count: (artist.iapContext as any)?.donor_count || 0
  };

  // Fetch real donors for the artist
  const donorOrders = await db.select()
    .from(orders)
    .where(
      and(
        eq(orders.journey, 'artist_donation'),
        eq(orders.status, 'paid')
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(50);

  const donors = donorOrders.map(o => ({
    id: o.id,
    name: (o.iapContext as any)?.donorName || 'Anoniem',
    amount: o.total,
    message: (o.iapContext as any)?.message,
    date: o.createdAt
  }));

  // Update real-time stats from DB
  const totalDonated = donorOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  artistData.donation_current = totalDonated > artistData.donation_current ? totalDonated : artistData.donation_current;
  artistData.donor_count = donorOrders.length > artistData.donor_count ? donorOrders.length : artistData.donor_count;

  return <ArtistDetailClient artistData={artistData} isYoussef={isYoussef} params={params} donors={donors} />;
}
