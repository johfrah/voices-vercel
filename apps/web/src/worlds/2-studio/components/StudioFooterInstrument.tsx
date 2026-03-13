"use client";

import { useEffect, useMemo, useState } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoicesLinkInstrument } from '@/components/ui/VoicesLinkInstrument';
import { Phone, Mail, Calendar, BookOpen, GraduationCap, Star } from 'lucide-react';
import {
  getWorkshopIcon,
  sortWorkshopsByUpcomingThenAlpha,
  type StudioWorkshopNavItem
} from '@/components/studio/studio-workshop-nav-utils';

export function StudioFooter({ market, activeSocials, activePhone, activeEmail, reviewStats }: any) {
  const [workshops, setWorkshops] = useState<StudioWorkshopNavItem[]>([]);

  const studioStats = reviewStats?.worlds?.[2] || { averageRating: "4.9", totalCount: "12" };
  const averageRating = studioStats.averageRating;
  const totalReviews = studioStats.totalCount;

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('/api/studio/workshops/');
        const data = await res.json();
        const rawItems = Array.isArray(data?.workshops) ? data.workshops : [];
        const normalized: StudioWorkshopNavItem[] = rawItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.short_description || item.description || null,
          lucide_icon: item.lucide_icon || null,
          upcoming_editions: Array.isArray(item.upcoming_editions) ? item.upcoming_editions : []
        }));
        setWorkshops(sortWorkshopsByUpcomingThenAlpha(normalized));
      } catch {
        setWorkshops([]);
      }
    };
    fetchWorkshops();
  }, []);

  const sortedWorkshops = useMemo(() => workshops.slice(0, 14), [workshops]);

  return (
    <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-24">
      {/* Kolom 1: Studio Brand (Berny DNA) */}
      <ContainerInstrument className="space-y-8 flex flex-col items-start">
        <VoicesLinkInstrument href="/studio" className="flex items-center gap-3 group justify-start">
          <TextInstrument className="text-2xl font-light tracking-tighter text-va-black">
            Voices <TextInstrument as="span" className="text-primary italic">Studio</TextInstrument>
          </TextInstrument>
        </VoicesLinkInstrument>

        <VoicesLinkInstrument href="/studio/reviews" className="flex items-center gap-4 py-4 px-5 bg-white rounded-[20px] border border-black/5 shadow-aura-sm group/review-widget hover:shadow-aura transition-all duration-500">
          <ContainerInstrument className="flex flex-col">
            <ContainerInstrument className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-[#fabc05]" fill="currentColor" />
              ))}
            </ContainerInstrument>
            <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">
              <VoiceglotText translationKey="footer.reviews.studio_label" defaultText="Workshop Rating" />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="w-px h-8 bg-black/5" />
          <ContainerInstrument className="flex flex-col">
            <TextInstrument className="text-xl font-light text-va-black leading-none">
              {averageRating}<TextInstrument as="span" className="text-[13px] text-va-black/20 ml-0.5">/5</TextInstrument>
            </TextInstrument>
            <TextInstrument className="text-[10px] font-bold text-va-black/20 uppercase tracking-tighter">
              {totalReviews} <VoiceglotText translationKey="footer.reviews.count_label" defaultText="reviews" />
            </TextInstrument>
          </ContainerInstrument>
        </VoicesLinkInstrument>

        <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed max-w-sm text-left italic">
          <VoiceglotText translationKey="footer.studio.promise" defaultText="&quot;Workshops voor professionele sprekers.&quot;" />
        </TextInstrument>
        <TextInstrument className="text-va-black/60 text-[14px] font-light leading-relaxed max-w-sm">
          <VoiceglotText translationKey="footer.studio.tagline" defaultText="Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden." />
        </TextInstrument>
      </ContainerInstrument>

      {/* Kolom 2: Onze Workshops (De 12 uit Supabase) */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start lg:col-span-2">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.section.studio.workshops" defaultText="Onze Workshops" />
        </HeadingInstrument>
        <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
          {sortedWorkshops.map((workshop) => {
            const Icon = getWorkshopIcon(workshop.lucide_icon);
            return (
              <ContainerInstrument plain key={workshop.id}>
                <VoicesLinkInstrument href={`/studio/${workshop.slug}`} className="flex items-start gap-2.5 group">
                  <ContainerInstrument plain className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} strokeWidth={1.7} className="text-primary" />
                  </ContainerInstrument>
                  <ContainerInstrument plain className="min-w-0">
                    <TextInstrument className="text-[14px] font-medium text-va-black/70 group-hover:text-primary transition-colors">
                      {workshop.title}
                    </TextInstrument>
                    <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug line-clamp-2">
                      {workshop.description || 'Workshop in de Voices Studio'}
                    </TextInstrument>
                  </ContainerInstrument>
                </VoicesLinkInstrument>
              </ContainerInstrument>
            );
          })}
        </ContainerInstrument>
        <ContainerInstrument className="pt-4 border-t border-black/5 w-full">
          <VoicesLinkInstrument href="/studio/workshops" className="flex items-center gap-2 text-[13px] font-bold text-primary hover:opacity-70 transition-opacity">
            <Calendar size={14} />
            <VoiceglotText translationKey="footer.link.studio.editions" defaultText="Bekijk alle komende edities" />
          </VoicesLinkInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Kolom 4: Contact & Info */}
      <ContainerInstrument className="space-y-6 flex flex-col items-start">
        <HeadingInstrument level={4} className="text-[13px] font-medium tracking-[0.2em] text-va-black/40 uppercase">
          <VoiceglotText translationKey="footer.contact.title" defaultText="Contact" />
        </HeadingInstrument>
        
        <ContainerInstrument className="space-y-4 w-full">
          <ContainerInstrument className="flex flex-col gap-1 list-none">
            <TextInstrument className="text-[14px] font-medium text-va-black/70">Bernadette Timmermans</TextInstrument>
            <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug italic">Gerenommeerde stemcoach</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex flex-col gap-1 list-none pb-4">
            <TextInstrument className="text-[14px] font-medium text-va-black/70">Johfrah Lefebvre</TextInstrument>
            <TextInstrument className="text-[11px] font-light text-va-black/40 leading-snug italic">Voice-over & regisseur</TextInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="pt-4 border-t border-black/5 space-y-3">
            <VoicesLinkInstrument href={`mailto:${activeEmail}`} className="flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors">
              <Mail size={14} strokeWidth={1.5} />
              <TextInstrument as="span">{activeEmail}</TextInstrument>
            </VoicesLinkInstrument>
            <VoicesLinkInstrument href={`tel:${activePhone?.replace(/\s+/g, '') || ''}`} className="flex items-center gap-2 text-[14px] font-light text-va-black/60 hover:text-primary transition-colors">
              <Phone size={14} strokeWidth={1.5} />
              <TextInstrument as="span">{activePhone}</TextInstrument>
            </VoicesLinkInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="pt-4 space-y-3 w-full border-t border-black/5">
          <VoicesLinkInstrument href="/academy" className="flex items-center gap-2 text-[13px] font-light text-va-black/40 hover:text-primary transition-colors">
            <GraduationCap size={14} />
            <TextInstrument as="span"><VoiceglotText translationKey="footer.link.academy" defaultText="Naar de Academy" /></TextInstrument>
          </VoicesLinkInstrument>
          <VoicesLinkInstrument href="/studio/faq" className="flex items-center gap-2 text-[13px] font-light text-va-black/40 hover:text-primary transition-colors">
            <BookOpen size={14} />
            <TextInstrument as="span"><VoiceglotText translationKey="footer.link.faq" defaultText="Veelgestelde vragen" /></TextInstrument>
          </VoicesLinkInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
