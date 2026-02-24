"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument, LoadingScreenInstrument, LabelInstrument } from '@/components/ui/LayoutInstruments';
import { SpatialOrderTrackerInstrument } from '@/components/ui/SpatialOrderTrackerInstrument';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, FileText, Package, ShoppingBag, Zap, Mic, Calendar, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import nextDynamic from 'next/dynamic';

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams?.get('orderId');
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const forceRefresh = !!highlightedOrderId;
      fetch(`/api/intelligence/customer-360?email=${user.email}${forceRefresh ? '&forceRefresh=true' : ''}`)
        .then(res => res.json())
        .then(data => {
          setOrdersList(data.orders || []);
          setIsLoading(false);
          // Auto-expand highlighted order
          if (highlightedOrderId) {
            setExpandedOrders(prev => ({ ...prev, [parseInt(highlightedOrderId)]: true }));
          }
        })
        .catch(err => {
          console.error('Orders Fetch Error:', err);
          setIsLoading(false);
        });
    }
  }, [isAuthenticated, user, highlightedOrderId]);

  useEffect(() => {
    if (highlightedOrderId && ordersList.length > 0) {
      const element = document.getElementById(`order-${highlightedOrderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedOrderId, ordersList]);

  if (isLoading) return <LoadingScreenInstrument message={t('account.orders.loading', "Bestellingen laden...")} />;

  return (
    <PageWrapperInstrument>
      <LiquidBackground />
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
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
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-tight">
              <VoiceglotText  translationKey="account.orders.title_part1" defaultText="Mijn " />
              <TextInstrument as="span" className="text-primary font-light">
                <VoiceglotText  translationKey="account.orders.title_part2" defaultText="Bestellingen" />
              </TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-2xl">
              <VoiceglotText  translationKey="account.orders.subtitle" defaultText="Volg de status van je voice-over projecten." />
            </TextInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        <BentoGrid>
          {ordersList.length > 0 ? (
            ordersList.map((order: any) => {
              const isHighlighted = highlightedOrderId === order.id.toString();
              const isExpanded = !!expandedOrders[order.id];
              
              return (
                <BentoCard 
                  key={order.id}
                  id={`order-${order.id}`}
                  span="full" 
                  className={cn(
                    "bg-white shadow-aura p-8 md:p-12 transition-all duration-500",
                    isHighlighted && "ring-2 ring-primary ring-offset-4"
                  )}
                >
                  <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    <ContainerInstrument className="space-y-1">
                      <div className="flex items-center gap-3">
                        <TextInstrument className={cn(
                          "text-[13px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border",
                          order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-primary/5 text-primary border-primary/10 animate-pulse'
                        )}>
                          {order.status === 'completed' ? <VoiceglotText translationKey="order.status.completed" defaultText="Voltooid" /> : <VoiceglotText translationKey="order.status.processing" defaultText="In behandeling" />}
                        </TextInstrument>
                        {order.isQuote && (
                          <span className="bg-blue-50 text-blue-600 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-blue-100">Offerte</span>
                        )}
                      </div>
                      <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter pt-2">
                        {order.journey === 'agency' ? <VoiceglotText translationKey="order.journey.agency" defaultText="Voice-over Project" /> : (order.journey === 'artist' ? <VoiceglotText translationKey="order.journey.artist" defaultText="Artist Support" /> : <VoiceglotText translationKey="order.journey.academy" defaultText="Academy Workshop" />)}
                        <TextInstrument className="text-[15px] font-light text-va-black/40 tracking-widest ml-4">
                          <VoiceglotText translationKey="order.number" defaultText={`Order #${order.wpOrderId || order.id}`} noTranslate={true} />
                        </TextInstrument>
                      </HeadingInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="flex flex-wrap gap-3">
                      <ButtonInstrument 
                        onClick={() => toggleExpand(order.id)}
                        className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <span className="text-[13px] font-bold tracking-widest uppercase">{isExpanded ? 'Verberg Details' : 'Toon Details'}</span>
                      </ButtonInstrument>
                      <ButtonInstrument className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-va-off-white hover:bg-va-black hover:text-white transition-all group shadow-sm">
                        <FileText strokeWidth={1.5} size={18} className="opacity-40 group-hover:opacity-100" />
                        <span className="text-[13px] font-bold tracking-widest uppercase"><VoiceglotText translationKey="account.orders.invoice" defaultText="Factuur" /></span>
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  {/* 🛡️ CHRIS-PROTOCOL: Masterclass Content View (v2.14.340) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 mb-12">
                          <div className="space-y-8">
                            {/* Order Items Breakdown */}
                            <div className="space-y-4">
                              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Bestelde Items</LabelInstrument>
                              {order.orderItems?.map((item: any) => (
                                <div key={item.id} className="p-8 bg-va-off-white/50 rounded-[24px] border border-black/[0.03] space-y-6">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-va-black/20 shadow-sm border border-black/[0.02]">
                                        {order.journey === 'agency' ? <Mic size={20} /> : <Calendar size={20} />}
                                      </div>
                                      <div>
                                        <TextInstrument className="text-[18px] font-medium text-va-black">{item.name}</TextInstrument>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {item.metaData?.usage && (
                                            <span className="px-2 py-0.5 bg-va-black/5 text-va-black/40 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                              {item.metaData.usage}
                                            </span>
                                          )}
                                          {item.metaData?.mediaTypes?.map((m: string) => (
                                            <span key={m} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">
                                              {m}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <TextInstrument className="text-[20px] font-light text-va-black">{SlimmeKassa.format(parseFloat(item.price))}</TextInstrument>
                                    </div>
                                  </div>

                                  {/* 🎙️ THE SCRIPT BOX (Nuclear Restoration) */}
                                  {(item.metaData?.briefing || item.metaData?.script) && (
                                    <div className="mt-6 pt-6 border-t border-black/[0.03]">
                                      <LabelInstrument className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase mb-3 block">Jouw Script / Briefing</LabelInstrument>
                                      <div className="bg-white p-6 rounded-[15px] border border-black/[0.02] shadow-inner italic text-va-black/70 leading-relaxed font-light text-[15px] whitespace-pre-wrap">
                                        "{item.metaData.script || item.metaData.briefing}"
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sidebar Details */}
                          <div className="space-y-8">
                            <div className="bg-va-off-white/30 p-8 rounded-[24px] border border-black/[0.02] space-y-6">
                              <div className="space-y-4">
                                <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Facturatie</LabelInstrument>
                                <div className="text-[14px] font-light text-va-black/60 leading-relaxed">
                                  {order.billingVatNumber && <div className="font-medium text-va-black mb-1">BTW: {order.billingVatNumber}</div>}
                                  {order.ipAddress && <div className="text-[11px] opacity-40 mt-2">IP: {order.ipAddress}</div>}
                                </div>
                              </div>
                              
                              <div className="pt-6 border-t border-black/[0.03] space-y-4">
                                <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Betaling</LabelInstrument>
                                <div className="flex items-center gap-3 text-[14px] font-light text-va-black/60">
                                  <CreditCard size={16} strokeWidth={1.5} />
                                  <span>{order.paymentMethod === 'banktransfer' ? 'Overschrijving' : 'Online betaling'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ContainerInstrument>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                  
                  <ContainerInstrument className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <ContainerInstrument className="flex items-center gap-3">
                      <ContainerInstrument className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        order.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      )} />
                      <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/60">
                        {order.status === 'completed' 
                          ? <VoiceglotText translationKey="order.delivery.success" defaultText="Project succesvol opgeleverd" /> 
                          : <VoiceglotText translationKey="order.delivery.expected" defaultText={`Verwachte oplevering: ${order.orderItems?.[0]?.metaData?.deliveryTime || 'binnen 48 uur'}`} />}
                      </TextInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="flex items-center gap-6">
                      <ButtonInstrument className="text-[15px] font-light tracking-widest text-primary hover:underline">
                        <VoiceglotText translationKey="common.need_help" defaultText="Hulp nodig?" />
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
      </div>
    </PageWrapperInstrument>
  );
}
