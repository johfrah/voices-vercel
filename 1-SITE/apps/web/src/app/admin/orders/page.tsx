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
  RefreshCw, 
  ShoppingBag, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

  interface Order {
    id: number;
    orderNumber: string;
    date: string;
    status: string;
    unit: string;
    customer: {
      name: string;
      email: string;
      company: string | null;
    } | null;
    finance: {
      net: string;
      total: string;
    };
    billing: {
      purchaseOrder: string | null;
      email: string | null;
    };
  }

interface PaginationData {
  page: number;
  limit: number;
  totalInDb: number;
  totalPages: number;
}

export default function BestellingenPage() {
  const { logAction } = useAdminTracking();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [expandedOrderData, setExpandedOrderData] = useState<any | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const toggleOrder = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setExpandedOrderData(null);
      return;
    }

    setExpandedOrderId(orderId);
    setIsExpanding(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedOrderData(data);
      }
    } catch (e) {
      console.error('Failed to fetch expanded order data:', e);
    } finally {
      setIsExpanding(false);
    }
  };

  const fetchOrders = useCallback(async (page = 1, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&limit=50&t=${Date.now()}`);
      console.log('🚀 [Admin Orders] API Response Status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data._debug) {
          console.log('🚨 [GODMODE DEBUG] API Context:', data._debug);
        } else if (data._error) {
          console.error('🚨 [GODMODE ERROR] API Critical:', data._error);
        }

        const ordersList = data.orders || [];
        setOrders(ordersList);
        setPagination(data.pagination || null);
        setCurrentPage(page);

        console.log('📦 [Admin Orders] Data received:', {
          count: ordersList.length,
          pagination: data.pagination
        });
      } else {
        const errorText = await res.text();
        console.error('❌ [Admin Orders] API Error:', errorText);
      }
    } catch (e) {
      console.error('❌ [Admin Orders] Fetch failed:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const searchLower = (search || '').toLowerCase();
    
    const matchesSearch = 
      (order.orderNumber?.toLowerCase().includes(searchLower) ?? false) ||
      (order.customer?.email?.toLowerCase().includes(searchLower) ?? false) ||
      (order.customer?.company?.toLowerCase().includes(searchLower) ?? false) ||
      (order.customer?.name?.toLowerCase().includes(searchLower) ?? false);
    
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && (order.status === 'completed_paid' || order.status === 'completed')) ||
      (filter === 'pending' && (order.status === 'awaiting_payment' || order.status === 'pending' || order.status === 'completed_unpaid')) ||
      (filter === 'quote-pending' && order.status === 'quote-pending');
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed_paid':
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-medium tracking-widest uppercase"><CheckCircle2 size={10} /> Betaald</span>;
      case 'completed_unpaid':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium tracking-widest uppercase"><ShoppingBag size={10} /> In productie</span>;
      case 'awaiting_payment':
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[11px] font-medium tracking-widest uppercase"><Clock size={10} /> Wacht op kassa</span>;
      case 'quote-pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium tracking-widest uppercase"><FileText size={10} /> Offerte</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-medium tracking-widest uppercase"><AlertCircle size={10} /> Mislukt</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[11px] font-medium tracking-widest uppercase">{status}</span>;
    }
  };

  if (isLoading) return <LoadingScreenInstrument message="Bestellingen ophalen..." />;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        {/* Header Section */}
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-light px-3 py-1 rounded-full tracking-widest">
                <VoiceglotText translationKey="admin.orders.badge" defaultText="Bestellingen" />
              </ContainerInstrument>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter flex items-center gap-4">
                <VoiceglotText translationKey="admin.orders.title" defaultText="Bestellingen" />
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full tracking-[0.3em] uppercase font-bold animate-pulse">Nuclear V2</span>
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-light tracking-tight max-w-2xl">
                <VoiceglotText translationKey="admin.orders.subtitle" defaultText={`Beheer alle transacties, offertes en productiestatus van ${typeof window !== 'undefined' ? window.location.hostname : 'Voices'}.`} />
              </TextInstrument>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full md:w-auto mt-8 md:mt-0">
              <ButtonInstrument as={Link} href="/admin/orders/new" className="va-btn-pro !bg-va-black flex items-center gap-2 mb-1 w-full md:w-auto justify-center">
                <Plus strokeWidth={1.5} size={16} /> 
                <VoiceglotText translationKey="admin.orders.add" defaultText="Nieuwe Bestelling" />
              </ButtonInstrument>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                <input 
                  type="text"
                  placeholder="Zoek op ID, klant of bedrijf..."
                  className="pl-12 pr-6 py-3 bg-white border border-black/[0.03] rounded-[10px] text-[15px] font-light focus:ring-1 focus:ring-primary/30 outline-none w-full shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-white border border-black/[0.03] rounded-[10px] p-1 shadow-sm w-full md:w-auto overflow-x-auto">
                {['all', 'completed', 'pending', 'quote-pending'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-[8px] text-[13px] font-light tracking-tight transition-all whitespace-nowrap flex-1 md:flex-none ${filter === f ? 'bg-va-black text-white shadow-md' : 'text-va-black/40 hover:text-va-black'}`}
                  >
                    {f === 'all' ? 'Alles' : f === 'completed' ? 'Betaald' : f === 'pending' ? 'Wachtend' : 'Offertes'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionInstrument>

        {/* Nuclear V2 Banner */}
        <div className="mb-8 bg-va-black text-white p-4 rounded-[20px] flex items-center justify-between border border-primary/30 shadow-lg animate-in fade-in slide-in-from-top duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              <ShoppingBag size={20} />
            </div>
            <div>
              <TextInstrument className="text-[15px] font-medium tracking-tight text-white">Nuclear V2 Architecture Active</TextInstrument>
              <TextInstrument className="text-[11px] font-light text-white/40 tracking-widest uppercase">Zero-Slop Data Injection Mode</TextInstrument>
            </div>
          </div>
          <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
            Verified Live: v2.14.623
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[20px] border border-black/[0.03] shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Order</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Klant</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Datum</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Netto / Bruto</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">PO / B2B</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Status</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    onClick={() => toggleOrder(order.id)}
                    className={`group hover:bg-va-off-white/30 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-va-off-white/50' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`}>
                          <ChevronRight size={14} className="text-va-black/20" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-light text-va-black tracking-tight">#{order.orderNumber}</span>
                          <span className="text-[11px] font-light text-va-black/30 tracking-widest uppercase">{order.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-light text-va-black tracking-tight">
                            {order.customer?.name}
                          </span>
                          <span className="text-[12px] font-light text-va-black/40 tracking-tight">
                            {order.customer?.company || order.customer?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[14px] font-light text-va-black/60" suppressHydrationWarning>
                        {(() => {
                          if (!order.date) return '...';
                          try {
                            const date = new Date(order.date);
                            if (isNaN(date.getTime())) return 'Ongeldige datum';
                            return format(date, 'dd MMM yyyy', { locale: nl });
                          } catch (e) {
                            return 'Fout in datum';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-va-black tracking-tight">
                          €{parseFloat(order.finance?.net || "0").toFixed(2)}
                        </span>
                        <span className="text-[11px] font-light text-va-black/30 tracking-tight">
                          Bruto: €{parseFloat(order.finance?.total || "0").toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        {order.billing?.purchaseOrder ? (
                          <span className="text-[13px] font-medium text-primary tracking-tight">PO: {order.billing.purchaseOrder}</span>
                        ) : (
                          <span className="text-[13px] font-light text-va-black/20 tracking-tight">-</span>
                        )}
                        {order.billing?.email && (
                          <span className="text-[11px] font-light text-va-black/40 truncate max-w-[150px]" title={order.billing.email}>
                            {order.billing.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="p-2 rounded-[8px] hover:bg-white hover:shadow-sm text-va-black/40 hover:text-primary transition-all"
                          title="Bekijk Details"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={18} strokeWidth={1.5} />
                        </Link>
                        <button 
                          className="p-2 rounded-[8px] hover:bg-white hover:shadow-sm text-va-black/40 hover:text-va-black transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={18} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Atomic View */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-va-off-white/20 border-b border-black/[0.03]">
                      <td colSpan={7} className="px-12 py-10">
                        {isExpanding ? (
                          <div className="flex items-center gap-3 text-va-black/20 font-light italic">
                            <Loader2 className="animate-spin" size={16} />
                            Gegevens ophalen...
                          </div>
                        ) : expandedOrderData ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in slide-in-from-left duration-500">
                            
                            {/* 💰 FINANCIEEL (V2) */}
                            <div className="space-y-4">
                              <HeadingInstrument level={4} className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Financieel Overzicht</HeadingInstrument>
                              <div className="bg-white p-5 rounded-[15px] border border-primary/10 shadow-sm space-y-3">
                                <div className="flex justify-between border-b border-black/5 pb-2">
                                  <span className="text-[12px] text-va-black/40 font-light">Netto Omzet</span>
                                  <span className="text-[14px] font-medium">€{expandedOrderData.finance?.net || '0.00'}</span>
                                </div>
                                <div className="flex justify-between border-b border-black/5 pb-2">
                                  <span className="text-[12px] text-va-black/40 font-light">Inkoop (COG)</span>
                                  <span className="text-[14px] font-medium text-va-black/60">€{expandedOrderData.finance?.cost || '0.00'}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                  <span className="text-[12px] font-medium text-primary">Marge</span>
                                  <div className="text-right">
                                    <div className="text-[14px] font-bold text-primary">€{expandedOrderData.finance?.margin || '0.00'}</div>
                                    <div className="text-[10px] text-primary/60 font-medium uppercase tracking-wider">{expandedOrderData.finance?.marginPercentage || '0%'}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[11px] text-va-black/30 font-light italic px-1">
                                Betaalmethode: {expandedOrderData.finance?.method || 'Onbekend'}
                              </div>
                            </div>

                            {/* 🎭 PRODUCTIE & SCRIPT (V2) */}
                            <div className="md:col-span-2 space-y-4">
                              <HeadingInstrument level={4} className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase Raleway">Productie & Script</HeadingInstrument>
                              <div className="bg-white p-5 rounded-[15px] border border-black/[0.03] shadow-sm space-y-4 min-h-[140px]">
                                {expandedOrderData.production?.briefing?.text ? (
                                  <div className="space-y-3">
                                    <div className="text-[13px] font-light leading-relaxed text-va-black/80 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                      {expandedOrderData.production.briefing.text.split('\n').map((line: string, i: number) => (
                                        <p key={i} className="mb-2">
                                          {line.split(/(\(.*?\))/g).map((part, j) => 
                                            part.startsWith('(') && part.endsWith(')') ? 
                                              <span key={j} className="text-primary font-medium bg-primary/5 px-1 rounded">{part}</span> : part
                                          )}
                                        </p>
                                      ))}
                                    </div>
                                    {expandedOrderData.production.briefing.audioLink && (
                                      <a href={expandedOrderData.production.briefing.audioLink} target="_blank" className="inline-flex items-center gap-2 text-[11px] text-primary hover:underline font-medium">
                                        <ShoppingBag size={12} /> Audio Referentie Openen
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-[13px] italic text-va-black/20 flex items-center justify-center h-full">Geen script gevonden.</div>
                                )}
                              </div>
                              
                              {/* Participant Info voor Studio/Academy */}
                              {expandedOrderData.production?.participants && (
                                <div className="bg-va-black/5 p-4 rounded-[12px] border border-black/5">
                                  <div className="text-[10px] uppercase tracking-widest text-va-black/40 mb-1 font-bold">Deelnemers</div>
                                  <div className="text-[12px] font-light">{typeof expandedOrderData.production.participants === 'string' ? expandedOrderData.production.participants : JSON.stringify(expandedOrderData.production.participants)}</div>
                                </div>
                              )}
                            </div>

                            {/* ⚡ ACTIES (V2) */}
                            <div className="space-y-4">
                              <HeadingInstrument level={4} className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Regie Acties</HeadingInstrument>
                              <div className="flex flex-col gap-2">
                                {expandedOrderData.actions?.needsPO && (
                                  <button className="w-full py-2.5 px-4 bg-orange-500 text-white rounded-[10px] text-[12px] font-medium hover:bg-orange-600 transition-all shadow-sm flex items-center justify-center gap-2">
                                    <AlertCircle size={14} /> Vraag PO-nummer aan
                                  </button>
                                )}
                                {expandedOrderData.actions?.canGeneratePaymentLink && (
                                  <button className="w-full py-2.5 px-4 bg-primary text-white rounded-[10px] text-[12px] font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
                                    <ExternalLink size={14} /> Genereer Betaallink
                                  </button>
                                )}
                                {expandedOrderData.actions?.isYukiReady && (
                                  <button className="w-full py-2.5 px-4 bg-va-black text-white rounded-[10px] text-[12px] font-medium hover:bg-va-black/90 transition-all shadow-sm flex items-center justify-center gap-2">
                                    <RefreshCw size={14} /> Push naar Yuki
                                  </button>
                                )}
                                <Link href={`/admin/orders/${order.id}`} className="w-full py-2.5 px-4 bg-va-off-white text-va-black/60 rounded-[10px] text-[12px] font-medium hover:bg-va-off-white/80 transition-all text-center flex items-center justify-center gap-2">
                                  <ExternalLink size={14} /> Volledige Detailpagina
                                </Link>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="text-center text-red-500 italic">Fout bij laden van data.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-va-black/20">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <TextInstrument className="text-[15px] font-light">Geen bestellingen gevonden die voldoen aan je zoekopdracht.</TextInstrument>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[20px] border border-black/[0.03] shadow-sm">
            <div className="text-[13px] font-light text-va-black/40">
              Toont <span className="font-medium text-va-black">{(currentPage - 1) * pagination.limit + 1}</span> tot <span className="font-medium text-va-black">{Math.min(currentPage * pagination.limit, pagination.totalInDb)}</span> van <span className="font-medium text-va-black">{pagination.totalInDb}</span> bestellingen
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchOrders(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-[8px] border border-black/[0.03] disabled:opacity-30 hover:bg-va-off-white transition-all"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  if (pageNum <= 0 || pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchOrders(pageNum)}
                      className={`w-10 h-10 rounded-[8px] text-[13px] font-light transition-all ${currentPage === pageNum ? 'bg-va-black text-white shadow-md' : 'hover:bg-va-off-white text-va-black/40'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => fetchOrders(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-[8px] border border-black/[0.03] disabled:opacity-30 hover:bg-va-off-white transition-all"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </ContainerInstrument>

      {/* Fixed Action Dock */}
      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('orders_refresh');
            fetchOrders(currentPage, true);
          }}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          <RefreshCw strokeWidth={1.5} size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <VoiceglotText translationKey="admin.orders.refresh" defaultText="Vernieuwen" />
        </ButtonInstrument>
      </FixedActionDockInstrument>

      {/* LLM Context Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Bestellingen Dashboard",
            "description": "Operationeel overzicht van alle transacties en producties.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "order_management",
              "capabilities": ["view_orders", "filter_orders", "manage_status", "pagination"],
              "lexicon": ["Bestellingen", "Orders", "Transacties", "Offertes"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Chris-Protocol"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
