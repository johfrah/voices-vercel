"use client";

import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { VoiceglotText } from "../VoiceglotText";

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
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            <VoiceglotText 
              translationKey="testimonials.title"
              defaultText="Ervaringen van mediteerders"
            />
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey="testimonials.subtitle"
              defaultText="Ontdek hoe anderen hun reis naar innerlijke rust hebben beleefd"
            />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm rounded-3xl"
            >
              <Quote className="h-10 w-10 text-primary/30 mb-6" />
              
              <p className="text-lg leading-relaxed mb-6 italic">
                <VoiceglotText 
                  translationKey={`testimonial.${testimonial.id}.quote`}
                  defaultText={testimonial.quote}
                />
              </p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-semibold text-xl">{testimonial.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.name`}
                      defaultText={testimonial.name}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.role`}
                      defaultText={testimonial.role}
                    />
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-1">
                    <VoiceglotText 
                      translationKey={`testimonial.${testimonial.id}.emotion`}
                      defaultText={testimonial.emotion}
                    />
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground italic max-w-2xl mx-auto">
            <VoiceglotText 
              translationKey="testimonials.closing.quote"
              defaultText="Ieder mens heeft momenten van rust nodig. Ons doel is om die momenten toegankelijk te maken, wanneer je ze het meest nodig hebt."
            />
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <VoiceglotText 
              translationKey="testimonials.closing.author"
              defaultText="— Julie & Johfrah"
            />
          </p>
        </div>
      </div>
    </section>
  );
};
