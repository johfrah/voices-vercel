import { getActors } from '@/lib/api-server';
import { headers } from 'next/headers';
import { PageWrapperInstrument, SectionInstrument } from '@/components/ui/LayoutInstruments';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

//  NUCLEAR LOADING MANDATE: Zware instrumenten dynamisch laden voor 100ms LCP
const StudioLaunchpad = dynamic(() => import('@/components/ui/StudioLaunchpad').then(mod => mod.StudioLaunchpad), { ssr: false });
const LiquidBackground = dynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

export default async function LaunchpadPage() {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const searchResults = await getActors({}, lang);
  
  return (
    <PageWrapperInstrument className="relative min-h-screen pb-20 overflow-hidden">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10 !pt-32">
        <Suspense fallback={<div className="w-full h-[600px] bg-va-black/5 rounded-[32px] animate-pulse" />}>
          <StudioLaunchpad strokeWidth={1.5} initialActors={searchResults.results} />
        </Suspense>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
