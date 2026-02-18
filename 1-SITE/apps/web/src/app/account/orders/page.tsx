"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';
import { SpatialOrderTrackerInstrument } from '@/components/ui/SpatialOrderTrackerInstrument';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, ExternalLink, FileText, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/intelligence/customer-360?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          setOrdersList(data.orders || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Orders Fetch Error:', err);
          setIsLoading(false);
        });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (highlightedOrderId && ordersList.length > 0) {
      const element = document.getElementById(`order-${highlightedOrderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedOrderId, ordersList]);

  if (isLoading) return <LoadingScreenInstrument message="Bestellingen laden..." />;

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <SectionInstrument className="mb-16">
        <Link  
          href="/account" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText  translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
        </Link>
        <ContainerInstrument className="space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-500 text-[15px] font-light tracking-widest border border-blue-500/10">
            <ShoppingBag strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="account.orders.badge" defaultText="Besteloverzicht" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter"><VoiceglotText  translationKey="account.orders.title_part1" defaultText="Mijn " /><TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="account.orders.title_part2" defaultText="Bestellingen" /></TextInstrument></HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light"><VoiceglotText  translationKey="account.orders.subtitle" defaultText="Volg de status van je voice-over projecten." /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        {ordersList.length > 0 ? (
          ordersList.map((order: any) => {
            const isHighlighted = highlightedOrderId === order.id.toString();
            
            return (
              <BentoCard 
                key={order.id}
                id={`order-${order.id}`}
                span="full" 
                className={cn(
                  "bg-white shadow-aura p-12 transition-all duration-500",
                  isHighlighted && "ring-2 ring-primary ring-offset-4"
                )}
              >
                <ContainerInstrument className="flex justify-between items-start mb-12">
                  <ContainerInstrument className="space-y-1">
                    <TextInstrument className={cn(
                      "text-[15px] font-light tracking-widest uppercase",
                      order.status === 'completed' ? 'text-green-500' : 'text-primary animate-pulse'
                    )}>
                      {order.status === 'completed' ? 'Voltooid' : 'In behandeling'}
                    </TextInstrument>
                    <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter">
                      {order.journey === 'agency' ? 'Voice-over Project' : 'Academy Workshop'}
                      <TextInstrument className="text-[15px] font-light text-va-black/40 tracking-widest ml-4">
                        Order #{order.wpOrderId || order.id}
                      </TextInstrument>
                    </HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="flex gap-4">
                    <ButtonInstrument className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm">
                      <FileText strokeWidth={1.5} size={18} className="opacity-40 group-hover:opacity-100" />
                      <span className="text-[13px] font-bold tracking-widest uppercase"><VoiceglotText translationKey="account.orders.invoice" defaultText="Factuur" /></span>
                    </ButtonInstrument>
                    <ButtonInstrument className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm">
                      <ExternalLink strokeWidth={1.5} size={18} className="opacity-40 group-hover:opacity-100" />
                      <span className="text-[13px] font-bold tracking-widest uppercase"><VoiceglotText translationKey="account.orders.details" defaultText="Details" /></span>
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>

                <SpatialOrderTrackerInstrument 
                  status={order.status === 'completed' ? 'ready' : 'queued'} 
                  className="my-8" 
                />
                
                {isHighlighted && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-primary/5 border border-primary/10 p-8 rounded-[24px] mt-12 mb-8 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-primary">
                      <Zap size={20} fill="currentColor" />
                      <HeadingInstrument level={4} className="text-xl font-light tracking-tight">
                        <VoiceglotText translationKey="account.orders.next_steps.title" defaultText="Wat gebeurt er nu?" />
                      </HeadingInstrument>
                    </div>
                    <TextInstrument className="text-[16px] text-va-black/60 font-light leading-relaxed">
                      {order.paymentMethod === 'banktransfer' ? (
                        <VoiceglotText 
                          translationKey="account.orders.next_steps.banktransfer" 
                          defaultText="We hebben je bestelling ontvangen. Zodra de betaling is verwerkt, gaat de stemacteur direct voor je aan de slag. Je ontvangt een pushbericht bij elke update." 
                        />
                      ) : (
                        <VoiceglotText 
                          translationKey="account.orders.next_steps.default" 
                          defaultText="Je project is succesvol gestart! De stemacteur is op de hoogte gebracht en de opname wordt ingepland. Je kunt hier de voortgang live volgen." 
                        />
                      )}
                    </TextInstrument>
                  </motion.div>
                )}
                
                <ContainerInstrument className="mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <ContainerInstrument className="flex items-center gap-3">
                    <ContainerInstrument className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      order.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                    )} />
                    <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/60">
                      {order.status === 'completed' 
                        ? 'Project succesvol opgeleverd' 
                        : 'Verwachte oplevering: binnen 48 uur'}
                    </TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="flex items-center gap-6">
                    <ButtonInstrument className="text-[15px] font-light tracking-widest text-va-black/30 hover:text-primary transition-colors">
                      Script bekijken
                    </ButtonInstrument>
                    <ButtonInstrument className="text-[15px] font-light tracking-widest text-primary hover:underline">
                      Hulp nodig?
                    </ButtonInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </BentoCard>
            );
          })
        ) : (
          <BentoCard span="full" className="bg-white shadow-aura p-12 flex flex-col items-center justify-center text-center space-y-6">
            <ContainerInstrument className="w-20 h-20 bg-va-off-white rounded-full flex items-center justify-center text-va-black/10">
              <Package strokeWidth={1.5} size={40} />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-2">
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">
                <VoiceglotText  translationKey="account.orders.empty_title" defaultText="Geen actieve bestellingen" />
                <TextInstrument className="text-va-black/40 font-light max-w-sm mx-auto">
                  <VoiceglotText  translationKey="account.orders.empty_text" defaultText="Je hebt op dit moment geen lopende projecten. Start een nieuwe casting om je eerste bestelling te plaatsen." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/agency" className="va-btn-pro"><VoiceglotText  translationKey="account.orders.empty_cta" defaultText="Start Nieuw Project" /></ButtonInstrument>
          </BentoCard>
        )}
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
