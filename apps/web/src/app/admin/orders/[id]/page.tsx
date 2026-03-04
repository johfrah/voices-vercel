"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { 
  ArrowLeft, 
  CircleDollarSign,
  FileText,
  Loader2,
  User,
  ShoppingBag,
  Mic,
  Mail,
  CreditCard,
  Zap,
  Play,
  ExternalLink,
  LayoutGrid,
  ListChecks,
  BarChart3,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useParams } from 'next/navigation';

type DetailTab = 'overview' | 'production' | 'items' | 'finance' | 'timeline';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { logAction } = useAdminTracking();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [itemBusyId, setItemBusyId] = useState<number | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [itemDrafts, setItemDrafts] = useState<
    Record<number, { deliveryStatus: string; payoutStatus: string; deliveryFileUrl: string; invoiceFileUrl: string }>
  >({});
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [bulkDeliveryStatus, setBulkDeliveryStatus] = useState<string>('waiting');
  const [bulkPayoutStatus, setBulkPayoutStatus] = useState<string>('pending');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedStatusCode, setSelectedStatusCode] = useState<string>('awaiting_payment');
  const statusCatalog = Array.isArray(order?.statusManager?.available) ? order.statusManager.available : [];
  const statusOptionsWithCurrent = statusCatalog.some((option: any) => option.code === selectedStatusCode)
    ? statusCatalog
    : selectedStatusCode
      ? [
          {
            id: null,
            code: selectedStatusCode,
            label: `Huidige status (${selectedStatusCode})`,
            title: 'Onbekende status',
            adminAction: 'Geen mapping gevonden.',
            customerImpact: 'Geen mapping gevonden.',
          },
          ...statusCatalog,
        ]
      : statusCatalog;
  const selectedStatusInfo =
    statusOptionsWithCurrent.find((option: any) => option.code === selectedStatusCode) || null;
  const currentOrderStatusCode = order?.statusManager?.current?.code || order?.statusCode || 'awaiting_payment';

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

  useEffect(() => {
    const items = order?.production?.items || [];
    const nextDrafts: Record<
      number,
      { deliveryStatus: string; payoutStatus: string; deliveryFileUrl: string; invoiceFileUrl: string }
    > = {};
    items.forEach((item: any) => {
      nextDrafts[item.id] = {
        deliveryStatus: item.deliveryStatus || 'waiting',
        payoutStatus: item.payoutStatus || 'pending',
        deliveryFileUrl: item.deliveryFileUrl || '',
        invoiceFileUrl: item.invoiceFileUrl || '',
      };
    });
    setItemDrafts(nextDrafts);

    const nextSelections: Record<number, boolean> = {};
    items.forEach((item: any) => {
      nextSelections[item.id] = false;
    });
    setSelectedItems(nextSelections);
  }, [order]);

  useEffect(() => {
    setSelectedStatusCode(currentOrderStatusCode);
  }, [currentOrderStatusCode]);

  const saveOrderStatus = async () => {
    setIsUpdating(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: selectedStatusCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.error || 'Status kon niet bijgewerkt worden.');
        return;
      }
      logAction('order_status_update', { id, status: selectedStatusCode });
      setActionMessage('Orderstatus succesvol bijgewerkt.');
      await fetchOrder();
    } catch (e) {
      console.error('Failed to save order status:', e);
      setActionMessage('Statusupdate mislukt door netwerkfout.');
    } finally {
      setIsUpdating(false);
    }
  };

  const runOrderAction = async (action: 'request_po' | 'mark_in_production' | 'mark_delivered' | 'generate_payment_link') => {
    setIsUpdating(true);
    setActionBusy(action);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(data.error || 'Actie mislukt.');
        return;
      }
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      }
      logAction('order_action', { id, action });
      setActionMessage('Actie succesvol uitgevoerd.');
      await fetchOrder();
    } catch (e) {
      console.error('Failed order action:', e);
      setActionMessage('Actie mislukt door netwerkfout.');
    } finally {
      setActionBusy(null);
      setIsUpdating(false);
    }
  };

  const updateItemDraft = (itemId: number, patch: Partial<{ deliveryStatus: string; payoutStatus: string; deliveryFileUrl: string; invoiceFileUrl: string }>) => {
    setItemDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {
          deliveryStatus: 'waiting',
          payoutStatus: 'pending',
          deliveryFileUrl: '',
          invoiceFileUrl: '',
        }),
        ...patch,
      },
    }));
  };

  const patchOrderItem = async (
    itemId: number,
    draft: { deliveryStatus: string; payoutStatus: string; deliveryFileUrl: string; invoiceFileUrl: string }
  ) => {
    const res = await fetch(`/api/admin/orders/${id}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_status: draft.deliveryStatus,
        payout_status: draft.payoutStatus,
        delivery_file_url: draft.deliveryFileUrl || null,
        invoice_file_url: draft.invoiceFileUrl || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Item #${itemId} kon niet geüpdatet worden.`);
    }
  };

  const saveItem = async (itemId: number) => {
    const draft = itemDrafts[itemId];
    if (!draft) return;
    setIsUpdating(true);
    setItemBusyId(itemId);
    setActionMessage(null);
    try {
      await patchOrderItem(itemId, draft);
      logAction('order_item_update', { id, itemId });
      setActionMessage(`Item #${itemId} bijgewerkt.`);
      await fetchOrder();
    } catch (e) {
      console.error('Failed to update order item:', e);
      setActionMessage(`Netwerkfout bij item #${itemId}.`);
    } finally {
      setItemBusyId(null);
      setIsUpdating(false);
    }
  };

  const orderItems = useMemo(() => order?.production?.items || [], [order?.production?.items]);
  const selectedItemIds = useMemo(
    () => Object.entries(selectedItems).filter(([, isSelected]) => isSelected).map(([itemId]) => Number(itemId)),
    [selectedItems]
  );
  const allItemsSelected = orderItems.length > 0 && selectedItemIds.length === orderItems.length;

  const itemStats = useMemo(() => {
    return orderItems.reduce(
      (acc: { waiting: number; inReview: number; approved: number; delivered: number }, item: any) => {
        const status = item.deliveryStatus || 'waiting';
        if (status === 'in_review') acc.inReview += 1;
        else if (status === 'approved') acc.approved += 1;
        else if (status === 'delivered' || status === 'ready' || status === 'uploaded') acc.delivered += 1;
        else acc.waiting += 1;
        return acc;
      },
      { waiting: 0, inReview: 0, approved: 0, delivered: 0 }
    );
  }, [orderItems]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleAllItemSelection = () => {
    const shouldSelectAll = !allItemsSelected;
    const next: Record<number, boolean> = {};
    orderItems.forEach((item: any) => {
      next[item.id] = shouldSelectAll;
    });
    setSelectedItems(next);
  };

  const applyBulkToDrafts = () => {
    if (selectedItemIds.length === 0) {
      setActionMessage('Selecteer eerst minstens één item.');
      return;
    }

    setItemDrafts((prev) => {
      const next = { ...prev };
      selectedItemIds.forEach((itemId) => {
        const current = next[itemId] || {
          deliveryStatus: 'waiting',
          payoutStatus: 'pending',
          deliveryFileUrl: '',
          invoiceFileUrl: '',
        };
        next[itemId] = {
          ...current,
          deliveryStatus: bulkDeliveryStatus,
          payoutStatus: bulkPayoutStatus,
        };
      });
      return next;
    });

    setActionMessage(`Bulk draft toegepast op ${selectedItemIds.length} item(s).`);
  };

  const saveBulkItems = async () => {
    if (selectedItemIds.length === 0) {
      setActionMessage('Selecteer eerst minstens één item.');
      return;
    }

    setIsBulkSaving(true);
    setIsUpdating(true);
    setActionMessage(null);

    const failedItemIds: number[] = [];

    for (const itemId of selectedItemIds) {
      const draft = itemDrafts[itemId];
      if (!draft) {
        failedItemIds.push(itemId);
        continue;
      }
      try {
        await patchOrderItem(itemId, draft);
      } catch {
        failedItemIds.push(itemId);
      }
    }

    logAction('order_items_bulk_update', { id, count: selectedItemIds.length });

    if (failedItemIds.length === 0) {
      setActionMessage(`Alle ${selectedItemIds.length} item(s) succesvol bijgewerkt.`);
    } else {
      setActionMessage(`Gedeeltelijk bijgewerkt. Mislukt voor item(s): ${failedItemIds.join(', ')}`);
    }

    await fetchOrder();
    setIsBulkSaving(false);
    setIsUpdating(false);
  };

  const detailTabs: Array<{ id: DetailTab; label: string; icon: any }> = [
    { id: 'overview', label: 'Overzicht', icon: LayoutGrid },
    { id: 'production', label: 'Productie', icon: Mic },
    { id: 'items', label: 'Items', icon: ListChecks },
    { id: 'finance', label: 'Financieel', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: History },
  ];

  if (isLoading) return <LoadingScreenInstrument text="Order details laden..." />;
  if (!order) return <div className="p-20 text-center">Order niet gevonden.</div>;
  const recordingSessions = order.production?.recordingSessions || [];
  const timelineNotes = order.timeline?.notes || [];

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

              {/* KPI strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-[14px] border border-black/[0.05] bg-va-off-white/30 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-va-black/30 mb-1">Blockers</div>
                  <div className={`text-[13px] font-medium ${order.actions?.needsPO ? 'text-primary' : 'text-green-600'}`}>
                    {order.actions?.needsPO ? 'PO vereist' : 'Geen blocker'}
                  </div>
                  <div className="text-[11px] text-va-black/45 mt-1">
                    {order.actions?.canGeneratePaymentLink ? 'Betaallink mogelijk' : 'Geen betaallink actie'}
                  </div>
                </div>
                <div className="rounded-[14px] border border-black/[0.05] bg-va-off-white/30 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-va-black/30 mb-1">Items</div>
                  <div className="text-[13px] font-medium text-va-black/80">
                    {orderItems.length} totaal • {itemStats.waiting} waiting
                  </div>
                  <div className="text-[11px] text-va-black/45 mt-1">
                    {itemStats.inReview} in review • {itemStats.delivered + itemStats.approved} klaar
                  </div>
                </div>
                <div className="rounded-[14px] border border-black/[0.05] bg-va-off-white/30 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-va-black/30 mb-1">Productie</div>
                  <div className="text-[13px] font-medium text-va-black/80">
                    {recordingSessions.length} sessie(s)
                  </div>
                  <div className="text-[11px] text-va-black/45 mt-1">
                    Met scripts: {order.production?.recordingSummary?.withScripts ?? 0}
                  </div>
                </div>
                <div className="rounded-[14px] border border-black/[0.05] bg-va-off-white/30 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-va-black/30 mb-1">Financieel</div>
                  <div className="text-[13px] font-medium text-va-black/80">
                    Netto €{order.finance?.net} • BTW €{order.finance?.vat}
                  </div>
                  <div className="text-[11px] text-primary mt-1">
                    Marge {order.finance?.marginPercentage} (€{order.finance?.margin})
                  </div>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex flex-wrap gap-2 rounded-[16px] border border-black/[0.04] bg-va-off-white/30 p-2">
                {detailTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] tracking-wide transition-all ${
                        active
                          ? 'bg-white border border-primary/20 text-primary shadow-sm'
                          : 'text-va-black/50 hover:text-va-black/75'
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.5} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {actionMessage && (
                <div className="text-[12px] font-light text-va-black/50 bg-white border border-black/[0.04] rounded-[12px] px-4 py-3">
                  {actionMessage}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="rounded-[16px] border border-black/[0.04] bg-va-off-white/20 p-6 space-y-4">
                  <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.18em] uppercase text-va-black/35">
                    Operationeel overzicht
                  </HeadingInstrument>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] font-light text-va-black/65">
                    <div className="rounded-[12px] border border-black/[0.03] bg-white p-4">
                      <div className="uppercase tracking-widest text-[10px] text-va-black/30 mb-2">Huidige status</div>
                      <div className="text-[14px] text-va-black/80">{currentOrderStatusCode}</div>
                      <div className="text-[11px] text-va-black/45 mt-1">Yuki-ready: {order.actions?.isYukiReady ? 'Ja' : 'Nee'}</div>
                    </div>
                    <div className="rounded-[12px] border border-black/[0.03] bg-white p-4">
                      <div className="uppercase tracking-widest text-[10px] text-va-black/30 mb-2">Volgende prioriteit</div>
                      <div className="text-[14px] text-va-black/80">
                        {order.actions?.needsPO ? 'PO opvragen en status syncen' : 'Productieflow opvolgen'}
                      </div>
                      <div className="text-[11px] text-va-black/45 mt-1">
                        Gebruik het action dock rechts voor snelle statusupdates.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Productie & Script */}
              {activeTab === 'production' && (
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Productie & Script</HeadingInstrument>
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
                      {order.integration?.orderDownloadUrl && (
                        <a href={order.integration.orderDownloadUrl} target="_blank" className="inline-flex items-center gap-2 text-[13px] text-primary hover:underline font-medium">
                          <ExternalLink size={14} /> Dropbox Export Openen
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[15px] italic text-va-black/30">Geen globaal script op orderniveau gevonden.</div>
                      <div className="text-[12px] font-light text-va-black/45">
                        Script/briefing staat mogelijk op itemniveau. Bekijk hieronder elk besteld item voor script, notities, audiobriefing en prijscontext.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Order Items */}
              {activeTab === 'items' && (
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Bestelde Items</HeadingInstrument>
                <div className="rounded-[14px] border border-black/[0.04] bg-va-off-white/30 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-[12px] font-light text-va-black/70">
                      <input type="checkbox" checked={allItemsSelected} onChange={toggleAllItemSelection} />
                      Selecteer alle items ({orderItems.length})
                    </label>
                    <div className="text-[11px] text-va-black/45">{selectedItemIds.length} geselecteerd</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-[11px] font-light text-va-black/50 space-y-1">
                      <span className="block uppercase tracking-widest text-[10px]">Bulk delivery status</span>
                      <select
                        value={bulkDeliveryStatus}
                        onChange={(e) => setBulkDeliveryStatus(e.target.value)}
                        className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                      >
                        <option value="waiting">waiting</option>
                        <option value="in_review">in_review</option>
                        <option value="approved">approved</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </label>
                    <label className="text-[11px] font-light text-va-black/50 space-y-1">
                      <span className="block uppercase tracking-widest text-[10px]">Bulk payout status</span>
                      <select
                        value={bulkPayoutStatus}
                        onChange={(e) => setBulkPayoutStatus(e.target.value)}
                        className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="paid">paid</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={applyBulkToDrafts}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-black/[0.08] bg-white text-[12px] font-medium tracking-wide hover:border-primary/40"
                    >
                      Draft toepassen
                    </button>
                    <button
                      onClick={saveBulkItems}
                      disabled={isBulkSaving || selectedItemIds.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-primary/20 bg-primary/5 text-[12px] font-medium tracking-wide text-primary hover:bg-primary/10 disabled:opacity-60"
                    >
                      {isBulkSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                      Geselecteerde items opslaan
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {order.production?.items?.map((item: any) => {
                    const isMusicItem = item.itemType === 'music';
                    const draft = itemDrafts[item.id] || {
                      deliveryStatus: item.deliveryStatus || 'waiting',
                      payoutStatus: item.payoutStatus || 'pending',
                      deliveryFileUrl: item.deliveryFileUrl || '',
                      invoiceFileUrl: item.invoiceFileUrl || '',
                    };
                    return (
                      <div key={item.id} className="p-6 rounded-[15px] border border-black/[0.02] bg-va-off-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={!!selectedItems[item.id]}
                              onChange={() => toggleItemSelection(item.id)}
                              aria-label={`Selecteer item ${item.id}`}
                            />
                            <div className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center text-va-black/20 shadow-sm">
                              <Mic size={20} />
                            </div>
                            <div>
                              <div className="text-[16px] font-light tracking-tight">{item.name}</div>
                              <div className="text-[12px] font-light text-va-black/30 tracking-tight">
                                {isMusicItem
                                  ? `Muziekitem • Aantal: ${item.quantity} • Inkoop: €${item.cost}`
                                  : `${item.actorName ? `Stem: ${item.actorName} • ` : ''}Aantal: ${item.quantity} • Inkoop: €${item.cost}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[16px] font-medium tracking-tight">€{item.price}</div>
                            <div className="text-[11px] font-light text-va-black/30">Subtotaal €{item.subtotal}</div>
                          </div>
                        </div>

                        <div className="rounded-[12px] border border-black/[0.04] bg-white p-4 space-y-3">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-va-black/30">
                            {isMusicItem ? 'Muziekkeuze (itemniveau)' : 'Script & Briefing (itemniveau)'}
                          </div>

                          {isMusicItem ? (
                            <div className="space-y-3 text-[12px] font-light text-va-black/65">
                              <div>
                                <span className="font-medium text-va-black/75">Track:</span>{' '}
                                {item.music?.trackLabel || item.name || '-'}
                                {item.music?.trackId ? ` (${item.music.trackId})` : ''}
                              </div>
                              <div>
                                <span className="font-medium text-va-black/75">Gebruik:</span>{' '}
                                {(item.music?.modeLabels || []).length > 0 ? item.music.modeLabels.join(' • ') : 'Los muziekitem'}
                              </div>
                              {item.briefing?.notes && (
                                <div>
                                  <span className="font-medium text-va-black/75">Notities:</span> {item.briefing.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {item.briefing?.script ? (
                                <div className="whitespace-pre-wrap text-[13px] font-light text-va-black/80 leading-relaxed">
                                  {String(item.briefing.script || '')
                                    .split(/(\(.*?\))/g)
                                    .map((part: string, index: number) =>
                                      part.startsWith('(') && part.endsWith(')') ? (
                                        <span key={`script-tag-${item.id}-${index}`} className="text-primary font-medium bg-primary/5 px-1 rounded">
                                          {part}
                                        </span>
                                      ) : (
                                        <span key={`script-text-${item.id}-${index}`}>{part}</span>
                                      )
                                    )}
                                </div>
                              ) : (
                                <div className="text-[12px] italic text-va-black/35">Geen script op dit item gevonden.</div>
                              )}
                              {item.briefing?.notes && (
                                <div className="text-[12px] font-light text-va-black/60">
                                  <span className="font-medium text-va-black/70">Notities:</span> {item.briefing.notes}
                                </div>
                              )}
                              {(item.briefing?.audioBriefingUrl || (item.briefing?.attachments || []).length > 0) && (
                                <div className="flex flex-wrap items-center gap-3">
                                  {item.briefing?.audioBriefingUrl && (
                                    <a href={item.briefing.audioBriefingUrl} target="_blank" className="text-[11px] text-primary hover:underline">
                                      Audiobriefing
                                    </a>
                                  )}
                                  {(item.briefing?.attachments || []).map((attachment: string, index: number) => (
                                    <a key={`${item.id}-attachment-${index}`} href={attachment} target="_blank" className="text-[11px] text-primary hover:underline">
                                      Bijlage {index + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-light text-va-black/55">
                                <div>Woorden: {item.pricingContext?.words ?? '-'}</div>
                                <div>Journey: {item.pricingContext?.journey || '-'}</div>
                                <div>Usage: {item.pricingContext?.usage || '-'}</div>
                                <div>Media: {(item.pricingContext?.media || []).length > 0 ? item.pricingContext.media.join(', ') : '-'}</div>
                                <div>Spots: {item.pricingContext?.spots ?? '-'}</div>
                                <div>Jaren: {item.pricingContext?.years ?? '-'}</div>
                                <div>Live sessie: {typeof item.pricingContext?.liveSession === 'boolean' ? (item.pricingContext.liveSession ? 'Ja' : 'Nee') : '-'}</div>
                                <div>Land/Taal IDs: {item.pricingContext?.countryId ?? '-'} / {item.pricingContext?.languageId ?? '-'}</div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="text-[11px] font-light text-va-black/50 space-y-1">
                            <span className="block uppercase tracking-widest text-[10px]">Delivery status</span>
                            <select
                              value={draft.deliveryStatus}
                              onChange={(e) => updateItemDraft(item.id, { deliveryStatus: e.target.value })}
                              className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                            >
                              <option value="waiting">waiting</option>
                              <option value="in_review">in_review</option>
                              <option value="approved">approved</option>
                              <option value="delivered">delivered</option>
                            </select>
                          </label>
                          <label className="text-[11px] font-light text-va-black/50 space-y-1">
                            <span className="block uppercase tracking-widest text-[10px]">Payout status</span>
                            <select
                              value={draft.payoutStatus}
                              onChange={(e) => updateItemDraft(item.id, { payoutStatus: e.target.value })}
                              className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                            >
                              <option value="pending">pending</option>
                              <option value="approved">approved</option>
                              <option value="paid">paid</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </label>
                          <label className="text-[11px] font-light text-va-black/50 space-y-1 md:col-span-2">
                            <span className="block uppercase tracking-widest text-[10px]">Delivery file URL</span>
                            <input
                              type="url"
                              value={draft.deliveryFileUrl}
                              onChange={(e) => updateItemDraft(item.id, { deliveryFileUrl: e.target.value })}
                              className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                              placeholder="https://..."
                            />
                          </label>
                          <label className="text-[11px] font-light text-va-black/50 space-y-1 md:col-span-2">
                            <span className="block uppercase tracking-widest text-[10px]">Factuur file URL</span>
                            <input
                              type="url"
                              value={draft.invoiceFileUrl}
                              onChange={(e) => updateItemDraft(item.id, { invoiceFileUrl: e.target.value })}
                              className="w-full rounded-[10px] border border-black/[0.06] bg-white px-3 py-2 text-[13px] font-light outline-none"
                              placeholder="https://..."
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.deliveryFileUrl && (
                              <a href={item.deliveryFileUrl} target="_blank" className="text-[11px] text-primary hover:underline">
                                Delivery file
                              </a>
                            )}
                            {item.invoiceFileUrl && (
                              <a href={item.invoiceFileUrl} target="_blank" className="text-[11px] text-primary hover:underline">
                                Factuur file
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => saveItem(item.id)}
                            disabled={itemBusyId === item.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-black/[0.08] bg-white text-[12px] font-medium tracking-wide hover:border-primary/40 disabled:opacity-60"
                          >
                            {itemBusyId === item.id ? <Loader2 size={13} className="animate-spin" /> : null}
                            Item opslaan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Financieel detail */}
              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">
                    Financieel detail
                  </HeadingInstrument>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-[14px] border border-black/[0.04] bg-white p-5 space-y-2">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-va-black/35">Orderbedragen</div>
                      <div className="text-[13px] text-va-black/70">Netto: €{order.finance?.net}</div>
                      <div className="text-[13px] text-va-black/70">BTW: €{order.finance?.vat}</div>
                      <div className="text-[13px] text-va-black/70">Kost: €{order.finance?.cost}</div>
                      <div className="text-[13px] text-va-black/70">Marge: {order.finance?.marginPercentage} (€{order.finance?.margin})</div>
                      <div className="pt-2 text-[16px] font-medium text-va-black">Totaal: €{order.finance?.total}</div>
                    </div>
                    <div className="rounded-[14px] border border-black/[0.04] bg-white p-5 space-y-2">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-va-black/35">Facturatiecontext</div>
                      <div className="text-[13px] text-va-black/70">Facturatie e-mail: {order.billing?.email || '-'}</div>
                      <div className="text-[13px] text-va-black/70">PO: {order.billing?.purchaseOrder || '-'}</div>
                      <div className="text-[13px] text-va-black/70">Factuurnr: {order.billing?.invoiceNumber || '-'}</div>
                      <div className="text-[13px] text-va-black/70 break-all">Transactie: {order.billing?.transactionId || '-'}</div>
                      <div className="text-[12px] text-va-black/45 pt-2">Betaalmethode: {order.finance?.method || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording sessies */}
              {activeTab === 'production' && recordingSessions.length > 0 && (
                <div className="space-y-6">
                  <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">
                    Opnamesessies
                  </HeadingInstrument>
                  <div className="text-[12px] font-light text-va-black/45">
                    Deze sessies tonen technische productiecontext: gekoppeld item, status, aantal scriptversies en feedback-items.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-[10px] border border-black/[0.04] bg-white text-[12px] font-light text-va-black/60">
                      Totaal sessies: {order.production?.recordingSummary?.total ?? recordingSessions.length}
                    </div>
                    <div className="p-3 rounded-[10px] border border-black/[0.04] bg-white text-[12px] font-light text-va-black/60">
                      Met scripts: {order.production?.recordingSummary?.withScripts ?? '-'}
                    </div>
                    <div className="p-3 rounded-[10px] border border-black/[0.04] bg-white text-[12px] font-light text-va-black/60">
                      Met feedback: {order.production?.recordingSummary?.withFeedback ?? '-'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recordingSessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-[12px] border border-black/[0.04] bg-white gap-4">
                        <div className="text-[13px] font-light text-va-black/70 space-y-1">
                          <div>Sessie #{session.id} • item #{session.orderItemId || 'n/a'}</div>
                          <div className="text-[11px] text-va-black/45">
                            Scripts: {session.scriptsCount ?? 0} • Feedback: {session.feedbackCount ?? 0} • Conversatie: {session.conversationId || '-'}
                          </div>
                        </div>
                        <div className="text-[12px] font-medium text-va-black/60 uppercase tracking-wider">
                          {session.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tijdlijn / order notes */}
              {activeTab === 'timeline' && (
              <div className="space-y-6">
                <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">
                  Order Tijdlijn
                </HeadingInstrument>
                {timelineNotes.length > 0 ? (
                  <div className="space-y-3">
                    {timelineNotes.map((note: any) => (
                      <div key={note.id} className="p-4 rounded-[12px] border border-black/[0.04] bg-white space-y-1">
                        <div className="text-[12px] font-light text-va-black/40">
                          {note.createdAt ? format(new Date(note.createdAt), 'PPpp', { locale: nl }) : 'Onbekende datum'}
                          {' • '}
                          {note.isCustomerNote ? 'Klantnotitie' : 'Interne notitie'}
                        </div>
                        <div className="text-[13px] font-light text-va-black/75">{note.note}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] font-light text-va-black/35 italic">Nog geen ordernotities gevonden.</div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 lg:sticky lg:top-24">
            {/* Action Dock */}
            <div className="bg-white rounded-[20px] p-6 border border-primary/10 shadow-sm space-y-5">
              <div className="flex items-center gap-3 text-primary">
                <Zap size={18} strokeWidth={1.5} />
                <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] uppercase">Action Dock</HeadingInstrument>
              </div>

              <label className="text-[11px] font-light text-va-black/50 space-y-2 block">
                <span className="block uppercase tracking-widest text-[10px]">Orderstatus</span>
                <select
                  value={selectedStatusCode}
                  onChange={(e) => setSelectedStatusCode(e.target.value)}
                  className="w-full rounded-[12px] border border-primary/20 bg-white px-3 py-2 text-[13px] font-light tracking-tight text-va-black outline-none focus:border-primary/50"
                >
                  {statusOptionsWithCurrent.map((option: any) => (
                    <option key={`${option.id ?? 'x'}-${option.code}`} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={saveOrderStatus}
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border border-black/[0.1] bg-white text-[12px] font-medium tracking-wide hover:border-primary/40 disabled:opacity-60"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : null}
                Status opslaan
              </button>

              {selectedStatusInfo && (
                <div className="rounded-[12px] border border-black/[0.05] bg-va-off-white/20 px-4 py-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-va-black/35">Status effect</div>
                  <div className="text-[12px] font-light text-va-black/80">{selectedStatusInfo.title}</div>
                </div>
              )}

              <button
                onClick={() => runOrderAction('request_po')}
                disabled={!!actionBusy || isUpdating}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[12px] border border-black/[0.04] hover:border-yellow-500/30 disabled:opacity-60"
              >
                <span className="text-[12px] font-light">Vraag PO op</span>
                {actionBusy === 'request_po' ? <Loader2 size={13} className="text-yellow-600 animate-spin" /> : <Play size={13} className="text-va-black/20" />}
              </button>

              {order.actions?.canGeneratePaymentLink && (
                <button
                  onClick={() => runOrderAction('generate_payment_link')}
                  disabled={!!actionBusy || isUpdating}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[12px] border border-black/[0.04] hover:border-primary/30 disabled:opacity-60"
                >
                  <span className="text-[12px] font-light">Genereer betaallink</span>
                  {actionBusy === 'generate_payment_link' ? <Loader2 size={13} className="text-primary animate-spin" /> : <Play size={13} className="text-va-black/20" />}
                </button>
              )}
            </div>

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

                <div className="pt-3 border-t border-black/[0.05] space-y-2">
                  <div className="text-[11px] uppercase tracking-widest text-va-black/25">Facturatie</div>
                  <div className="text-[12px] font-light text-va-black/50">Facturatie e-mail: {order.billing?.email || '-'}</div>
                  <div className="text-[12px] font-light text-va-black/50">PO: {order.billing?.purchaseOrder || '-'}</div>
                  <div className="text-[12px] font-light text-va-black/50">Factuurnr: {order.billing?.invoiceNumber || '-'}</div>
                  <div className="text-[12px] font-light text-va-black/50 break-all">Transactie: {order.billing?.transactionId || '-'}</div>
                </div>
              </div>

              <ButtonInstrument as={Link} href={`/admin/users?id=${order.technical?.userId || order.technical?.sourceId}`} className="w-full va-btn-pro !bg-va-off-white !text-va-black/60 hover:!text-va-black flex items-center justify-center gap-2">
                Bekijk Klantprofiel
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
                <div className="flex justify-between text-[14px] font-light">
                  <span className="text-white/40">Cost</span>
                  <span>€{order.finance?.cost}</span>
                </div>
                <div className="flex justify-between text-[14px] font-light">
                  <span className="text-white/40">Marge</span>
                  <span>{order.finance?.marginPercentage} (€{order.finance?.margin})</span>
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
                {order.finance?.paymentMethod?.id && (
                  <div className="text-[11px] text-white/35 mt-1">
                    Handshake ID: {order.finance.paymentMethod.id} ({order.finance.paymentMethod.code})
                  </div>
                )}
                {order.finance?.paymentMethod?.behavior && (
                  <div className="text-[12px] text-white/55 mt-2 font-light leading-relaxed">
                    {order.finance.paymentMethod.behavior}
                  </div>
                )}
              </div>
            </div>

            {/* Integratie & bron */}
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-sm space-y-4">
              <HeadingInstrument level={3} className="text-[11px] font-medium tracking-[0.2em] text-va-black/20 uppercase">Integratie</HeadingInstrument>
              <div className="text-[12px] font-light text-va-black/50">Source order id: {order.technical?.sourceOrderId || order.technical?.sourceId || '-'}</div>
              <div className="text-[12px] font-light text-va-black/50">
                Handshake IDs: world {order.technical?.worldId ?? '-'} • journey {order.technical?.journeyId ?? '-'} • status {order.technical?.statusId ?? '-'} • payment {order.technical?.paymentMethodId ?? '-'}
              </div>
              <div className="text-[12px] font-light text-va-black/50">Meta keys: {order.technical?.metaKeyCount ?? '-'}</div>
              <div className="text-[12px] font-light text-va-black/50 break-all">Dropbox pad: {order.integration?.dropboxFolderPath || '-'}</div>
              {order.integration?.orderDownloadUrl && (
                <a href={order.integration.orderDownloadUrl} target="_blank" className="inline-flex items-center gap-2 text-[12px] text-primary hover:underline">
                  <ExternalLink size={14} />
                  Open order-download
                </a>
              )}
            </div>
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
