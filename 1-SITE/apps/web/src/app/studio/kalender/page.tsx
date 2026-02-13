import { 
  ContainerInstrument 
} from '@/components/ui/LayoutInstruments';
import { WorkshopCalendar } from '@/components/studio/WorkshopCalendar';
import {
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@db';
import { workshops } from '@db/schema';
import { desc, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function KalenderPage() {
  const upcomingWorkshops = await db.select().from(workshops)
    .where(gte(workshops.date, new Date()))
    .orderBy(desc(workshops.date))
    .limit(20);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-32 pb-20 px-6">
      <SectionInstrument className="max-w-4xl mx-auto space-y-12">
        <ContainerInstrument className="text-center space-y-4">
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
            <VoiceglotText  translationKey="studio.kalender.title" defaultText="Workshop Kalender" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light text-[15px]">
            <VoiceglotText  
              translationKey="studio.kalender.subtitle" 
              defaultText="Bekijk alle geplande sessies en reserveer direct je plek in de studio." 
            />
          </TextInstrument>
        </ContainerInstrument>

        <WorkshopCalendar strokeWidth={1.5} workshops={upcomingWorkshops} />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
