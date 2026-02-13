import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@db';
import { actors, ademingStats, chatConversations, orders, users, workshops } from '@db/schema';
import { count, desc, sql, sum } from 'drizzle-orm';
import { Activity, Calendar, ShoppingCart, Users } from "lucide-react";

async function getSpotlightStats() {
  // 1. Commercial Pulse (Voices)
  const [orderStats] = await db.select({
    totalRevenue: sum(orders.total),
    orderCount: count(orders.id),
  }).from(orders);

  // 2. Engagement Pulse (Ademing)
  const [ademingEngagement] = await db.select({
    totalListenTime: sum(ademingStats.totalListenSeconds),
    avgStreak: sql<number>`avg(${ademingStats.streakDays})`,
  }).from(ademingStats);

  // 3. User Pulse (Unified)
  const [userCount] = await db.select({ count: count(users.id) }).from(users);
  
  // 4. Real-time Interactions (Voicy)
  const [chatCount] = await db.select({ count: count(chatConversations.id) }).from(chatConversations);

  // 5. Content Pulse
  const [actorCount] = await db.select({ count: count(actors.id) }).from(actors);
  const [workshopCount] = await db.select({ count: count(workshops.id) }).from(workshops);

  return {
    revenue: orderStats.totalRevenue || "0",
    orders: orderStats.orderCount || 0,
    users: userCount.count || 0,
    ademingListenTime: Math.round(Number(ademingEngagement.totalListenTime || 0) / 3600), // in hours
    avgStreak: Math.round(Number(ademingEngagement.avgStreak || 0)),
    chats: chatCount.count || 0,
    actors: actorCount.count || 0,
    workshops: workshopCount.count || 0
  };
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
    <ContainerInstrument className="space-y-4">
      {recentOrders.map((order) => (
        <ContainerInstrument key={order.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-black/5">
          <ContainerInstrument className="flex items-center gap-4">
            <ContainerInstrument className="w-10 h-10 rounded-full bg-va-primary/10 flex items-center justify-center text-va-primary">
              <ShoppingCart size={18} />
            </ContainerInstrument>
            <ContainerInstrument>
              <TextInstrument className="text-[15px] font-light">Order #{order.wpOrderId}</TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light">{order.user?.firstName} {order.user?.lastName}</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="text-right">
            <TextInstrument className="text-[15px] font-light">€ {order.total}</TextInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light">{new Date(order.createdAt!).toLocaleDateString()}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      ))}
    </ContainerInstrument>
  );
}

export default async function BackofficeDashboard() {
  const stats = await getSpotlightStats();

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <ContainerInstrument className="inline-block bg-black text-white text-[15px] font-light px-3 py-1 rounded-full mb-6 tracking-widest "><VoiceglotText translationKey="admin.dashboard.badge" defaultText="Voices" /></ContainerInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter leading-none mb-4"><VoiceglotText translationKey="admin.dashboard.title_part1" defaultText="Het " /><TextInstrument as="span" className="text-va-primary font-light"><VoiceglotText translationKey="admin.dashboard.title_part2" defaultText="overzicht." /></TextInstrument></HeadingInstrument>
          <TextInstrument className="text-xl text-va-black/40 font-light tracking-tight"><VoiceglotText translationKey="admin.dashboard.subtitle" defaultText="Real-time overzicht van het Voices ecosysteem." /></TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {/* 💰 COMMERCIAL CARD */}
          <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className="p-3 bg-green-500/10 text-green-600 rounded-2xl">
                <ShoppingCart size={24} />
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-va-black/20 tracking-widest"><VoiceglotText translationKey="admin.dashboard.card.voices" defaultText="Voices Agency" /></TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-4xl font-light tracking-tighter mb-1">€ {Number(stats.revenue).toLocaleString('nl-BE')}</TextInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest"><VoiceglotText translationKey="admin.dashboard.revenue" defaultText="Omzet" /></TextInstrument>
            <ContainerInstrument className="mt-6 pt-6 border-t border-black/5 flex justify-between">
              <ContainerInstrument>
                <TextInstrument className="text-lg font-light">{stats.orders}</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.orders" defaultText="Orders" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-lg font-light">{stats.actors}</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.voices" defaultText="Stemmen" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* 🧘 ENGAGEMENT CARD */}
          <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className="p-3 bg-va-primary/10 text-va-primary rounded-2xl">
                <Activity strokeWidth={1.5} size={24} />
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-va-black/20 tracking-widest"><VoiceglotText translationKey="admin.dashboard.card.ademing" defaultText="Ademing" /></TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-4xl font-light tracking-tighter mb-1">{stats.ademingListenTime}u</TextInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest"><VoiceglotText translationKey="admin.dashboard.listen_time" defaultText="Luistertijd" /></TextInstrument>
            <ContainerInstrument className="mt-6 pt-6 border-t border-black/5 flex justify-between">
              <ContainerInstrument>
                <TextInstrument className="text-lg font-light">{stats.avgStreak}d</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.streak" defaultText="Streak" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-lg font-light"><VoiceglotText translationKey="admin.dashboard.active" defaultText="Actief" /></TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.status" defaultText="Status" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* 👤 USER DNA CARD */}
          <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                <Users strokeWidth={1.5} size={24} / />
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-va-black/20 tracking-widest"><VoiceglotText translationKey="admin.dashboard.card.users" defaultText="Gebruikers" /></TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-4xl font-light tracking-tighter mb-1">{stats.users.toLocaleString('nl-BE')}</TextInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest"><VoiceglotText translationKey="admin.dashboard.profiles" defaultText="Unieke Profielen" /></TextInstrument>
            <ContainerInstrument className="mt-6 pt-6 border-t border-black/5 flex justify-between">
              <ContainerInstrument>
                <TextInstrument className="text-lg font-light">{stats.chats}</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.chats" defaultText="Chats" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-lg font-light">360°</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.visibility" defaultText="Zichtbaarheid" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          </ContainerInstrument>

          {/* 🎓 STUDIO & ACADEMY CARD */}
          <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm">
            <ContainerInstrument className="flex justify-between items-start mb-6">
              <ContainerInstrument className="p-3 bg-orange-500/10 text-orange-600 rounded-2xl">
                <Calendar strokeWidth={1.5} size={24} />
              </ContainerInstrument>
              <TextInstrument as="span" className="text-[15px] font-light text-va-black/20 tracking-widest"><VoiceglotText translationKey="admin.dashboard.card.studio" defaultText="Studio & Academy" /></TextInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-4xl font-light tracking-tighter mb-1">{stats.workshops}</TextInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light tracking-widest"><VoiceglotText translationKey="admin.dashboard.workshops" defaultText="Workshops" /></TextInstrument>
            <ContainerInstrument className="mt-6 pt-6 border-t border-black/5 flex justify-between">
              <ContainerInstrument>
                <TextInstrument className="text-lg font-light">16</TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.sessions" defaultText="Sessies" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="text-right">
                <TextInstrument className="text-lg font-light"><VoiceglotText translationKey="admin.dashboard.live" defaultText="Live" /></TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText translationKey="admin.dashboard.status" defaultText="Status" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContainerInstrument className="bg-white rounded-[40px] p-8 border border-black/[0.03] shadow-sm">
            <HeadingInstrument level={2} className="text-xl font-light tracking-tighter mb-8 italic"><VoiceglotText translationKey="admin.dashboard.recent_activity" defaultText="Activiteit" /></HeadingInstrument>
            <RecentActivity />
          </ContainerInstrument>
          
          <ContainerInstrument className="bg-black text-white rounded-[40px] p-8 border border-black/[0.03] shadow-lg overflow-hidden relative">
            <ContainerInstrument className="relative z-10">
              <HeadingInstrument level={2} className="text-xl font-light tracking-tighter mb-4 italic"><VoiceglotText translationKey="admin.dashboard.ai_title" defaultText="Intelligence" /><TextInstrument className="text-white/60 text-[15px] mb-8 font-light"><VoiceglotText translationKey="admin.dashboard.ai_subtitle" defaultText="Analyse van het platform..." /></TextInstrument></HeadingInstrument>
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="p-4 bg-white/10 rounded-xl border border-white/10">
                  <TextInstrument className="text-[15px] font-light text-va-primary mb-1"><VoiceglotText translationKey="admin.dashboard.insight_label_1" defaultText="Inzicht #1" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText 
                      translationKey="admin.dashboard.insight_1" 
                      defaultText="&quot;80% van de Ademing-gebruikers toont interesse in professionele stemcoaching.&quot;" 
                    /></TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="p-4 bg-white/10 rounded-xl border border-white/10">
                  <TextInstrument className="text-[15px] font-light text-va-primary mb-1"><VoiceglotText translationKey="admin.dashboard.insight_label_2" defaultText="Inzicht #2" /></TextInstrument>
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText 
                      translationKey="admin.dashboard.insight_2" 
                      defaultText="&quot;De gemiddelde orderwaarde stijgt met 15% na een aanbeveling.&quot;" 
                    /></TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            {/* Liquid Gradient Background for the AI card */}
            <ContainerInstrument className="absolute inset-0 hmagic opacity-20 pointer-events-none" aria-hidden="true" />
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
