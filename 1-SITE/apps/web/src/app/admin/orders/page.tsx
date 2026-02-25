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
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface Order {

  id: number;
  wpOrderId: number;
  displayOrderId: string | null;
  total: string;
  status: string;
  journey: string;
  createdAt: string;
  isQuote: boolean;
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    companyName: string | null;
  } | null;
}

export default function BestellingenPage() {
  const { logAction } = useAdminTracking();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await fetch('/api/admin/orders/');
      console.log('🚀 [Admin Orders] API Response Status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('📦 [Admin Orders] Data received:', {
          count: data.length,
          sample: data.slice(0, 2),
          totalInDb: data.length // Voorlopig even gelijk aan count
        });
        setOrders(data);
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
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const searchLower = (search || '').toLowerCase();
    
    const matchesSearch = 
      (order.displayOrderId?.toLowerCase().includes(searchLower) ?? false) ||
      (order.wpOrderId?.toString().includes(searchLower) ?? false) ||
      (order.user?.email?.toLowerCase().includes(searchLower) ?? false) ||
      (order.user?.companyName?.toLowerCase().includes(searchLower) ?? false) ||
      (order.user?.first_name?.toLowerCase().includes(searchLower) ?? false) ||
      (order.user?.last_name?.toLowerCase().includes(searchLower) ?? false);
    
    const matchesFilter = filter === 'all' || order.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-medium tracking-widest uppercase"><CheckCircle2 size={10} /> Betaald</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[11px] font-medium tracking-widest uppercase"><Clock size={10} /> Wachtend</span>;
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
                <VoiceglotText translationKey="admin.orders.badge" defaultText="Order Dashboard" />
              </ContainerInstrument>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
                <VoiceglotText translationKey="admin.orders.title" defaultText="Bestellingen" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-light tracking-tight max-w-2xl">
                <VoiceglotText translationKey="admin.orders.subtitle" defaultText={`Beheer alle transacties, offertes en productiestatus van ${typeof window !== 'undefined' ? window.location.hostname : 'Voices'}.`} />
              </TextInstrument>
            </div>
            
            <div className="flex gap-4 items-end">
              <ButtonInstrument as={Link} href="/admin/orders/new" className="va-btn-pro !bg-va-black flex items-center gap-2 mb-1">
                <Plus strokeWidth={1.5} size={16} /> 
                <VoiceglotText translationKey="admin.orders.add" defaultText="Nieuwe Bestelling" />
              </ButtonInstrument>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                <input 
                  type="text"
                  placeholder="Zoek op ID, klant of bedrijf..."
                  className="pl-12 pr-6 py-3 bg-white border border-black/[0.03] rounded-[10px] text-[15px] font-light focus:ring-1 focus:ring-primary/30 outline-none w-80 shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-white border border-black/[0.03] rounded-[10px] p-1 shadow-sm">
                {['all', 'completed', 'pending', 'quote-pending'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-[8px] text-[13px] font-light tracking-tight transition-all ${filter === f ? 'bg-va-black text-white shadow-md' : 'text-va-black/40 hover:text-va-black'}`}
                  >
                    {f === 'all' ? 'Alles' : f === 'completed' ? 'Betaald' : f === 'pending' ? 'Wachtend' : 'Offertes'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionInstrument>

        {/* Orders Table */}
        <div className="bg-white rounded-[20px] border border-black/[0.03] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Order</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Klant</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Datum</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Bedrag</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Status</th>
                <th className="px-8 py-5 text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-va-off-white/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-light text-va-black tracking-tight">#{order.displayOrderId || order.wpOrderId}</span>
                      <span className="text-[11px] font-light text-va-black/30 tracking-widest uppercase">{order.journey}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-light text-va-black tracking-tight">
                          {order.user?.first_name} {order.user?.last_name}
                        </span>
                        <span className="text-[12px] font-light text-va-black/40 tracking-tight">
                          {order.user?.companyName || order.user?.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[14px] font-light text-va-black/60" suppressHydrationWarning>
                      {(() => {
                        if (!order.createdAt) return '...';
                        try {
                          const date = new Date(order.createdAt);
                          if (isNaN(date.getTime())) return 'Ongeldige datum';
                          return format(date, 'dd MMM yyyy', { locale: nl });
                        } catch (e) {
                          return 'Fout in datum';
                        }
                      })()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[15px] font-medium text-va-black tracking-tight">
                      €{parseFloat(order.total).toFixed(2)}
                    </span>
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
                      >
                        <ExternalLink size={18} strokeWidth={1.5} />
                      </Link>
                      <button className="p-2 rounded-[8px] hover:bg-white hover:shadow-sm text-va-black/40 hover:text-va-black transition-all">
                        <MoreHorizontal size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
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
      </ContainerInstrument>

      {/* Fixed Action Dock */}
      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={() => {
            logAction('orders_refresh');
            fetchOrders(true);
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
              "capabilities": ["view_orders", "filter_orders", "manage_status"],
              "lexicon": ["Bestellingen", "Orders", "Transacties", "Offertes"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Chris-Protocol"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
