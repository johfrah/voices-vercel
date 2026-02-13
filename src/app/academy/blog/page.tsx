import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { BookOpen, Calendar, ArrowRight, GraduationCap, Mic2, Sparkles } from 'lucide-react';
import Link from 'next/link';

/**
 * 🎓 ACADEMY BLOG HUB (GOD MODE 2026)
 * 
 * Focus: Kennisdeling voor de stemmen van morgen.
 */
export default function AcademyBlogPage() {
  const academyArticles = [
    {
      id: 'academy-intro',
      slug: 'academy-intro',
      title: 'Welkom bij de Academy',
      excerpt: 'Ontdek jouw digitale groeipad als stemacteur. Alles over techniek, business en ambacht.',
      theme: 'Academy',
      icon: GraduationCap
    },
    {
      id: 'mastering-tips',
      slug: 'techniek-mastering',
      title: 'De Geheimen van Mastering',
      excerpt: 'Waarom de ene stem straalt en de andere verzuipt. Een duik in de loudness-wetten.',
      theme: 'Techniek',
      icon: Mic2
    }
  ];

  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black uppercase tracking-widest border border-primary/10 mb-8">
            <GraduationCap size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="academy.blog.badge" defaultText="Academy Kennisbank" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="academy.blog.title" defaultText="Beter Worden." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl">
            <VoiceglotText 
              translationKey="academy.blog.subtitle" 
              defaultText="Exclusieve tips, technische gidsen en verhalen uit de studio. Speciaal voor onze stemacteurs." 
            />
          </TextInstrument>
        </SectionInstrument>

        <BentoGrid columns={3}>
          {academyArticles.map((article, i) => {
            const Icon = article.icon || Sparkles;
            
            return (
              <BentoCard key={article.id} span={i === 0 ? "lg" : "sm"} className="bg-white shadow-sm hover:shadow-aura transition-all group overflow-hidden flex flex-col">
                <Link href={`/academy/blog/${article.slug}`} className="flex-1 flex flex-col p-8">
                  <ContainerInstrument className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-va-off-white rounded-full text-[15px] font-black uppercase tracking-widest text-va-black/40 border border-black/5 flex items-center gap-2">
                      <Icon size={10} className="text-primary" />
                      {article.theme}
                    </div>
                  </ContainerInstrument>
                  
                  <HeadingInstrument level={2} className={`${i === 0 ? 'text-4xl' : 'text-xl'} font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors`}>
                    {article.title}
                  </HeadingInstrument>
                  
                  <TextInstrument className="text-va-black/40 text-sm font-medium leading-relaxed mb-8 flex-1">
                    {article.excerpt}
                  </TextInstrument>
                  
                  <div className="flex items-center gap-2 text-[15px] font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                    <VoiceglotText translationKey="common.read_lesson" defaultText="Lees de les" /> <ArrowRight size={14} />
                  </div>
                </Link>
              </BentoCard>
            );
          })}
        </BentoGrid>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
