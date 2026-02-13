import { db } from '@db';
import { actors, orders, users } from '@db/schema';
import { count, desc } from 'drizzle-orm';
import { Suspense } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

/**
 * BACKOFFICE
 * Persona: 'Accurate Analist'
 * UI: Data-Dense Bento Grid
 */

async function StatsGrid() {
  const [orderCount] = await db.select({ value: count() }).from(orders);
  const [userCount] = await db.select({ value: count() }).from(users);
  const [actorCount] = await db.select({ value: count() }).from(actors);
  
  // Mock revenue logic for now (will be replaced by Pricing Engine)
  const totalRevenue = (orderCount.value * 245.50).toLocaleString('nl-BE', { style: 'currency', currency: 'EUR' });

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
      {/* Revenue Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 hmagic text-white border-none">
        <TextInstrument className="text-[15px] font-light text-white/50 tracking-widest mb-2"><VoiceglotText translationKey="admin.cockpit.revenue_label" defaultText="Omzet" /></TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">{totalRevenue}</HeadingInstrument>
        <ContainerInstrument className="mt-4 text-[15px] font-light bg-white/20 inline-block px-2 py-1 rounded"><VoiceglotText translationKey="admin.cockpit.profit_engine" defaultText="Dashboard" /></ContainerInstrument>
      </ContainerInstrument>

      {/* Orders Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mb-2"><VoiceglotText translationKey="admin.cockpit.orders_label" defaultText="Bestellingen" /></TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">{orderCount.value}</HeadingInstrument>
        <TextInstrument className="text-[15px] text-green-600 font-light mt-2">↑ 12%</TextInstrument>
      </ContainerInstrument>

      {/* Users Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mb-2"><VoiceglotText translationKey="admin.cockpit.users_label" defaultText="Gebruikers" /></TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">{userCount.value}</HeadingInstrument>
        <TextInstrument className="text-[15px] text-va-black/40 font-light mt-2"><VoiceglotText translationKey="admin.cockpit.users_subtitle" defaultText="Geverifieerd" /></TextInstrument>
      </ContainerInstrument>

      {/* Actors Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mb-2"><VoiceglotText translationKey="admin.cockpit.voices_label" defaultText="Stemmen" /></TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter">{actorCount.value}</HeadingInstrument>
        <TextInstrument className="text-[15px] text-va-black/40 font-light mt-2"><VoiceglotText translationKey="admin.cockpit.voices_subtitle" defaultText="Totaal" /></TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

async function RecentActivity() {
  const recentOrders = await db.query.orders.findMany({
    limit: 5,
    orderBy: [desc(orders.createdAt)],
    with: {
      user: true
    }
  });

  return (
    <ContainerInstrument className="bg-white rounded-[40px] m-8 p-8 border border-black/[0.03] shadow-sm">
      <HeadingInstrument level={3} className="text-xl font-light tracking-tighter mb-6 "><VoiceglotText translationKey="admin.cockpit.recent_activity" defaultText="Activiteit" /></HeadingInstrument>
      <ContainerInstrument className="space-y-4">
        {recentOrders.map((order) => (
          <ContainerInstrument key={order.id} className="flex justify-between items-center border-b border-black/5 pb-4 last:border-0 last:pb-0">
            <ContainerInstrument>
              <TextInstrument className="font-light text-[15px]">Order #{order.wpOrderId}</TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest">
                {order.user?.email || 'Gastgebruiker'}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="text-right">
              <TextInstrument className="font-light tracking-tighter text-[15px]">€ {order.total}</TextInstrument>
              <TextInstrument className={`text-[15px] font-light px-2 py-0.5 rounded-full inline-block ${
                order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {order.status}
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
}

export default function BackofficePage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pt-24">
      <SectionInstrument className="px-8 mb-8">
        <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter "><VoiceglotText translationKey="admin.cockpit.title" defaultText="Backoffice" /><TextInstrument className="text-va-black/40 font-light text-[15px] tracking-widest"><VoiceglotText translationKey="admin.cockpit.subtitle" defaultText="Voices" /></TextInstrument></HeadingInstrument>
      </SectionInstrument>

      <Suspense fallback={<LoadingScreenInstrument />}>
        <StatsGrid />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivity />
          
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-4 m-8">
            {/* Media Library Link */}
            <ButtonInstrument as="a" href="/backoffice/media" className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <ContainerInstrument className="w-12 h-12 bg-va-black text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <TextInstrument as="span" className="text-xl font-light">🖼️</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-light tracking-tighter text-va-black"><VoiceglotText translationKey="admin.cockpit.media_library" defaultText="Media" /><TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest mt-1"><VoiceglotText translationKey="admin.cockpit.media_library_subtitle" defaultText="Beheer online assets" /></TextInstrument></HeadingInstrument>
              </ContainerInstrument>
            </ButtonInstrument>

            {/* Future Widget */}
            <ContainerInstrument className="bg-transparent rounded-[40px] p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-black/10 shadow-none">
              <ContainerInstrument className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
                <TextInstrument as="span" className="text-xl font-light">🧠</TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={4} className="font-light tracking-tighter text-va-black/40 text-[15px]"><VoiceglotText translationKey="admin.cockpit.lead_scoring" defaultText="Leads" /><TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest mt-2"><VoiceglotText translationKey="common.coming_soon" defaultText="Binnenkort" /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </Suspense>
    </PageWrapperInstrument>
  );
}