"use client";

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument, LoadingScreenInstrument, LabelInstrument } from '@/components/ui/LayoutInstruments';
import { SpatialOrderTrackerInstrument } from '@/components/ui/SpatialOrderTrackerInstrument';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, CreditCard, Download, ExternalLink, FileText, Mic, Package, ShoppingBag } from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import nextDynamic from 'next/dynamic';

const LiquidBackground = nextDynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { ssr: false });

export const dynamic = 'force-dynamic';

interface OrderItemMetaData {
  usage?: string;
  mediaTypes?: string[];
  deliveryTime?: string;
  briefing?: string;
  script?: string;
}

interface OrderItem {
  id: number | string;
  name: string;
  price: string | number;
  metaData?: OrderItemMetaData;
  deliveryStatus?: 'waiting' | 'uploaded' | 'ready' | 'approved' | string;
  deliveryFileUrl?: string;
}

interface OrderRecord {
  id: number;
  wpOrderId?: number | string;
  status?: string;
  journey?: string;
  isQuote?: boolean;
  paymentMethod?: string;
  billingVatNumber?: string;
  ipAddress?: string;
  invoiceUrl?: string;
  invoice_url?: string;
  invoicePdfUrl?: string;
  invoice_pdf_url?: string;
  orderItems?: OrderItem[];
  total?: string | number;
  currency?: string;
  createdAt?: string;
  created_at?: string;
  date?: string;
  dateCreated?: string;
  date_created?: string;
}

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams?.get('orderId');
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOrderTotal = (order: OrderRecord): number => {
    if (order.total !== undefined && order.total !== null && order.total !== '') {
      const parsedTotal = Number(order.total);
      if (!Number.isNaN(parsedTotal)) {
        return parsedTotal;
      }
    }

    return (order.orderItems || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  const resolveOrderDate = (order: OrderRecord): string | null => {
    return order.createdAt || order.created_at || order.date || order.dateCreated || order.date_created || null;
  };

  const formatOrderDate = (order: OrderRecord): string => {
    const rawDate = resolveOrderDate(order);
    if (!rawDate) return t('order.date.unknown', 'Onbekend');

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return rawDate;

    return new Intl.DateTimeFormat('nl-BE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  };

  const resolveJourneyLabel = (journey?: string): string => {
    if (journey === 'agency') return t('order.journey.agency', 'Voice-over Project');
    if (journey === 'artist') return t('order.journey.artist', 'Artist Support');
    if (journey === 'studio') return t('order.journey.studio', 'Studio Productie');
    if (journey === 'ademing') return t('order.journey.ademing', 'Ademing Journey');
    return t('order.journey.default', 'Academy Workshop');
  };

  const getDeliveryLabel = (status?: string): string => {
    if (status === 'waiting') return t('order.item.status.waiting', 'In opname');
    if (status === 'uploaded' || status === 'ready') return t('order.item.status.ready', 'Klaar voor review');
    if (status === 'approved') return t('order.item.status.approved', 'Goedgekeurd');
    return t('order.item.status.processing', 'In verwerking');
  };

  const resolveInvoiceUrl = (order: OrderRecord): string | null => {
    return order.invoiceUrl || order.invoice_url || order.invoicePdfUrl || order.invoice_pdf_url || null;
  };

  const resolveHelpPath = (order: OrderRecord): string => {
    const journey = order.journey || '';
    if (journey === 'academy') return '/academy/contact';
    if (journey === 'studio') return '/studio/contact';
    if (journey === 'ademing') return '/ademing/contact';
    if (journey === 'artist') return '/contact';
    return '/agency/contact';
  };

  const getOrderStatusMeta = (status?: string) => {
    const normalized = String(status || 'pending').toLowerCase();
    if (normalized === 'completed' || normalized === 'approved') {
      return {
        badgeClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-200 dark:border-green-500/30',
        label: t('order.status.completed', 'Voltooid'),
        isSuccess: true,
        isIssue: false,
      };
    }
    if (normalized === 'paid') {
      return {
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30',
        label: t('order.status.paid', 'Betaald'),
        isSuccess: false,
        isIssue: false,
      };
    }
    if (normalized === 'failed') {
      return {
        badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30',
        label: t('order.status.failed', 'Betaling mislukt'),
        isSuccess: false,
        isIssue: true,
      };
    }
    if (normalized === 'cancelled') {
      return {
        badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30',
        label: t('order.status.cancelled', 'Geannuleerd'),
        isSuccess: false,
        isIssue: true,
      };
    }
    if (normalized === 'expired') {
      return {
        badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30',
        label: t('order.status.expired', 'Betaling verlopen'),
        isSuccess: false,
        isIssue: true,
      };
    }
    return {
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30',
      label: t('order.status.pending', 'Betaling in behandeling'),
      isSuccess: false,
      isIssue: false,
    };
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !user?.email) {
      setErrorMessage(null);
      setIsLoading(false);
      setOrdersList([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const forceRefresh = !!highlightedOrderId;
    const encodedEmail = encodeURIComponent(user.email);
    fetch(`/api/intelligence/customer-360?email=${encodedEmail}${forceRefresh ? '&forceRefresh=true' : ''}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('orders_fetch_failed');
        }
        return res.json();
      })
      .then(data => {
        setOrdersList(data.orders || []);
        setIsLoading(false);
        // Auto-expand highlighted order
        if (highlightedOrderId) {
          const parsedOrderId = Number(highlightedOrderId);
          if (!Number.isNaN(parsedOrderId)) {
            setExpandedOrders(prev => ({ ...prev, [parsedOrderId]: true }));
          }
        }
      })
      .catch(() => {
        setErrorMessage('Bestellingen konden niet geladen worden. Probeer opnieuw.');
        setIsLoading(false);
      });
  }, [isAuthLoading, isAuthenticated, user, highlightedOrderId]);

  useEffect(() => {
    if (!isAuthLoading) return;

    const timer = window.setTimeout(() => {
      setIsLoading(false);
      setErrorMessage('Sessiecontrole duurt langer dan verwacht. Herlaad de pagina.');
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [isAuthLoading]);

  useEffect(() => {
    if (highlightedOrderId && ordersList.length > 0) {
      const element = document.getElementById(`order-${highlightedOrderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedOrderId, ordersList]);

  if (isLoading) return <LoadingScreenInstrument text={t('account.orders.loading', "Bestellingen laden...")} />;

  return (
    <PageWrapperInstrument>
      <LiquidBackground />
      <ContainerInstrument className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20 relative z-10">
        <SectionInstrument className="mb-16">
          <Link  
            href="/account" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors mb-8 dark:text-white/50 dark:hover:text-primary"
          >
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="account.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          <ContainerInstrument className="space-y-4">
            <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-200 text-[15px] font-light tracking-widest border border-blue-500/20">
              <ShoppingBag strokeWidth={1.5} size={12} fill="currentColor" /> 
              <VoiceglotText  translationKey="account.orders.badge" defaultText="Besteloverzicht" />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-tight dark:text-white">
              <VoiceglotText  translationKey="account.orders.title_part1" defaultText="Mijn " />
              <TextInstrument as="span" className="text-primary font-light">
                <VoiceglotText  translationKey="account.orders.title_part2" defaultText="Bestellingen" />
              </TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="text-lg md:text-2xl font-light text-va-black/40 dark:text-white/60 leading-tight tracking-tight max-w-2xl">
              <VoiceglotText translationKey="account.orders.subtitle" defaultText="Volg je bestellingen in een compact overzicht en open details per rij." />
            </TextInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        {errorMessage && (
          <ContainerInstrument className="mb-8 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 flex items-center justify-between gap-4">
            <TextInstrument className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              {errorMessage}
            </TextInstrument>
            <ButtonInstrument
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              Opnieuw laden
            </ButtonInstrument>
          </ContainerInstrument>
        )}

        {ordersList.length > 0 ? (
          <ContainerInstrument className="bg-white/95 dark:bg-va-black/80 rounded-[28px] border border-black/[0.04] dark:border-white/10 shadow-aura overflow-hidden backdrop-blur">
            <ContainerInstrument className="hidden md:grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-6 px-8 py-5 border-b border-black/[0.04] dark:border-white/10">
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/35 dark:text-white/45">Bestelling</LabelInstrument>
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/35 dark:text-white/45">Datum</LabelInstrument>
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/35 dark:text-white/45">Status</LabelInstrument>
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/35 dark:text-white/45">Totaal</LabelInstrument>
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/35 dark:text-white/45 text-right">Acties</LabelInstrument>
            </ContainerInstrument>

            {ordersList.map((order: OrderRecord, index: number) => {
              const isHighlighted = highlightedOrderId === order.id.toString();
              const isExpanded = !!expandedOrders[order.id];
              const invoiceUrl = resolveInvoiceUrl(order);
              const helpPath = resolveHelpPath(order);
              const statusMeta = getOrderStatusMeta(order.status);
              const orderTotal = getOrderTotal(order);

              return (
                <ContainerInstrument
                  key={order.id}
                  id={`order-${order.id}`}
                  className={cn(
                    "border-t border-black/[0.04] dark:border-white/10",
                    index === 0 && "border-t-0",
                    isHighlighted && "bg-primary/[0.05] dark:bg-primary/10"
                  )}
                >
                  <ContainerInstrument
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpand(order.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleExpand(order.id);
                      }
                    }}
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-4 md:gap-6 px-5 py-5 md:px-8 md:py-5 cursor-pointer transition-colors",
                      "hover:bg-va-off-white/60 dark:hover:bg-white/5",
                      isExpanded && "bg-va-off-white/60 dark:bg-white/5"
                    )}
                  >
                    <ContainerInstrument className="space-y-2">
                      <ContainerInstrument className="flex items-center gap-3 flex-wrap">
                        <TextInstrument className={cn(
                          "text-[11px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border",
                          statusMeta.badgeClass,
                          !statusMeta.isSuccess && !statusMeta.isIssue && 'animate-pulse'
                        )}>
                          {statusMeta.label}
                        </TextInstrument>
                        {order.isQuote && (
                          <TextInstrument as="span" className="bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
                            <VoiceglotText translationKey="order.badge.quote" defaultText="Offerte" />
                          </TextInstrument>
                        )}
                      </ContainerInstrument>

                      <ContainerInstrument className="space-y-1">
                        <HeadingInstrument level={3} className="text-2xl md:text-[30px] font-light tracking-tight text-va-black dark:text-white">
                          {resolveJourneyLabel(order.journey)}
                        </HeadingInstrument>
                        <TextInstrument className="text-[12px] font-medium tracking-[0.14em] uppercase text-va-black/45 dark:text-white/50">
                          <VoiceglotText translationKey="order.number" defaultText={`Order #${order.wpOrderId || order.id}`} noTranslate={true} />
                        </TextInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>

                    <ContainerInstrument className="space-y-1">
                      <LabelInstrument className="md:hidden text-[10px] font-bold tracking-[0.2em] uppercase text-va-black/30 dark:text-white/40">Datum</LabelInstrument>
                      <TextInstrument className="text-[14px] font-medium text-va-black/70 dark:text-white/70">
                        {formatOrderDate(order)}
                      </TextInstrument>
                    </ContainerInstrument>

                    <ContainerInstrument className="space-y-1">
                      <LabelInstrument className="md:hidden text-[10px] font-bold tracking-[0.2em] uppercase text-va-black/30 dark:text-white/40">Status</LabelInstrument>
                      <TextInstrument className="text-[13px] font-medium text-va-black/60 dark:text-white/70">
                        {statusMeta.isIssue
                          ? t('order.status.needs_action', 'Actie vereist')
                          : statusMeta.isSuccess
                            ? t('order.status.delivered', 'Afgerond')
                            : t('order.status.active', 'Actief')}
                      </TextInstrument>
                    </ContainerInstrument>

                    <ContainerInstrument className="space-y-1">
                      <LabelInstrument className="md:hidden text-[10px] font-bold tracking-[0.2em] uppercase text-va-black/30 dark:text-white/40">Totaal</LabelInstrument>
                      <TextInstrument className="text-[18px] md:text-[20px] font-light tracking-tight text-va-black dark:text-white">
                        {SlimmeKassa.format(orderTotal)}
                      </TextInstrument>
                    </ContainerInstrument>

                    <ContainerInstrument className="flex items-center justify-end gap-2">
                      {invoiceUrl ? (
                        <ButtonInstrument
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                          as="a"
                          href={invoiceUrl}
                          target="_blank"
                          className="h-10 w-10 rounded-full bg-va-off-white dark:bg-white/10 border border-black/[0.03] dark:border-white/20 text-va-black/50 dark:text-white/70 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center"
                        >
                          <FileText strokeWidth={1.5} size={16} />
                        </ButtonInstrument>
                      ) : null}

                      <ButtonInstrument
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleExpand(order.id);
                        }}
                        className="h-10 w-10 rounded-full bg-va-off-white dark:bg-white/10 border border-black/[0.03] dark:border-white/20 text-va-black/60 dark:text-white/70 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-black/[0.04] dark:border-white/10 bg-va-off-white/50 dark:bg-white/[0.02]"
                      >
                        <ContainerInstrument className="px-5 py-6 md:px-8 md:py-8 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8">
                          <ContainerInstrument className="space-y-6">
                            <ContainerInstrument className="space-y-4">
                              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/25 dark:text-white/40 uppercase">
                                <VoiceglotText translationKey="order.section.ordered_items" defaultText="Bestelde Items" />
                              </LabelInstrument>

                              {order.orderItems && order.orderItems.length > 0 ? (
                                order.orderItems.map((item: OrderItem) => (
                                  <ContainerInstrument key={item.id} className="p-5 md:p-6 bg-white dark:bg-white/[0.03] rounded-2xl border border-black/[0.03] dark:border-white/10 space-y-5">
                                    <ContainerInstrument className="flex justify-between items-start gap-4">
                                      <ContainerInstrument className="flex items-center gap-4">
                                        <ContainerInstrument className="w-11 h-11 rounded-full bg-va-off-white dark:bg-white/10 flex items-center justify-center text-va-black/30 dark:text-white/60 border border-black/[0.02] dark:border-white/10">
                                        {order.journey === 'agency' ? <Mic size={20} /> : <Calendar size={20} />}
                                        </ContainerInstrument>
                                        <ContainerInstrument>
                                          <TextInstrument className="text-[16px] font-medium text-va-black dark:text-white">{item.name}</TextInstrument>
                                          <ContainerInstrument className="flex flex-wrap gap-2 mt-2">
                                          {item.metaData?.usage && (
                                            <TextInstrument as="span" className="px-2 py-0.5 bg-va-black/5 dark:bg-white/10 text-va-black/45 dark:text-white/70 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                              {item.metaData.usage}
                                            </TextInstrument>
                                          )}
                                          {item.metaData?.mediaTypes?.map((m: string) => (
                                            <TextInstrument as="span" key={m} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">
                                              {m}
                                            </TextInstrument>
                                          ))}
                                          <TextInstrument as="span" className={cn(
                                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border inline-flex",
                                            item.deliveryStatus === 'ready' || item.deliveryStatus === 'uploaded' || item.deliveryStatus === 'approved' 
                                              ? "bg-green-500 text-white border-green-600 shadow-sm"
                                              : "bg-va-black/5 dark:bg-white/10 text-va-black/45 dark:text-white/70 border-black/5 dark:border-white/15"
                                          )}>
                                            {getDeliveryLabel(item.deliveryStatus)}
                                          </TextInstrument>
                                          </ContainerInstrument>
                                        </ContainerInstrument>
                                      </ContainerInstrument>
                                      <TextInstrument className="text-[18px] font-light text-va-black dark:text-white">{SlimmeKassa.format(Number(item.price) || 0)}</TextInstrument>
                                    </ContainerInstrument>

                                    {(item.metaData?.briefing || item.metaData?.script) && (
                                      <ContainerInstrument className="pt-5 border-t border-black/[0.03] dark:border-white/10">
                                        <LabelInstrument className="text-[10px] font-bold tracking-[0.2em] text-va-black/25 dark:text-white/40 uppercase mb-3 block">
                                        <VoiceglotText translationKey="order.section.script_briefing" defaultText="Jouw Script / Briefing" />
                                      </LabelInstrument>
                                        <TextInstrument className="bg-va-off-white dark:bg-white/5 p-4 rounded-xl border border-black/[0.02] dark:border-white/10 text-va-black/70 dark:text-white/75 leading-relaxed font-light text-[14px] whitespace-pre-wrap">
                                        &quot;{item.metaData.script || item.metaData.briefing}&quot;
                                        </TextInstrument>
                                      </ContainerInstrument>
                                    )}

                                    {(item.deliveryFileUrl && (item.deliveryStatus === 'ready' || item.deliveryStatus === 'approved')) && (
                                      <ContainerInstrument className="pt-5 border-t border-black/[0.03] dark:border-white/10">
                                        <ButtonInstrument
                                          as="a"
                                          href={item.deliveryFileUrl}
                                          target="_blank"
                                          onClick={(event) => event.stopPropagation()}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-va-black text-white dark:bg-primary dark:text-va-black hover:opacity-90 transition-opacity"
                                        >
                                          <Download size={16} />
                                          <VoiceglotText translationKey="order.item.download" defaultText="Download Audio" />
                                        </ButtonInstrument>
                                      </ContainerInstrument>
                                    )}
                                  </ContainerInstrument>
                                ))
                              ) : (
                                <ContainerInstrument className="p-6 rounded-2xl border border-black/[0.03] dark:border-white/10 bg-white dark:bg-white/[0.03]">
                                  <TextInstrument className="text-sm text-va-black/55 dark:text-white/70">
                                    <VoiceglotText translationKey="order.items.empty" defaultText="Er zijn nog geen items gekoppeld aan deze bestelling." />
                                  </TextInstrument>
                                </ContainerInstrument>
                              )}
                            </ContainerInstrument>
                          </ContainerInstrument>

                          <ContainerInstrument className="space-y-4">
                            <ContainerInstrument className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-black/[0.03] dark:border-white/10 space-y-5">
                              <ContainerInstrument className="space-y-4">
                                <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/25 dark:text-white/40 uppercase">
                                  <VoiceglotText translationKey="order.section.billing" defaultText="Facturatie" />
                                </LabelInstrument>
                                <ContainerInstrument className="text-[14px] font-light text-va-black/65 dark:text-white/75 leading-relaxed space-y-2">
                                  {order.billingVatNumber ? (
                                    <TextInstrument className="font-medium text-va-black dark:text-white">BTW: {order.billingVatNumber}</TextInstrument>
                                  ) : (
                                    <TextInstrument className="text-va-black/50 dark:text-white/60">
                                      <VoiceglotText translationKey="order.billing.not_available" defaultText="Geen BTW-nummer beschikbaar" />
                                    </TextInstrument>
                                  )}
                                  {order.ipAddress ? (
                                    <TextInstrument className="text-[11px] opacity-50">IP: {order.ipAddress}</TextInstrument>
                                  ) : null}
                                </ContainerInstrument>
                              </ContainerInstrument>

                              <ContainerInstrument className="pt-5 border-t border-black/[0.03] dark:border-white/10 space-y-4">
                                <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/25 dark:text-white/40 uppercase">
                                  <VoiceglotText translationKey="order.section.payment" defaultText="Betaling" />
                                </LabelInstrument>
                                <ContainerInstrument className="flex items-center gap-3 text-[14px] font-light text-va-black/65 dark:text-white/75">
                                  <CreditCard size={16} strokeWidth={1.5} />
                                  <TextInstrument as="span">
                                    {order.paymentMethod === 'banktransfer'
                                      ? <VoiceglotText translationKey="order.payment_method.banktransfer" defaultText="Overschrijving" />
                                      : <VoiceglotText translationKey="order.payment_method.online" defaultText="Online betaling" />}
                                  </TextInstrument>
                                </ContainerInstrument>
                              </ContainerInstrument>

                              <ContainerInstrument className="pt-5 border-t border-black/[0.03] dark:border-white/10">
                                <SpatialOrderTrackerInstrument
                                  status={order.status === 'completed' ? 'ready' : 'queued'}
                                  className="my-0"
                                />
                              </ContainerInstrument>
                            </ContainerInstrument>

                            <ContainerInstrument className="flex flex-col sm:flex-row gap-3">
                              {invoiceUrl ? (
                                <ButtonInstrument
                                  as="a"
                                  href={invoiceUrl}
                                  target="_blank"
                                  onClick={(event) => event.stopPropagation()}
                                  className="flex-1 rounded-xl border border-black/[0.04] dark:border-white/15 bg-white dark:bg-white/[0.03] px-4 py-3 text-sm font-medium text-va-black dark:text-white hover:border-primary/30 hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
                                >
                                  <FileText size={15} />
                                  <VoiceglotText translationKey="account.orders.invoice" defaultText="Factuur openen" />
                                  <ExternalLink size={14} />
                                </ButtonInstrument>
                              ) : (
                                <ButtonInstrument
                                  disabled
                                  className="flex-1 rounded-xl border border-black/[0.04] dark:border-white/15 bg-va-off-white/70 dark:bg-white/[0.02] px-4 py-3 text-sm font-medium text-va-black/35 dark:text-white/35 cursor-not-allowed"
                                >
                                  <VoiceglotText translationKey="account.orders.invoice_pending" defaultText="Factuur volgt" />
                                </ButtonInstrument>
                              )}

                              <ButtonInstrument
                                as={Link}
                                href={helpPath}
                                onClick={(event) => event.stopPropagation()}
                                className="flex-1 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/15 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-2"
                              >
                                <VoiceglotText translationKey="common.need_help" defaultText="Hulp nodig?" />
                              </ButtonInstrument>
                            </ContainerInstrument>
                          </ContainerInstrument>
                        </ContainerInstrument>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ContainerInstrument>
              );
            })}
          </ContainerInstrument>
        ) : (
          <ContainerInstrument className="bg-white/95 dark:bg-va-black/80 shadow-aura p-12 flex flex-col items-center justify-center text-center space-y-6 rounded-[28px] border border-black/[0.04] dark:border-white/10">
            <ContainerInstrument className="w-20 h-20 bg-va-off-white dark:bg-white/10 rounded-full flex items-center justify-center text-va-black/10 dark:text-white/40">
                <Package strokeWidth={1.5} size={40} />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-2">
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight dark:text-white">
                <VoiceglotText translationKey="account.orders.empty_title" defaultText="Geen actieve bestellingen" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/45 dark:text-white/65 font-light max-w-sm mx-auto">
                <VoiceglotText translationKey="account.orders.empty_text" defaultText="Je hebt op dit moment geen lopende projecten. Start een nieuwe casting om je eerste bestelling te plaatsen." />
              </TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/agency" className="va-btn-pro">
              <VoiceglotText translationKey="account.orders.empty_cta" defaultText="Start Nieuw Project" />
            </ButtonInstrument>
          </ContainerInstrument>
        )}
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
