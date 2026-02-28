"use client";

import React from 'react';
import Image from 'next/image';
import { Quote } from "lucide-react";
import { VoiceglotText } from "../VoiceglotText";
import { 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from "../LayoutInstruments";

const testimonials = [
  {
    id: 1,
    name: "Sarah",
    role: "Mediteerde 3 maanden",
    image: "/assets/ademing/user-forest-meditation.jpg",
    quote: "De stem van Julie brengt me meteen tot rust. Elke ochtend begin ik mijn dag met een van haar meditaties. Het heeft me geleerd om vriendelijker te zijn voor mezelf.",
    emotion: "Van onrust naar innerlijke kalmte"
  },
  {
    id: 2,
    name: "Michael",
    role: "Mediteerde 6 maanden",
    image: "/assets/ademing/user-home-meditation.jpg",
    quote: "Ik was sceptisch over meditatie, maar de warme, toegankelijke manier waarop Johfrah begeleidt heeft me overtuigd. Nu is het een essentieel onderdeel van mijn dag.",
    emotion: "Van twijfel naar dagelijkse praktijk"
  },
  {
    id: 3,
    name: "Emma",
    role: "Mediteerde 1 jaar",
    image: null,
    quote: "De combinatie van de vier elementen helpt me om te voelen wat ik nodig heb. Soms aarde voor grounding, soms water voor flow. Dit platform begrijpt dat ieder moment anders is.",
    emotion: "Van zoeken naar gevonden hebben"
  }
];

export const Testimonials = () => {
  return (
    <SectionInstrument className="py-32 px-6 bg-gradient-to-b from-background to-muted/30">
      <ContainerInstrument className="max-w-6xl mx-auto">
        <ContainerInstrument className="text-center mb-24 space-y-6">
          <HeadingInstrument level={2} className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
            <VoiceglotText 
              translationKey="testimonials.title"
              defaultText="Ervaringen van mediteerders"
            />
          </HeadingInstrument>
          <TextInstrument className="text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            <VoiceglotText 
              translationKey="testimonials.subtitle"
              defaultText="Ontdek hoe anderen hun reis naar innerlijke rust hebben beleefd"
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid md:grid-cols-3 gap-12">
          {testimonials.map((testimonial) => (
            <ContainerInstrument 
              key={testimonial.id} 
              className="p-10 hover:shadow-xl transition-all duration-700 hover:-translate-y-2 border-2 hover:border-primary/20 bg-white/60 backdrop-blur-sm rounded-[48px] shadow-soft flex flex-col justify-between"
            >
              <ContainerInstrument>
                <Quote className="h-12 w-12 text-primary/20 mb-8" />
                
                <TextInstrument className="text-xl leading-relaxed mb-10 italic font-serif text-foreground/80">
                  <VoiceglotText 
                    translationKey={`testimonial.${testimonial.id}.quote`}
                    defaultText={testimonial.quote}
                  />
                </TextInstrument>
              </ContainerInstrument>
              
              <ContainerInstrument className="flex items-center gap-5 pt-8 border-t border-black/5">
                <ContainerInstrument className="h-16 w-16 rounded-full overflow-hidden border-4 border-primary/10 shadow-medium relative">
                  {testimonial.image ? (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="64px"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ContainerInstrument className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                      {testimonial.name.charAt(0)}
                    </ContainerInstrument>
                  )}
                </ContainerInstrument>
                <ContainerInstrument>
                  <TextInstrument className="font-bold text-xl text-foreground">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.name`}
                      defaultText={testimonial.name}
                    />
                  </TextInstrument>
                  <TextInstrument className="text-sm text-muted-foreground font-medium">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.role`}
                      defaultText={testimonial.role}
                    />
                  </TextInstrument>
                  <TextInstrument className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-2">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.emotion`}
                      defaultText={testimonial.emotion}
                    />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>

        <ContainerInstrument className="mt-24 text-center">
          <TextInstrument className="text-2xl text-muted-foreground italic max-w-3xl mx-auto font-serif leading-relaxed">
            <VoiceglotText 
              translationKey="testimonials.closing.quote"
              defaultText="Ieder mens heeft momenten van rust nodig. Ons doel is om die momenten toegankelijk te maken, wanneer je ze het meest nodig hebt."
            />
          </TextInstrument>
          <TextInstrument className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-primary/60">
            <VoiceglotText 
              translationKey="testimonials.closing.author"
              defaultText="— Julie & Johfrah"
            />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </SectionInstrument>
  );
};
