"use client";

import { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, Save, Loader2, DollarSign, Info, Construction } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SlimmeKassa, DEFAULT_KASSA_CONFIG } from '@/lib/pricing-engine';

/**
 *  ADMIN RATES PAGE (SLIMME KASSA 2026)
 * 
 * Beheer van de globale prijsstelling voor alle diensten en producten.
 * Deze pagina synchroniseert direct met de 'pricing_config' in Supabase app_configs.
 */
export default function TarievenPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(DEFAULT_KASSA_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error('Failed to fetch pricing config', e);
        toast.error('Kon tarieven niet laden.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'pricing_config', value: config })
      });
      if (res.ok) {
        toast.success('Tarieven succesvol bijgewerkt!');
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      toast.error('Fout bij opslaan van tarieven.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <SectionInstrument className="mb-12 flex justify-between items-end">
          <ContainerInstrument>
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
              <ArrowLeft strokeWidth={1.5} size={12} /> 
              <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
            </Link>
            
            <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
              Slimme Kassa Control
            </ContainerInstrument>
            
            <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
              Tarieven & Config
            </HeadingInstrument>
            
            <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
              Beheer de globale prijsstelling van de Freedom Machine. Wijzigingen zijn direct live.
            </TextInstrument>
          </ContainerInstrument>

          <ButtonInstrument 
            onClick={handleSave} 
            disabled={saving}
            className="va-btn-pro !bg-va-black flex items-center gap-2 mb-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Opslaan...' : 'Tarieven Opslaan'}
          </ButtonInstrument>
        </SectionInstrument>

        {/* Pricing Grid */}
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Base Prices Section */}
          <ContainerInstrument className="bg-white rounded-[32px] p-10 border border-black/[0.03] shadow-aura">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3">
              <DollarSign className="text-primary" size={24} /> Platform Tarieven
            </HeadingInstrument>

            <div className="space-y-6">
              <PriceInput 
                label="Standaard BSF (Commercial)" 
                value={config.basePrice} 
                onChange={(val) => updateField('basePrice', val)}
                description="De standaard 'Base Session Fee' voor commerciële projecten."
              />
              <PriceInput 
                label="Standaard Video (Unpaid)" 
                value={config.videoBasePrice} 
                onChange={(val) => updateField('videoBasePrice', val)}
                description="Het standaardtarief voor video (niet-commercieel)."
              />
              <PriceInput 
                label="Telefoonie Basis" 
                value={config.telephonyBasePrice} 
                onChange={(val) => updateField('telephonyBasePrice', val)}
                description="Het starttarief voor IVR/Telefoonie projecten."
              />
              <PriceInput 
                label="Telefoonie Setup Fee" 
                value={config.telephonySetupFee} 
                onChange={(val) => updateField('telephonySetupFee', val)}
                description="Vaste opstartkost voor telefoonie (in centen)."
                isCents
              />
              <PriceInput 
                label="Telefoonie Woordprijs" 
                value={config.telephonyWordPrice} 
                onChange={(val) => updateField('telephonyWordPrice', val)}
                description="Prijs per woord voor telefoonie (in centen)."
                isCents
              />
              <PriceInput 
                label="Video Woord Drempel" 
                value={config.videoWordThreshold} 
                onChange={(val) => updateField('videoWordThreshold', val)}
                description="Aantal woorden inbegrepen in de basisprijs voor video (bijv. 200)."
                isCents
              />
              <PriceInput 
                label="Video Woordtarief" 
                value={config.videoWordRate} 
                onChange={(val) => updateField('videoWordRate', val)}
                description="Prijs per extra woord voor video (in centen, bijv. 20)."
                isCents
              />
              <PriceInput 
                label="Telefoonie Woord Drempel" 
                value={config.telephonyWordThreshold} 
                onChange={(val) => updateField('telephonyWordThreshold', val)}
                description="Aantal woorden inbegrepen in de basisprijs voor telefoonie (bijv. 25)."
                isCents
              />
              <PriceInput 
                label="Woordtarief (Extra)" 
                value={config.wordRate} 
                onChange={(val) => updateField('wordRate', val)}
                description="Prijs per extra woord (in centen) bovenop de limiet."
                isCents
              />
              <PriceInput 
                label="Telefoonie Bulk Drempel" 
                value={config.telephonyBulkThreshold} 
                onChange={(val) => updateField('telephonyBulkThreshold', val)}
                description="Aantal woorden waarna het bulk-tarief ingaat (bijv. 750)."
                isCents
              />
              <PriceInput 
                label="Telefoonie Bulk Basis" 
                value={config.telephonyBulkBasePrice} 
                onChange={(val) => updateField('telephonyBulkBasePrice', val)}
                description="Vaste basisprijs voor bulk-telefoonie (in centen)."
                isCents
              />
              <PriceInput 
                label="Telefoonie Bulk Woordtarief" 
                value={config.telephonyBulkWordRate} 
                onChange={(val) => updateField('telephonyBulkWordRate', val)}
                description="Woordtarief voor bulk-telefoonie (in centen)."
                isCents
              />
            </div>
          </ContainerInstrument>

          {/* Surcharges Section */}
          <ContainerInstrument className="bg-white rounded-[32px] p-10 border border-black/[0.03] shadow-aura">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3">
              <Info className="text-primary" size={24} /> Toeslagen
            </HeadingInstrument>

            <div className="space-y-6">
              <PriceInput 
                label="Wachtmuziek Toeslag" 
                value={config.musicSurcharge} 
                onChange={(val) => updateField('musicSurcharge', val)}
                description="Vaste toeslag voor het toevoegen van muziek."
              />
              <PriceInput 
                label="BTW Percentage" 
                value={config.vatRate * 100} 
                onChange={(val) => updateField('vatRate', val / 100)}
                description="Het standaard BTW percentage (bijv. 21)."
                isPercentage
              />
            </div>
          </ContainerInstrument>

          {/* Academy & Studio Section */}
          <ContainerInstrument className="bg-white rounded-[32px] p-10 border border-black/[0.03] shadow-aura">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3">
              <Construction className="text-primary" size={24} /> Academy & Studio
            </HeadingInstrument>

            <div className="space-y-6">
              <PriceInput 
                label="Academy Prijs" 
                value={config.academyPrice} 
                onChange={(val) => updateField('academyPrice', val)}
                description="Prijs voor de online Academy cursus."
              />
              <PriceInput 
                label="Workshop Prijs" 
                value={config.workshopPrice} 
                onChange={(val) => updateField('workshopPrice', val)}
                description="Standaard prijs voor een fysieke workshop."
              />
            </div>
          </ContainerInstrument>

          {/* Johfrai AI Section */}
          <ContainerInstrument className="bg-white rounded-[32px] p-10 border border-black/[0.03] shadow-aura">
            <HeadingInstrument level={2} className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3">
              <Loader2 className="text-primary" size={24} /> Johfrai AI Plans
            </HeadingInstrument>

            <div className="space-y-6">
              <PriceInput 
                label="Basic Plan" 
                value={config.johfraiBasicPrice} 
                onChange={(val) => updateField('johfraiBasicPrice', val)}
                description="Maandelijkse prijs voor Johfrai Basic."
              />
              <PriceInput 
                label="Pro Plan" 
                value={config.johfraiProPrice} 
                onChange={(val) => updateField('johfraiProPrice', val)}
                description="Maandelijkse prijs voor Johfrai Pro."
              />
              <PriceInput 
                label="Studio Plan" 
                value={config.johfraiStudioPrice} 
                onChange={(val) => updateField('johfraiStudioPrice', val)}
                description="Maandelijkse prijs voor Johfrai Studio."
              />
            </div>
          </ContainerInstrument>

        </ContainerInstrument>

        {/* Disclaimer */}
        <ContainerInstrument className="mt-12 p-6 bg-primary/5 rounded-[20px] border border-primary/10">
          <TextInstrument className="text-[13px] text-primary/60 font-medium leading-relaxed">
            <strong>Let op:</strong> Deze prijzen zijn de globale defaults voor de Slimme Kassa. 
            Indien een stemacteur specifieke tarieven heeft ingesteld in hun profiel, zullen die tarieven voorrang krijgen op deze globale instellingen voor die specifieke acteur.
          </TextInstrument>
        </ContainerInstrument>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}

function PriceInput({ label, value, onChange, description, isCents = false, isPercentage = false }: any) {
  // We werken intern met centen, maar tonen euro's aan de admin
  const displayValue = isCents || isPercentage ? value : value / 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (isCents || isPercentage) {
      onChange(val);
    } else {
      onChange(Math.round(val * 100));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[15px] font-black tracking-widest uppercase text-va-black/40">{label}</label>
        <div className="relative flex items-center">
          {!isPercentage && <span className="absolute left-3 text-va-black/20 text-sm">€</span>}
          <input 
            type="number" 
            value={displayValue}
            onChange={handleChange}
            className="bg-va-off-white border-none rounded-[12px] py-2 pl-8 pr-4 w-32 text-right font-medium focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {isPercentage && <span className="ml-2 text-va-black/40 font-bold">%</span>}
        </div>
      </div>
      <p className="text-[13px] text-black/30 font-medium leading-tight">{description}</p>
    </div>
  );
}
