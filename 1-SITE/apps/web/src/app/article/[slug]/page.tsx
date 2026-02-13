import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getArticle } from "@/lib/api-server";
import { ArrowLeft, Calendar, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <PageWrapperInstrument>
      <Suspense strokeWidth={1.5} fallback={<ArticleSkeleton  />}>
        <ArticleContent strokeWidth={1.5} slug={params.slug} />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  const article = await getArticle(slug);

  if (!article) return (
    <ContainerInstrument className="p-20 text-center">
      <TextInstrument><VoiceglotText  translationKey="article.not_found" defaultText="Artikel niet gevonden." /></TextInstrument>
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
      {/* Header / Breadcrumbs */}
      <SectionInstrument className="mb-12 flex items-center justify-between">
        <Link  
          href="/agency" 
          className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all "
        >
          <ArrowLeft strokeWidth={1.5} size={14} /> 
          <VoiceglotText  translationKey="article.back_to_overview" defaultText="Terug" />
        </Link>
        <ContainerInstrument className="flex gap-4">
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Heart strokeWidth={1.5} size={18} />
          </ButtonInstrument>
          <ButtonInstrument className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-primary transition-all shadow-sm">
            <Share2 strokeWidth={1.5} size={18} />
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Title & Meta Card */}
        <BentoCard span="xl" className="bg-white shadow-aura p-12 !rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 mb-6">
            <ContainerInstrument className="px-3 py-1 bg-va-off-white rounded-full text-[15px] font-light tracking-widest text-va-black/40 border border-black/5 "><VoiceglotText  translationKey={`journey.${article.meta?.llm_context?.journey?.[0]?.toLowerCase() || 'inspiration'}`} defaultText={article.meta?.llm_context?.journey?.[0] || 'Inspiratie'} /></ContainerInstrument>
            <TextInstrument className="flex items-center gap-2 text-[15px] font-light text-va-black/30 tracking-widest ">
              <Calendar strokeWidth={1.5} size={12} /> {new Date(article.date).toLocaleDateString('nl-BE')}
            </TextInstrument>
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter mb-8 leading-[0.9] text-va-black "><VoiceglotText  translationKey={`article.${article.id}.title`} defaultText={article.title} /></HeadingInstrument>
          <ContainerInstrument className="flex items-center gap-3">
            <ContainerInstrument className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-light text-[15px]">
              {article.meta?.llm_context?.author?.[0] || 'V'}
            </ContainerInstrument>
            <ContainerInstrument>
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black "><VoiceglotText  translationKey={`author.${article.meta?.llm_context?.author?.toLowerCase() || 'voices'}`} defaultText={article.meta?.llm_context?.author || 'Voices'} /></TextInstrument>
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="article.expert_author" defaultText="Auteur" /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* Content Card */}
        <BentoCard span="xl" className="bg-va-off-white/50 backdrop-blur-md border-white/20 shadow-aura p-12 prose prose-va max-w-none !rounded-[20px]">
          <ContainerInstrument dangerouslySetInnerHTML={{ __html: article.content }} className="font-light leading-relaxed" />
        </BentoCard>

        <BentoCard span="md" className="hred text-white p-12 flex flex-col justify-between !rounded-[20px]">
          <ContainerInstrument>
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-4 "><VoiceglotText  translationKey="article.cta.title" defaultText="Klaar voor de volgende stap?" /><TextInstrument className="text-[15px] font-light opacity-80 mb-8 leading-relaxed"><VoiceglotText  translationKey="article.cta.text" defaultText="Onze experts staan klaar om je te helpen met je project of je carrière." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <Link  href="/agency" className="va-btn-pro !bg-white !text-va-black w-full text-center !rounded-[10px] !font-light !tracking-widest !"><VoiceglotText  translationKey="article.cta.button" defaultText="Ontdek de Mogelijkheden" /></Link>
        </BentoCard>
      </BentoGrid>

      {/* 🕸️ SUZY'S SCHEMA INJECTION: Article Authority */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description,
            "datePublished": article.date,
            "dateModified": article.updatedAt || article.date,
            "author": {
              "@type": "Person",
              "name": article.meta?.llm_context?.author || "Johfrah Lefebvre",
              "url": "https://www.voices.be/voice/johfrah-lefebvre"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Voices",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.voices.be/assets/common/logo-voices-be.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.voices.be/article/${slug}`
            }
          })
        }}
      />

      {/* LLM Context Layer (Invisible) */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article.meta?.llm_context || {}) }}
      />
    </PageWrapperInstrument>
  );
}

function ArticleSkeleton() {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
      <ContainerInstrument className="h-4 w-32 bg-black/5 rounded mb-12" />
      <ContainerInstrument className="grid grid-cols-3 gap-6">
        <ContainerInstrument className="col-span-2 h-64 bg-black/5 rounded-3xl" />
        <ContainerInstrument className="h-64 bg-black/5 rounded-3xl" />
        <ContainerInstrument className="col-span-3 h-96 bg-black/5 rounded-3xl" />
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
