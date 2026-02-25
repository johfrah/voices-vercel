"use client";

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
import { cn } from '@/lib/utils/index';

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
  total: number;
  currency: string;
  itemsCount: number;
}

export default function OrdersPage() {
  useAdminTracking('Orders List');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : ''
      });
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.results) {
        setOrders(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Betaald':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-medium tracking-widest uppercase"><CheckCircle2 size={10} /> Betaald</span>;
      case 'In behandeling':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium tracking-widest uppercase"><ShoppingBag size={10} /> Productie</span>;
      case 'Wacht op betaling':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[11px] font-medium tracking-widest uppercase"><Clock size={10} /> Kassa</span>;
      case 'Offerte':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium tracking-widest uppercase"><FileText size={10} /> Offerte</span>;
      case 'Mislukt':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-medium tracking-widest uppercase"><AlertCircle size={10} /> Mislukt</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[11px] font-medium tracking-widest uppercase">{status}</span>;
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-va-off-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-va-black/40 font-light tracking-widest uppercase text-xs">Bestellingen ophalen...</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-va-off-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <div className="inline-block bg-primary/10 text-primary text-[13px] font-light px-3 py-1 rounded-full tracking-widest">
                <VoiceglotText translationKey="admin.orders.badge" defaultText="Bestellingen" />
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter flex items-center gap-4">
                <VoiceglotText translationKey="admin.orders.title" defaultText="Bestellingen" />
                <span className="hidden md:inline text-[10px] bg-primary text-white px-2 py-0.5 rounded-full tracking-[0.3em] uppercase font-bold animate-pulse">Nuclear V2</span>
              </h1>
              <p className="text-xl text-black/40 font-light tracking-tight max-w-2xl">
                <VoiceglotText translationKey="admin.orders.subtitle" defaultText={`Beheer alle transacties, offertes en productiestatus van ${typeof window !== 'undefined' ? window.location.hostname : 'Voices'}.`} />
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full md:w-auto mt-8 md:mt-0">
              <Link href="/admin/orders/new" className="va-btn-pro !bg-va-black flex items-center gap-2 mb-1 w-full md:w-auto justify-center">
                <Plus strokeWidth={1.5} size={16} /> 
                <VoiceglotText translationKey="admin.orders.add" defaultText="Nieuwe Bestelling" />
              </Link>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
                <input 
                  type="text"
                  placeholder="Zoek op ID, klant of bedrijf..."
                  className="w-full bg-white border-none rounded-xl px-12 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-va-black/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['all', 'Betaald', 'In behandeling', 'Wacht op betaling', 'Offerte', 'Mislukt'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[13px] font-bold tracking-widest uppercase transition-all border",
                statusFilter === status 
                  ? "bg-va-black text-white border-va-black shadow-lg" 
                  : "bg-white text-va-black/40 border-black/5 hover:border-black/10"
              )}
            >
              {status === 'all' ? 'Alle Status' : status}
            </button>
          ))}
          
          <button 
            onClick={fetchOrders}
            className="ml-auto w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 hover:text-primary transition-all hover:rotate-180 duration-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[32px] border border-black/[0.03] shadow-aura overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.03]">
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30">Order #</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30">Datum</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30">Klant</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30">Unit</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30 text-right">Totaal</th>
                  <th className="px-8 py-6 text-[11px] font-black tracking-[0.2em] uppercase text-va-black/30"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-va-off-white/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-[15px] font-bold tracking-tight text-va-black">#{order.orderNumber}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-va-black/60">{format(new Date(order.date), 'd MMM yyyy', { locale: nl })}</span>
                        <span className="text-[11px] text-va-black/30">{format(new Date(order.date), 'HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center text-va-black/20">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-va-black">{order.customer?.name || 'Onbekende Klant'}</span>
                          <span className="text-[12px] text-va-black/40">{order.customer?.company || order.customer?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black tracking-widest uppercase text-va-black/40">{order.unit}</span>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[16px] font-extralight tracking-tighter text-va-black">
                        {new Intl.NumberFormat('nl-BE', { style: 'currency', currency: order.currency }).format(order.total)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 hover:text-primary hover:border-primary/20 transition-all"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 hover:text-va-black transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-va-off-white flex items-center justify-center text-va-black/10">
                          <ShoppingBag size={32} />
                        </div>
                        <p className="text-va-black/40 font-light tracking-tight">Geen bestellingen gevonden die voldoen aan je criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-va-off-white/30 border-t border-black/[0.03] flex items-center justify-between">
              <span className="text-[13px] text-va-black/40 font-medium">
                Pagina {page} van {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 disabled:opacity-30 hover:text-primary transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/40 disabled:opacity-30 hover:text-primary transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
