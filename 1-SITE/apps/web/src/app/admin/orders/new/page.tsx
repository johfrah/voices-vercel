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
  Save, 
  User, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

interface UserOption {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  companyName: string | null;
}

interface OrderItemInput {
  name: string;
  quantity: number;
  price: string;
  actorId?: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { logAction } = useAdminTracking();
  
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState<number | 'new' | ''>('');
  const [journey, setJourney] = useState<'agency' | 'studio' | 'academy'>('agency');
  const [items, setItems] = useState<OrderItemInput[]>([{ name: '', quantity: 1, price: '0.00' }]);
  const [internalNotes, setInternalNotes] = useState('');
  const [syncToYuki, setSyncToYuki] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        console.error('Failed to fetch users:', e);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: '0.00' }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error('Selecteer een klant');
      return;
    }
    if (items.some(item => !item.name || parseFloat(item.price) <= 0)) {
      toast.error('Vul alle item details correct in');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          journey,
          items,
          internalNotes,
          syncToYuki,
          status: 'completed'
        })
      });

      if (res.ok) {
        const data = await res.json();
        logAction('order_created_manually', { orderId: data.id, syncToYuki });
        toast.success(`Order #${data.displayOrderId || data.id} succesvol aangemaakt!`);
        if (syncToYuki && data.yukiResult) {
          toast.success('Gezonken naar Yuki: ' + data.yukiResult.yukiId);
        }
        router.push('/admin/orders');
      } else {
        const err = await res.json();
        toast.error('Fout bij aanmaken order: ' + (err.error || 'Onbekende fout'));
      }
    } catch (e) {
      console.error('Submit error:', e);
      toast.error('Netwerkfout bij aanmaken order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return <LoadingScreenInstrument message="Systeem initialiseren..." />;
  if (isLoadingUsers) return <LoadingScreenInstrument message="Klantgegevens laden..." />;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-4xl mx-auto">
        {/* Header */}
        <SectionInstrument className="mb-12">
          <Link href="/admin/orders" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.orders.back_to_list" defaultText="Terug naar Overzicht" />
          </Link>
          
          <div className="space-y-4">
            <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-light px-3 py-1 rounded-full tracking-widest uppercase">
              Order Injectie
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
              Nieuwe Bestelling
            </HeadingInstrument>
            <TextInstrument className="text-xl text-black/40 font-light tracking-tight">
              Handmatige order toevoegen en direct factureren naar Yuki.
            </TextInstrument>
          </div>
        </SectionInstrument>

        <div className="grid grid-cols-1 gap-8">
          {/* Klant & Journey Sectie */}
          <div className="bg-white rounded-[20px] p-10 border border-black/[0.03] shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Selecteer Klant</label>
                <select 
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value === 'new' ? 'new' : parseInt(e.target.value))}
                  className="w-full p-4 bg-va-off-white/50 border border-black/[0.03] rounded-[10px] text-[15px] font-light focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                >
                  <option value="">-- Kies een klant --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.companyName || u.email})
                    </option>
                  ))}
                  <option value="new">+ Nieuwe Klant Aanmaken</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Journey</label>
                <div className="flex bg-va-off-white/50 border border-black/[0.03] rounded-[10px] p-1">
                  {(['agency', 'studio', 'academy'] as const).map((j) => (
                    <button
                      key={j}
                      onClick={() => setJourney(j)}
                      className={`flex-1 py-3 rounded-[8px] text-[13px] font-light tracking-tight transition-all ${journey === j ? 'bg-va-black text-white shadow-md' : 'text-va-black/40 hover:text-va-black'}`}
                    >
                      {j.charAt(0).toUpperCase() + j.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Items Sectie */}
          <div className="bg-white rounded-[20px] p-10 border border-black/[0.03] shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <HeadingInstrument level={3} className="text-[13px] font-light tracking-[0.2em] text-va-black/20 uppercase">Order Items</HeadingInstrument>
              <ButtonInstrument onClick={addItem} className="!bg-va-off-white !text-va-black/60 hover:!text-va-black flex items-center gap-2 py-2 px-4 text-[13px]">
                <Plus size={14} /> Item Toevoegen
              </ButtonInstrument>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_150px_50px] gap-4 items-end p-6 bg-va-off-white/20 rounded-[15px] border border-black/[0.02]">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium tracking-widest text-va-black/20 uppercase">Omschrijving</label>
                    <input 
                      type="text"
                      placeholder="Bijv. Voice-over opname..."
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full p-3 bg-white border border-black/[0.03] rounded-[8px] text-[14px] font-light outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium tracking-widest text-va-black/20 uppercase">Aantal</label>
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full p-3 bg-white border border-black/[0.03] rounded-[8px] text-[14px] font-light outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium tracking-widest text-va-black/20 uppercase">Prijs (€)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      className="w-full p-3 bg-white border border-black/[0.03] rounded-[8px] text-[14px] font-light outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="p-3 text-va-black/10 hover:text-red-500 transition-colors mb-0.5"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t border-black/[0.03]">
              <div className="text-right space-y-1">
                <div className="text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase">Totaal (Excl. BTW)</div>
                <div className="text-4xl font-medium tracking-tighter text-va-black">
                  €{calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Notities & Yuki Sectie */}
          <div className="bg-white rounded-[20px] p-10 border border-black/[0.03] shadow-sm space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-medium tracking-[0.2em] text-va-black/30 uppercase Raleway">Interne Notities</label>
              <textarea 
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Reden van handmatige invoer, afspraken, etc..."
                className="w-full h-32 p-4 bg-va-off-white/50 border border-black/[0.03] rounded-[10px] text-[14px] font-light focus:ring-1 focus:ring-primary/30 outline-none resize-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[15px] border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Calculator size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[15px] font-medium tracking-tight">Direct Yuki Factuur aanmaken</div>
                  <div className="text-[12px] font-light text-va-black/40 tracking-tight">De order wordt direct als 'verwerkt' naar Yuki gestuurd.</div>
                </div>
              </div>
              <button 
                onClick={() => setSyncToYuki(!syncToYuki)}
                className={`w-14 h-8 rounded-full transition-all relative ${syncToYuki ? 'bg-primary' : 'bg-va-black/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${syncToYuki ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </ContainerInstrument>

      {/* Fixed Action Dock */}
      <FixedActionDockInstrument>
        <ButtonInstrument 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="va-btn-pro !bg-va-black flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save strokeWidth={1.5} size={16} />
          )}
          Order Opslaan & Verwerken
        </ButtonInstrument>
      </FixedActionDockInstrument>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AdminPage",
            "name": "Nieuwe Handmatige Bestelling",
            "description": "Interface voor het injecteren van handmatige orders in het systeem.",
            "_llm_context": {
              "persona": "Architect",
              "journey": "admin",
              "intent": "order_injection",
              "capabilities": ["create_order", "yuki_sync", "user_selection"],
              "visual_dna": ["Bento Grid", "Action Dock", "Chris-Protocol"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
