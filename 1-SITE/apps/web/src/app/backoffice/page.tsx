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
        <TextInstrument className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">
          <VoiceglotText translationKey="admin.cockpit.revenue_label" defaultText="Omzet" />
        </TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">{totalRevenue}</HeadingInstrument>
        <ContainerInstrument className="mt-4 text-[10px] font-bold bg-white/20 inline-block px-2 py-1 rounded">
          <VoiceglotText translationKey="admin.cockpit.profit_engine" defaultText="Dashboard" />
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Orders Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2">
          <VoiceglotText translationKey="admin.cockpit.orders_label" defaultText="Bestellingen" />
        </TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">{orderCount.value}</HeadingInstrument>
        <TextInstrument className="text-[10px] text-green-600 font-bold mt-2">↑ 12%</TextInstrument>
      </ContainerInstrument>

      {/* Users Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2">
          <VoiceglotText translationKey="admin.cockpit.users_label" defaultText="Gebruikers" />
        </TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">{userCount.value}</HeadingInstrument>
        <TextInstrument className="text-[10px] text-black/40 font-bold mt-2">
          <VoiceglotText translationKey="admin.cockpit.users_subtitle" defaultText="Geverifieerd" />
        </TextInstrument>
      </ContainerInstrument>

      {/* Actors Card */}
      <ContainerInstrument className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
        <TextInstrument className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2">
          <VoiceglotText translationKey="admin.cockpit.voices_label" defaultText="Stemmen" />
        </TextInstrument>
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">{actorCount.value}</HeadingInstrument>
        <TextInstrument className="text-[10px] text-black/40 font-bold mt-2">
          <VoiceglotText translationKey="admin.cockpit.voices_subtitle" defaultText="Totaal" />
        </TextInstrument>
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
      <HeadingInstrument level={3} className="text-xl font-black tracking-tighter mb-6 uppercase">
        <VoiceglotText translationKey="admin.cockpit.recent_activity" defaultText="Activiteit" />
      </HeadingInstrument>
      <ContainerInstrument className="space-y-4">
        {recentOrders.map((order) => (
          <ContainerInstrument key={order.id} className="flex justify-between items-center border-b border-black/5 pb-4 last:border-0 last:pb-0">
            <ContainerInstrument>
              <TextInstrument className="font-bold text-sm">Order #{order.wpOrderId}</TextInstrument>
              <TextInstrument className="text-[10px] text-black/40 uppercase font-black tracking-widest">
                {order.user?.email || 'Gastgebruiker'}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="text-right">
              <TextInstrument className="font-black tracking-tighter">€ {order.total}</TextInstrument>
              <TextInstrument className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
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
        <HeadingInstrument level={1} className="text-4xl font-black tracking-tighter uppercase">
          <VoiceglotText translationKey="admin.cockpit.title" defaultText="Backoffice" />
        </HeadingInstrument>
        <TextInstrument className="text-black/40 font-bold text-sm uppercase tracking-widest">
          <VoiceglotText translationKey="admin.cockpit.subtitle" defaultText="Voices" />
        </TextInstrument>
      </SectionInstrument>

      <Suspense fallback={<LoadingScreenInstrument />}>
        <StatsGrid />
        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivity />
          
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-4 m-8">
            {/* Media Library Link */}
            <ButtonInstrument as="a" href="/backoffice/media" className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <ContainerInstrument className="w-12 h-12 bg-va-black text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <TextInstrument as="span" className="text-xl">🖼️</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="font-black tracking-tighter uppercase text-va-black">
                  <VoiceglotText translationKey="admin.cockpit.media_library" defaultText="Media" />
                </HeadingInstrument>
                <TextInstrument className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1">
                  <VoiceglotText translationKey="admin.cockpit.media_library_subtitle" defaultText="Beheer online assets" />
                </TextInstrument>
              </ContainerInstrument>
            </ButtonInstrument>

            {/* Future Widget */}
            <ContainerInstrument className="bg-transparent rounded-[40px] p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-black/10 shadow-none">
              <ContainerInstrument className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
                <TextInstrument as="span" className="text-xl">🧠</TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={4} className="font-black tracking-tighter uppercase text-black/40 text-sm">
                <VoiceglotText translationKey="admin.cockpit.lead_scoring" defaultText="Leads" />
              </HeadingInstrument>
              <TextInstrument className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-2">
                <VoiceglotText translationKey="common.coming_soon" defaultText="Binnenkort" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </Suspense>
    </PageWrapperInstrument>
  );
}