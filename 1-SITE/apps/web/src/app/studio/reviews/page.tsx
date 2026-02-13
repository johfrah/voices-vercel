"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CheckCircle, Loader2, Quote, Star, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * ⭐️ STUDIO REVIEWS (NUCLEAR 2026)
 * 
 * "Kwaliteitsbewaking van de stemmen."
 * 🛡️ Alleen voor admins – middleware + API beveiligen.
 */
export default function StudioReviewsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/');
      return;
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/admin/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) {
        console.error('Failed to fetch reviews', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => filter === 'all' || r.status === filter);

  if (!isAdmin && !isLoading) return null;
  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter "><VoiceglotText  translationKey="admin.reviews.title" defaultText="Review Intelligence" /></HeadingInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex gap-4">
          <ContainerInstrument className="flex bg-white border border-black/5 rounded-2xl p-1">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-va-black text-white shadow-lg' : 'text-va-black/30 hover:text-va-black'
                }`}
              >
                <VoiceglotText  translationKey={`admin.reviews.filter.${f}`} defaultText={f} />
              </button>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Stats */}
      <BentoGrid strokeWidth={1.5} columns={4}>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light"><VoiceglotText  translationKey="admin.reviews.stats.avg_score" defaultText="Gemiddelde Score" /></TextInstrument>
          <ContainerInstrument className="flex items-center gap-2">
            <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">4.9</HeadingInstrument>
            <ContainerInstrument className="flex text-primary">
              {[...Array(5)].map((_, i) => <Star strokeWidth={1.5} key={i} size={16} fill="currentColor" />)}
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light"><VoiceglotText  translationKey="admin.reviews.stats.total" defaultText="Totaal Reviews" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter">{reviews.length}</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light"><VoiceglotText  translationKey="admin.reviews.stats.pending" defaultText="Wachtend" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-orange-500">{reviews.filter(r  => r.status === 'pending').length})</HeadingInstrument>
        </BentoCard>
        <BentoCard span="sm" className="bg-white border border-black/5 p-8 space-y-2">
          <TextInstrument className="text-[15px] tracking-widest text-va-black/30 font-light"><VoiceglotText  translationKey="admin.reviews.stats.sentiment" defaultText="Sentiment" /></TextInstrument>
          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-green-500"><VoiceglotText  translationKey="admin.reviews.stats.sentiment_value" defaultText="98% POSITIEF" /></HeadingInstrument>
        </BentoCard>
      </BentoGrid>

      {/* Review Grid */}
      <BentoGrid strokeWidth={1.5} columns={3}>
        {filteredReviews.map((review) => (
          <BentoCard key={review.id} span="sm" className="bg-white border border-black/5 p-8 flex flex-col justify-between group hover:shadow-aura transition-all">
            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="flex justify-between items-start">
                <ContainerInstrument className="flex text-primary">
                  {[...Array(review.rating)].map((_, i) => <Star strokeWidth={1.5} key={i} size={12} fill="currentColor" />)}
                </ContainerInstrument>
                <ContainerInstrument className={`px-2 py-1 rounded text-[15px] font-black uppercase tracking-widest ${
                  review.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                }`}>
                  {review.status}
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="relative">
                <Quote strokeWidth={1.5} className="absolute -left-4 -top-4 text-va-black/[0.03]" size={40} />
                <TextInstrument className="text-[15px] font-medium italic leading-relaxed text-va-black/70 relative z-10">
                  &quot;{review.comment}&quot;
                </TextInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="pt-4 border-t border-black/5 flex items-center gap-3">
                <ContainerInstrument className="w-8 h-8 bg-va-off-white rounded-full flex items-center justify-center font-black text-[15px] text-va-black/20 ">
                  {review.userName?.charAt(0)}
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="text-[15px] font-black tracking-tight">{review.userName}</TextInstrument>
                  <TextInstrument className="text-[15px] text-va-black/30 font-medium tracking-widest ">{review.actorName}</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="mt-8 flex gap-2">
              {review.status === 'pending' && (
                <ButtonInstrument className="va-btn-pro !py-3 flex-1">
                  <CheckCircle strokeWidth={1.5} size={14} /> <VoiceglotText  translationKey="admin.reviews.action.approve" defaultText="Goedkeuren" />
                </ButtonInstrument>
              )}
              <ButtonInstrument className="va-btn-secondary !py-3 !px-4 !bg-va-off-white !text-va-black/20 hover:!text-red-500">
                <XCircle strokeWidth={1.5} size={14} />
              </ButtonInstrument>
            </ContainerInstrument>
          </BentoCard>
        ))}
      </BentoGrid>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ReviewIntelligence",
            "name": "Review Intelligence",
            "description": "Kwaliteitsbewaking en sentiment-analyse van stemacteur reviews.",
            "_llm_context": {
              "persona": "Kwaliteitsmanager",
              "journey": "admin",
              "intent": "review_moderation",
              "capabilities": ["approve_reviews", "filter_reviews", "analyze_sentiment"],
              "lexicon": ["Sentiment", "Moderatie", "Kwaliteitsbewaking"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
