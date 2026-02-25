"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  FixedActionDockInstrument,
  LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  ShoppingBag,
  Mic,
  Calendar,
  Mail,
  Phone,
  Building,
  CreditCard,
  Zap,
  ShieldCheck,
  Play,
  Send,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';

interface OrderDetail {
  id: number;
  wpOrderId: number;
  displayOrderId: string | null;
  total: string;
  status: string;
  journey: string;
  createdAt: string;
  isQuote: boolean;
  internal_notes: string | null;
  rawMeta: any;
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    companyName: string | null;
    phone: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressZip: string | null;
    addressCountry: string | null;
    vatNumber: string | null;
  } | null;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { logAction } = useAdminTracking();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`); 
      if (res.ok) {
        const found = await res.json();
        
        // 🎙️ DELIVERY TIME LOGIC (Anti-Hallucinatie)
        // We verrijken de order data met de specifieke delivery van de acteur indien beschikbaar
        if (found && found.rawMeta?.items) {
          const firstActorItem = found.rawMeta.items.find((item: any) => item.actorId);
          if (firstActorItem) {
            // We halen de acteur details op voor de specifieke delivery time
            try {
              const actorRes = await fetch(`/api/admin/actors/${firstActorItem.actorId}`);
              if (actorRes.ok) {
                const actorData = await actorRes.json();
                found.specificDeliveryTime = actorData.deliveryTime || 'binnen 48 uur';
              }
            } catch (actorErr) {
              console.warn('Could not fetch specific actor delivery time:', actorErr);
            }
          }
        }
        
        setOrder(found || null);
      }
    } catch (e) {
      console.error('Failed to fetch order details:', e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        logAction('order_status_update', { id, status: newStatus });
        await fetchOrder();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const [isNotifyingActor, setIsNotifyingActor] = useState<number | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState<number | null>(null);

  const sendReminder = async (actorId: number, itemData: any) => {
    setIsSendingReminder(actorId);
    try {
      const res = await fetch('/api/admin/notify/actor/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId, orderId: order?.id, itemData })
      });
      if (res.ok) {
        logAction('actor_reminder_sent', { actorId, orderId: order?.id });
        alert('Reminder succesvol verzonden naar de stemacteur.');
      } else {
        const err = await res.json();
        alert(`Fout bij verzenden reminder: ${err.error}`);
      }
    } catch (e) {
      console.error('Failed to send reminder:', e);
      alert('Er is een onbekende fout opgetreden bij het verzenden van de reminder.');
    } finally {
      setIsSendingReminder(null);
    }
  };

  const notifyActor = async (actorId: number, itemData: any) => {
    setIsNotifyingActor(actorId);
    try {
      const res = await fetch('/api/admin/notify/actor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId, orderId: order?.id, itemData })
      });
      if (res.ok) {
        logAction('actor_notified', { actorId, orderId: order?.id });
        alert('Opdracht succesvol verzonden naar de stemacteur.');
      } else {
        const err = await res.json();
        alert(`Fout bij verzenden: ${err.error}`);
      }
    } catch (e) {
      console.error('Failed to notify actor:', e);
      alert('Er is een onbekende fout opgetreden.');
    } finally {
      setIsNotifyingActor(null);
    }
  };

  if (isLoading) return <LoadingScreenInstrument message="Order details laden..." />;
  if (!order) return <div className="p-20 text-center">Order niet gevonden.</div>;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link href="/admin/orders" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-12">
          <ArrowLeft strokeWidth={1.5} size={12} /> 
          <VoiceglotText translationKey="admin.orders.back_to_list" defaultText="Terug naar Overzicht" />
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
          <div className="space-y-8">
            {/* Main Info Card */}
            <div className="bg-white rounded-[20px] p-12 border border-black/[0.03] shadow-sm space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
                      Order #{order.displayOrderId || order.wpOrderId}
                    </HeadingInstrument>
                    <div className="mt-2">
                      {order.status === 'completed' && <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-medium tracking-widest uppercase">Betaald</span>}
                      {order.status === 'pending' && <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[11px] font-medium tracking-widest uppercase">Wachtend</span>}
                      {order.status === 'quote-pending' && <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium tracking-widest uppercase">Offerte</span>}
                    </div>
                  </div>
                  <TextInstrument className="text-va-black/40 font-light tracking-tight" suppressHydrationWarning>
                    Geplaatst op {order.createdAt ? format(new Date(order.createdAt), 'PPPP', { locale: nl }) : '...'}
                  </TextInstrument>
                </div>
                  <div className="text-right">
                    <div className="text-[13px] font-light text-va-black/30 tracking-widest uppercase mb-1">Totaalbedrag</div>
                    <div className="text-4xl font-medium tracking-tighter text-va-black">€{parseFloat(order.total).toFixed(2)}</div>
                    {(order as any).specificDeliveryTime && (
                      <div className="mt-2 text-[11px] font-bold tracking-widest text-primary uppercase">
                        Levering: {(order as any).specificDeliveryTime}
                      </div>
                    )}
                  </div>
              </div>

              <div className="h-[1px] bg-black/[0.03]" />

              {/* HITL ACTION SECTION */}
              <div className="bg-va-off-white/50 rounded-[20px] p-8 border border-primary/10 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Zap size={20} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] uppercase">Voices Action Center (HITL)</HeadingInstrument>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    disabled={isUpdating || order.status === 'completed'}
                    onClick={() => updateStatus('briefing-validated')}
                    className="flex items-center justify-between p-6 bg-white rounded-[15px] border border-black/[0.03] hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ShieldCheck size={18} strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <div className="text-[15px] font-light tracking-tight">Valideer Briefing</div>
                        <div className="text-[11px] font-light text-va-black/30 tracking-tight">Stuur script naar acteur</div>
                      </div>
                    </div>
                    <Play size={14} className="text-va-black/10 group-hover:text-primary transition-all" />
                  </button>

                  <button 
                    disabled={isUpdating}
                    className="flex items-center justify-between p-6 bg-white rounded-[15px] border border-black/[0.03] hover:border-green-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/5 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <div className="text-[15px] font-light tracking-tight">Release naar Klant</div>
                        <div className="text-[11px] font-light text-va-black/30 tracking-tight">Audio is goedgekeurd</div>
                      </div>
                    </div>
                    <Play size={14} className="text-va-black/10 group-hover:text-green-500 transition-all" />
                  </button>
                </div>
              </div>

              {/* Order Content / Items */}
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Bestelde Items</HeadingInstrument>
                <div className="space-y-4">
                  {order.rawMeta?.items ? order.rawMeta.items.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col p-6 rounded-[15px] border border-black/[0.02] bg-va-off-white/20 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center text-va-black/20 shadow-sm">
                            {order.journey === 'agency' ? <Mic size={20} /> : <Calendar size={20} />}
                          </div>
                          <div>
                            <div className="text-[16px] font-light tracking-tight">{item.name || 'Naamloos Item'}</div>
                            <div className="text-[12px] font-light text-va-black/30 tracking-tight">Aantal: {item.quantity || 1}</div>
                          </div>
                        </div>
                        <div className="text-[16px] font-medium tracking-tight">€{parseFloat(item.price || 0).toFixed(2)}</div>
                      </div>
                      
                      {item.actorId && (
                        <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                          {item.deliveryStatus === 'waiting' && (
                            <ButtonInstrument 
                              onClick={() => sendReminder(item.actorId, item)}
                              disabled={isSendingReminder === item.actorId}
                              className="va-btn-pro !bg-va-off-white !text-va-black/60 flex items-center gap-2 py-2 px-4 text-[13px]"
                            >
                              {isSendingReminder === item.actorId ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <Clock size={14} />
                              )}
                              Stuur Reminder
                            </ButtonInstrument>
                          )}
                          <ButtonInstrument 
                            onClick={() => notifyActor(item.actorId, item)}
                            disabled={isNotifyingActor === item.actorId}
                            className="va-btn-pro !bg-va-black !text-white flex items-center gap-2 py-2 px-4 text-[13px]"
                          >
                            {isNotifyingActor === item.actorId ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Send size={14} />
                            )}
                            Stuur naar Stem
                          </ButtonInstrument>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="p-6 text-center text-va-black/20 font-light italic">Geen item details beschikbaar in meta-data.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Customer Card */}
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-6">
              <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase">Klant Gegevens</HeadingInstrument>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-primary mt-1" strokeWidth={1.5} />
                  <div>
                    <div className="text-[15px] font-light tracking-tight">{order.user?.first_name} {order.user?.last_name}</div>
                    <div className="text-[12px] font-light text-va-black/40 tracking-tight">{order.user?.companyName || 'Particulier'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-va-black/20" strokeWidth={1.5} />
                  <div className="text-[14px] font-light text-va-black/60 truncate">{order.user?.email}</div>
                </div>

                {order.user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-va-black/20" strokeWidth={1.5} />
                    <div className="text-[14px] font-light text-va-black/60">{order.user.phone}</div>
                  </div>
                )}

                <div className="flex items-start gap-3 pt-4 border-t border-black/[0.03]">
                  <Building size={16} className="text-va-black/20 mt-1" strokeWidth={1.5} />
                  <div className="text-[13px] font-light text-va-black/40 leading-relaxed">
                    {order.user?.addressStreet}<br />
                    {order.user?.addressZip} {order.user?.addressCity}<br />
                    {order.user?.addressCountry}
                  </div>
                </div>

                {order.user?.vatNumber && (
                  <div className="flex items-center gap-3 pt-2">
                    <CreditCard size={16} className="text-va-black/20" strokeWidth={1.5} />
                    <div className="text-[13px] font-light text-va-black/40">BTW: {order.user.vatNumber}</div>
                  </div>
                )}
              </div>

              <ButtonInstrument as={Link} href={`/admin/users?id=${order.user?.id}`} className="w-full va-btn-pro !bg-va-off-white !text-va-black/60 hover:!text-va-black flex items-center justify-center gap-2">
                Bekijk User DNA
              </ButtonInstrument>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-4">
              <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase">Interne Notities</HeadingInstrument>
              <textarea 
                className="w-full h-32 p-4 bg-va-off-white/50 border border-black/[0.03] rounded-[10px] text-[14px] font-light focus:ring-1 focus:ring-primary/30 outline-none resize-none transition-all"
                placeholder="Voeg een notitie toe voor het team..."
                defaultValue={order.internal_notes || ''}
              />
              <ButtonInstrument className="w-full va-btn-pro !bg-va-black">Opslaan</ButtonInstrument>
            </div>
          </div>
        </div>
      </ContainerInstrument>

      {/* LLM Context Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": `Order Details #${order.displayOrderId || order.wpOrderId}`,
            "description": "Gedetailleerd overzicht en actiecentrum voor een specifieke bestelling.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "order_detail_view",
              "capabilities": ["validate_briefing", "release_audio", "edit_notes"],
              "lexicon": ["Briefing", "Release", "HITL", "User DNA"],
              "visual_dna": ["Split-Screen", "Action Center"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
