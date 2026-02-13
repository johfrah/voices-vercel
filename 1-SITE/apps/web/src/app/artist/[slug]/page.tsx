import { getActor } from "@/lib/api-server";
import { 
  PageWrapperInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Suspense } from "react";
import { ArtistDetailClient } from "./ArtistDetailClient";

export const dynamic = 'force-dynamic';

export default function ArtistDetailPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense strokeWidth={1.5} fallback={<LoadingScreenInstrument / />}>
      <ArtistDetailContent strokeWidth={1.5} params={params} / />
    </Suspense>
  );
}

async function ArtistDetailContent({ params }: { params: { slug: string } }) {
  const isYoussef = params.slug === 'youssef' || params.slug === 'youssef-zaki';
  
  // Als het Youssef is, injecteren we de "Kelder-data" direct
  const artistData = isYoussef ? {
    id: '276051',
    display_name: 'Youssef Zaki',
    photo_url: 'https://www.voices.be/wp-content/uploads/portfolio/276051/hero.jpg',
    bio: "I’m Youssef Zaki, 30 years old, born in Casablanca, Morocco. Between the ages of six and twelve, I grew up in Italy—moving between Piedmont and Tuscany—as the youngest of three brothers. Eventually, we settled in Brussels, where we truly found a sense of home. My musical influences are broad, shaped by my diverse background. I was surrounded by Italian, Arabic, French, and English music, and I’m also drawn to the meditative sounds of raga from Indian music. Artists like Frank Sinatra, Nina Simone, Etta James, and Jennifer Hudson have been major inspirations for me—the list goes on. Music was never a focus in my family. Growing up, survival took priority. It wasn’t until I was 23 that I discovered my own voice in music. I sang Frank Sinatra’s “My Funny Valentine” at a karaoke bar—my first time singing in front of anyone. I’d only ever sung alone in my room, too afraid of how others might react. But that night, the response was overwhelming and deeply moving. It changed everything for me. Now, I’m a street musician in Brussels, singing every Friday, Saturday, and Sunday evening. Music feels like a true gift in my life.",
    demos: [
      { title: 'Fix You (Live at The Voice)', category: 'Performance' },
      { title: 'My Funny Valentine', category: 'Jazz Standard' },
      { title: 'Street Session Brussels', category: 'Live' }
    ],
    socials: {
      instagram: 'https://www.instagram.com/youssefzaki_off/',
      tiktok: 'https://www.tiktok.com/@youssefzaki_of',
      youtube: 'https://www.youtube.com/watch?v=_MMUUbVj6YY'
    },
    donation_goal: 1000,
    donation_current: 0
  } : await getActor(params.slug);

  if (!artistData) {
    return (
      <PageWrapperInstrument className="flex items-center justify-center min-h-screen">
        <HeadingInstrument level={1}><VoiceglotText strokeWidth={1.5} translationKey="artist.not_found" defaultText="Artist not found" / /></HeadingInstrument>
      </PageWrapperInstrument>
    );
  }

  return <ArtistDetailClient strokeWidth={1.5} artistData={artistData} isYoussef={isYoussef} params={params} / />;
}
