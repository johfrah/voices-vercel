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
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { logAction } = useAdminTracking();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`); 
      if (res.ok) {
        const found = await res.json();
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
                      Order #{order.orderNumber}
                    </HeadingInstrument>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-widest uppercase ${
                        order.status === 'Voltooid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <TextInstrument className="text-va-black/40 font-light tracking-tight" suppressHydrationWarning>
                    Geplaatst op {order.date ? format(new Date(order.date), 'PPPP', { locale: nl }) : '...'} • {order.unit}
                  </TextInstrument>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-light text-va-black/30 tracking-widest uppercase mb-1">Totaalbedrag</div>
                  <div className="text-4xl font-medium tracking-tighter text-va-black">€{order.finance?.total}</div>
                  <div className="mt-2 text-[11px] font-bold tracking-widest text-primary uppercase">
                    Marge: {order.finance?.marginPercentage} (€{order.finance?.margin})
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-black/[0.03]" />

              {/* ACTION CENTER */}
              <div className="bg-va-off-white/50 rounded-[20px] p-8 border border-primary/10 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Zap size={20} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] uppercase">Regiekamer Acties</HeadingInstrument>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.actions?.needsPO && (
                    <button className="flex items-center justify-between p-6 bg-white rounded-[15px] border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/5 flex items-center justify-center text-orange-500">
                          <AlertCircle size={18} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <div className="text-[15px] font-medium tracking-tight">Vraag PO-nummer aan</div>
                          <div className="text-[11px] font-light text-va-black/30 tracking-tight">Klant heeft nog geen PO opgegeven</div>
                        </div>
                      </div>
                      <Play size={14} className="text-va-black/10 group-hover:text-orange-500 transition-all" />
                    </button>
                  )}

                  {order.actions?.canGeneratePaymentLink && (
                    <button className="flex items-center justify-between p-6 bg-white rounded-[15px] border border-primary/20 hover:border-primary/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                          <CreditCard size={18} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <div className="text-[15px] font-medium tracking-tight">Genereer Betaallink</div>
                          <div className="text-[11px] font-light text-va-black/30 tracking-tight">Stuur betaalverzoek naar klant</div>
                        </div>
                      </div>
                      <Play size={14} className="text-va-black/10 group-hover:text-primary transition-all" />
                    </button>
                  )}

                  {order.actions?.isYukiReady && (
                    <button className="flex items-center justify-between p-6 bg-white rounded-[15px] border border-va-black/20 hover:border-va-black/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center text-va-black">
                          <RefreshCw size={18} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <div className="text-[15px] font-medium tracking-tight">Push naar Yuki</div>
                          <div className="text-[11px] font-light text-va-black/30 tracking-tight">Klaar voor facturatie</div>
                        </div>
                      </div>
                      <Play size={14} className="text-va-black/10 group-hover:text-va-black transition-all" />
                    </button>
                  )}
                </div>
              </div>

              {/* Briefing Section */}
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Productie & Briefing</HeadingInstrument>
                <div className="bg-va-off-white/20 p-8 rounded-[20px] border border-black/[0.02] space-y-6">
                  {order.production?.briefing?.text ? (
                    <div className="space-y-4">
                      <div className="text-[16px] font-light leading-relaxed text-va-black/80 whitespace-pre-wrap">
                        {order.production.briefing.text.split(/(\(.*?\))/g).map((part: string, i: number) => 
                          part.startsWith('(') && part.endsWith(')') ? 
                            <span key={i} className="text-primary font-medium bg-primary/5 px-1 rounded">{part}</span> : part
                        )}
                      </div>
                      {order.production.briefing.audioLink && (
                        <a href={order.production.briefing.audioLink} target="_blank" className="inline-flex items-center gap-2 text-[13px] text-primary hover:underline font-medium">
                          <ShoppingBag size={14} /> Audio Referentie Openen
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-[15px] italic text-va-black/20">Geen briefing gevonden voor deze bestelling.</div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Bestelde Items</HeadingInstrument>
                <div className="space-y-4">
                  {order.production?.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-[15px] border border-black/[0.02] bg-va-off-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center text-va-black/20 shadow-sm">
                          <Mic size={20} />
                        </div>
                        <div>
                          <div className="text-[16px] font-light tracking-tight">{item.name}</div>
                          <div className="text-[12px] font-light text-va-black/30 tracking-tight">Aantal: {item.quantity} • Inkoop: €{item.cost}</div>
                        </div>
                      </div>
                      <div className="text-[16px] font-medium tracking-tight">€{item.price}</div>
                    </div>
                  ))}
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
                    <div className="text-[15px] font-light tracking-tight">{order.customer?.name}</div>
                    <div className="text-[12px] font-light text-va-black/40 tracking-tight">{order.customer?.company || 'Particulier'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-va-black/20" strokeWidth={1.5} />
                  <div className="text-[14px] font-light text-va-black/60 truncate">{order.customer?.email}</div>
                </div>

                {order.customer?.vat && (
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-va-black/20" strokeWidth={1.5} />
                    <div className="text-[13px] font-light text-va-black/40">BTW: {order.customer.vat}</div>
                  </div>
                )}
              </div>

              <ButtonInstrument as={Link} href={`/admin/users?id=${order.technical?.sourceId}`} className="w-full va-btn-pro !bg-va-off-white !text-va-black/60 hover:!text-va-black flex items-center justify-center gap-2">
                Bekijk User DNA
              </ButtonInstrument>
            </div>

            {/* Finance Summary */}
            <div className="bg-va-black text-white rounded-[20px] p-8 space-y-6 shadow-xl">
              <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] text-white/30 uppercase">Financieel</HeadingInstrument>
              <div className="space-y-3">
                <div className="flex justify-between text-[14px] font-light">
                  <span className="text-white/40">Netto</span>
                  <span>€{order.finance?.net}</span>
                </div>
                <div className="flex justify-between text-[14px] font-light">
                  <span className="text-white/40">BTW (21%)</span>
                  <span>€{order.finance?.vat}</span>
                </div>
                <div className="h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between text-[18px] font-medium">
                  <span>Totaal</span>
                  <span className="text-primary">€{order.finance?.total}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-[11px] text-white/30 uppercase tracking-widest mb-1">Betaalmethode</div>
                <div className="text-[13px] font-light">{order.finance?.method}</div>
              </div>
            </div>
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
