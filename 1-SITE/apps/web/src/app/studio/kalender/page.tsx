import React from 'react';
import { db } from '@db';
import { workshops } from '@db/schema';
import { desc, gte } from 'drizzle-orm';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  HeadingInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { WorkshopCalendar } from '@/components/studio/WorkshopCalendar';

export const dynamic = 'force-dynamic';

export default async function KalenderPage() {
  const upcomingWorkshops = await db.select().from(workshops)
    .where(gte(workshops.date, new Date()))
    .orderBy(desc(workshops.date))
    .limit(20);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-20 px-6">
      <SectionInstrument className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <HeadingInstrument level={1} className="text-5xl font-black uppercase tracking-tighter">
            <VoiceglotText translationKey="studio.kalender.title" defaultText="Workshop Kalender" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-lg">
            <VoiceglotText 
              translationKey="studio.kalender.subtitle" 
              defaultText="Bekijk alle geplande sessies en reserveer direct je plek in de studio." 
            />
          </TextInstrument>
        </div>

        <WorkshopCalendar workshops={upcomingWorkshops} />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
