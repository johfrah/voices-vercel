"use client";

import { DonationModal } from "@/components/artist/DonationModal";
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
import { useTranslation } from "@/contexts/TranslationContext";
import { Heart, Instagram, Music, Play, Youtube, ShieldCheck, Loader2, Clock, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React from "react";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const VideoPlayer = dynamic(() => import("@/components/ui/VideoPlayer").then(mod => mod.VideoPlayer), { ssr: false });

export function ArtistDetailClient({ artistData, isYoussef, params, donors = [] }: { artistData: any, isYoussef: boolean, params: { slug: string }, donors?: any[] }) {
  const { t } = useTranslation();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);

  const manifesto = artistData.labelManifesto || artistData.iapContext?.manifesto;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `https://www.voices.be/artist/${params.slug}#artist`,
    "name": artistData.display_name,
    "image": artistData.photo_url || undefined,
    "description": artistData.bio,
    "url": `https://www.voices.be/artist/${params.slug}`,
    "genre": artistData.iapContext?.genre || "Pop",
    "sameAs": [
        artistData.spotify_url || artistData.iapContext?.socials?.spotify,
        artistData.youtube_url || artistData.iapContext?.socials?.youtube,
        artistData.instagram_url || artistData.iapContext?.socials?.instagram,
        artistData.tiktok_url || artistData.iapContext?.socials?.tiktok
    ].filter(Boolean)
  };

    const subtitles = {
      en: [
        { start: 0.5, end: 4.8, text: "Hi, I’m Youssef Zaki, I’m a singer and I’m releasing my first single soon." },
        { start: 5.5, end: 9.8, text: "Over the years, I’ve participated in several TV shows in Europe." },
        { start: 10.2, end: 12.5, text: "In Italy, I did “Tú Sí Que Vales”." },
        { start: 21.0, end: 23.5, text: "I did “The Voice France”." },
        { start: 30.0, end: 34.5, text: "I did “The Voice Belgium” and “Belgium’s Got Talent” where I reached the final." },
        { start: 60.0, end: 65.5, text: "And the last one I did was “Lift You Up” where I reached the quarter-finals..." },
        { start: 65.8, end: 68.5, text: "...and sang with Laura Tesoro, who was incredible." },
        { start: 90.0, end: 91.5, text: "Thank you." },
        { start: 105.2, end: 109.5, text: "Please, don’t stop doing that because you have something interesting, really." },
        { start: 109.8, end: 112.5, text: "I’ve heard many, many boys sing in my life." },
        { start: 112.8, end: 119.5, text: "You have everything to be powerful and I can’t wait to hear the moment you become powerful because I’m going to have to worry." },
        { start: 120.0, end: 121.5, text: "Thank you very much." },
        { start: 123.2, end: 125.0, text: "Now, we are on our way to Place Agora." },
        { start: 125.5, end: 129.5, text: "It’s a magical and important place for me." },
        { start: 129.8, end: 134.5, text: "This is where I really started to develop musically." },
        { start: 134.8, end: 140.5, text: "After “The Voice Belgium”, I remember B.J. Scott telling me that I should keep doing what I was doing because I had something." },
        { start: 140.8, end: 141.8, text: "And I decided to do it." },
        { start: 142.0, end: 147.5, text: "After a few months, I decided to launch myself and it’s here, in this magical place, that I developed." },
        { start: 147.8, end: 153.5, text: "I met incredible artists and was able to share my emotions with the whole world." },
        { start: 164.2, end: 166.5, text: "I’m going to be really honest with you." },
        { start: 166.8, end: 171.5, text: "I was afraid for a very long time because I told myself it was never good enough, that it wasn’t right." },
        { start: 171.8, end: 175.5, text: "But now, I told myself that I’m ready." },
        { start: 175.8, end: 177.5, text: "I’m going to do my best." },
        { start: 177.8, end: 182.5, text: "And I would like to release my first EP this year, which will have 6 songs." },
        { start: 184.2, end: 188.5, text: "And in those 6 songs, you’ll see that there might be some surprises." },
        { start: 190.2, end: 192.5, text: "I’m going to do it independently and it’s a bit expensive." },
        { start: 192.8, end: 196.5, text: "So honestly, if you could support me, it would be incredible." },
        { start: 196.8, end: 198.5, text: "I’ll leave a small link at the bottom of the video." },
        { start: 200.2, end: 202.5, text: "Thank you for still being here." },
        { start: 202.8, end: 204.5, text: "Thank you for the support you give me." },
        { start: 204.8, end: 206.5, text: "I’m still receiving your incredible messages." },
        { start: 206.8, end: 208.5, text: "Thank you, thank you, thank you." }
      ],
      nl: [
        { start: 0.5, end: 4.8, text: "Hoi, ik ben Youssef Zaki, ik ben zanger en binnenkort breng ik mijn eerste single uit." },
        { start: 5.5, end: 9.8, text: "In de loop der jaren heb ik aan verschillende tv-programma's in Europa meegedaan." },
        { start: 10.2, end: 12.5, text: "In Italië deed ik mee aan “Tú Sí Que Vales”." },
        { start: 21.0, end: 23.5, text: "Ik heb meegedaan aan “The Voice France”." },
        { start: 30.0, end: 34.5, text: "Ik deed mee aan “The Voice Belgique” en “Belgium’s Got Talent”, waar ik de finale bereikte." },
        { start: 60.0, end: 65.5, text: "En de laatste die ik deed was “Lift You Up”, waar ik de kwartfinale bereikte..." },
        { start: 65.8, end: 68.5, text: "...en zong met Laura Tesoro, die ongelooflijk was." },
        { start: 90.0, end: 91.5, text: "Bedankt." },
        { start: 105.2, end: 109.5, text: "Alsjeblieft, stop hier niet mee, want je hebt iets interessants, echt waar." },
        { start: 109.8, end: 112.5, text: "Ik heb in mijn leven veel, veel jongens horen zingen." },
        { start: 112.8, end: 119.5, text: "Je hebt alles om krachtig te zijn en ik kan niet wachten op het moment dat je krachtig wordt, want dan moet ik me zorgen gaan maken." },
        { start: 120.0, end: 121.5, text: "Dank u wel." },
        { start: 123.2, end: 125.0, text: "Nu zijn we onderweg naar Place Agora." },
        { start: 125.5, end: 129.5, text: "Het is een magische en belangrijke plek voor mij." },
        { start: 129.8, end: 134.5, text: "Dit is waar ik me echt muzikaal begon te ontwikkelen." },
        { start: 134.8, end: 140.5, text: "Na “The Voice Belgique” herinner ik me dat B.J. Scott me vertelde dat ik door moest gaan met wat ik deed omdat ik iets had." },
        { start: 140.8, end: 141.8, text: "En ik besloot het te doen." },
        { start: 142.0, end: 147.5, text: "Na een paar maanden besloot ik mezelf te lanceren en het is hier, op deze magische plek, dat ik me heb ontwikkeld." },
        { start: 147.8, end: 153.5, text: "Ik heb ongelooflijke artiesten ontmoet en mijn emoties met de hele wereld kunnen delen." },
        { start: 164.2, end: 166.5, text: "Ik ga heel eerlijk met jullie zijn." },
        { start: 166.8, end: 171.5, text: "Ik ben heel lang bang geweest omdat ik mezelf wijsmaakte dat het nooit goed genoeg was, dat het niet klopte." },
        { start: 171.8, end: 175.5, text: "Maar nu heb ik mezelf gezegd dat ik er klaar voor ben." },
        { start: 175.8, end: 177.5, text: "Ik ga mijn best doen." },
        { start: 177.8, end: 182.5, text: "En ik zou dit jaar mijn eerste EP willen uitbrengen, die 6 nummers zal bevatten." },
        { start: 184.2, end: 188.5, text: "En in die 6 nummers zul je zien dat er misschien wel verrassingen zijn." },
        { start: 190.2, end: 192.5, text: "Ik ga het onafhankelijk doen en dat is best duur." },
        { start: 192.8, end: 196.5, text: "Dus eerlijk gezegd, als jullie me zouden kunnen steunen, zou dat ongelooflijk zijn." },
        { start: 196.8, end: 198.5, text: "Ik laat een kleine link achter onderaan de video." },
        { start: 200.2, end: 202.5, text: "Bedankt dat jullie er nog steeds zijn." },
        { start: 202.8, end: 204.5, text: "Bedankt voor de steun die jullie me geven." },
        { start: 204.8, end: 206.5, text: "Ik ontvang nog steeds jullie ongelooflijke berichten." },
        { start: 206.8, end: 208.5, text: "Bedankt, bedankt, bedankt." }
      ],
      fr: [
        { start: 0.5, end: 4.8, text: "Salut, je suis Youssef Zaki, je suis chanteur et bientôt je sors mon premier single." },
        { start: 5.5, end: 9.8, text: "Au fil des années, j'ai participé à plusieurs émissions à la télé en Europe." },
        { start: 10.2, end: 12.5, text: "En Italie, j'ai fait « Tú Sí Que Vales »." },
        { start: 21.0, end: 23.5, text: "J'ai fait « The Voice France »." },
        { start: 30.0, end: 34.5, text: "J'ai fait « The Voice Belgique » et « Belgium’s Got Talent » où je suis arrivé en finale." },
        { start: 60.0, end: 65.5, text: "Et le dernier que j'ai fait c'est « Lift You Up » où je suis arrivé en quart de finale..." },
        { start: 65.8, end: 68.5, text: "...et j'ai chanté avec Laura Tesoro qui était incroyable." },
        { start: 90.0, end: 91.5, text: "Merci." },
        { start: 105.2, end: 109.5, text: "S'il vous plaît, n'arrêtez pas de faire ça parce que tu as quelque chose d'intéressant, vraiment." },
        { start: 109.8, end: 112.5, text: "J'ai entendu beaucoup, beaucoup de garçons chanter dans ma vie." },
        { start: 112.8, end: 119.5, text: "Tu as tout pour être violent et j'ai hâte d'entendre le moment où tu vas être violent parce que je vais avoir du souci à me faire." },
        { start: 120.0, end: 121.5, text: "Merci beaucoup." },
        { start: 123.2, end: 125.0, text: "Maintenant, on est en train d'aller à Place Agora." },
        { start: 125.5, end: 129.5, text: "C'est un endroit magique et important pour moi." },
        { start: 129.8, end: 134.5, text: "C'est ici que j'ai commencé vraiment à me développer musicalement." },
        { start: 134.8, end: 140.5, text: "Après « The Voice Belgique », je me rappelle que B.J. Scott m'avait dit que je devais continuer à faire ce que je faisais parce que j'avais quelque chose." },
        { start: 140.8, end: 141.8, text: "Et j'ai décidé de le faire." },
        { start: 142.0, end: 147.5, text: "Après quelques mois, j'ai décidé de me lancer et c'est ici, dans cet endroit magique que je me suis développé." },
        { start: 147.8, end: 153.5, text: "J'ai rencontré des artistes incroyables et j'ai pu partager mes émotions avec le monde entier." },
        { start: 164.2, end: 166.5, text: "Je vais être vraiment honnête avec vous." },
        { start: 166.8, end: 171.5, text: "J'ai eu peur pendant très longtemps parce que je me didais que ce n'était jamais assez bon, que ce n'était pas bien." },
        { start: 171.8, end: 175.5, text: "Mais là, je me suis dit que je suis prêt." },
        { start: 175.8, end: 177.5, text: "Je vais faire de mon mieux." },
        { start: 177.8, end: 182.5, text: "And I would like to release my first EP this year, which will have 6 songs." },
        { start: 184.2, end: 188.5, text: "And in those 6 songs, you’ll see that there might be some surprises." },
        { start: 190.2, end: 192.5, text: "Je vais le faire en indépendant et ça coûte un peu cher." },
        { start: 192.8, end: 196.5, text: "Donc franchement, si vous pouviez me soutenir, ce serait incroyable." },
        { start: 196.8, end: 198.5, text: "Je vais laisser un petit lien en bas de la vidéo." },
        { start: 200.2, end: 202.5, text: "Merci d'être encore là." },
        { start: 202.8, end: 204.5, text: "Merci pour le soutien que vous me donnez." },
        { start: 204.8, end: 206.5, text: "Je reçois encore vos messages incroyables." },
        { start: 206.8, end: 208.5, text: "Merci, merci, merci." }
      ],
      it: [
        { start: 0.5, end: 4.8, text: "Ciao, sono Youssef Zaki, sono un cantante e presto uscirà il mio primo singolo." },
        { start: 5.5, end: 9.8, text: "Nel corso degli anni, ho partecipato a diversi programmi televisivi in Europa." },
        { start: 10.2, end: 12.5, text: "In Italia, ho partecipato a “Tú Sí Que Vales”." },
        { start: 21.0, end: 23.5, text: "Ho partecipato a “The Voice France”." },
        { start: 30.0, end: 34.5, text: "Ho partecipato a “The Voice Belgique” e “Belgium’s Got Talent”, dove sono arrivato in finale." },
        { start: 60.0, end: 65.5, text: "E l'ultimo che ho fatto è stato “Lift You Up”, dove sono arrivato in quarti di finale..." },
        { start: 65.8, end: 68.5, text: "...e ho cantato con Laura Tesoro, che è stata incredibile." },
        { start: 90.0, end: 91.5, text: "Grazie." },
        { start: 105.2, end: 109.5, text: "Per favore, non smettete di farlo perché hai qualcosa di interessante, davvero." },
        { start: 109.8, end: 112.5, text: "Ho sentito molti, molti ragazzi cantare nella mia vita." },
        { start: 112.8, end: 119.5, text: "Hai tutto per essere potente e non vedo l'ora di sentire il momento in cui diventerai potente perché dovrò preoccuparmi." },
        { start: 120.0, end: 121.5, text: "Grazie mille." },
        { start: 123.2, end: 125.0, text: "Ora siamo sulla strada per Place Agora." },
        { start: 125.5, end: 129.5, text: "È un posto magico e importante per me." },
        { start: 129.8, end: 134.5, text: "È qui che ho iniziato davvero a svilupparmi musicalmente." },
        { start: 134.8, end: 140.5, text: "Dopo “The Voice Belgique”, ricordo che B.J. Scott mi disse che dovevo continuare a fare quello che facevo perché avevo qualcosa." },
        { start: 140.8, end: 141.8, text: "E ho deciso di farlo." },
        { start: 142.0, end: 147.5, text: "Dopo qualche mese, ho deciso di lanciarmi ed è qui, in questo posto magico, che mi sono sviluppato." },
        { start: 147.8, end: 153.5, text: "Ho incontrato artisti incredibili e ho potuto condividere le mie emozioni con tutto il mondo." },
        { start: 164.2, end: 166.5, text: "Sarò davvero onesto con voi." },
        { start: 166.8, end: 171.5, text: "Ho avuto paura per molto tempo perché mi dicevo che non era mai abbastanza buono, che non era giusto." },
        { start: 171.8, end: 175.5, text: "Ma ora, mi sono detto che sono pronto." },
        { start: 175.8, end: 177.5, text: "Farò del mio meglio." },
        { start: 177.8, end: 182.5, text: "E vorrei far uscire quest'anno il mio primo EP, che avrà 6 canzoni." },
        { start: 184.2, end: 188.5, text: "E in quelle 6 canzoni, vedrete che ci saranno forse delle sorprese." },
        { start: 190.2, end: 192.5, text: "Lo farò in modo indipendente e costa un po' caro." },
        { start: 192.8, end: 196.5, text: "Quindi onestamente, se poteste sostenermi, sarebbe incredibile." },
        { start: 196.8, end: 198.5, text: "Lascerò un piccolo link in fondo al video." },
        { start: 200.2, end: 202.5, text: "Grazie per essere ancora qui." },
        { start: 202.8, end: 204.5, text: "Grazie per il sostegno che mi date." },
        { start: 204.8, end: 206.5, text: "Ricevo ancora i vostri incredibili messaggi." },
        { start: 206.8, end: 208.5, text: "Grazie, grazie, grazie." }
      ],
      ar: [
        { start: 0.5, end: 4.8, text: "مرحباً، أنا يوسف زكي، أنا مغني وقريباً سأصدر أول أغنية منفردة لي." },
        { start: 5.5, end: 9.8, text: "على مر السنين، شاركت في العديد من البرامج التلفزيونية في أوروبا." },
        { start: 10.2, end: 12.5, text: "في إيطاليا، شاركت في برنامج “Tú Sí Que Vales”." },
        { start: 21.0, end: 23.5, text: "شاركت في برنامج “The Voice France”." },
        { start: 30.0, end: 34.5, text: "شاركت في برنامج “The Voice Belgique” وبرنامج “Belgium’s Got Talent” حيث وصلت إلى النهائي." },
        { start: 60.0, end: 65.5, text: "وآخر برنامج شاركت فيه كان “Lift You Up” حيث وصلت إلى ربع النهائي..." },
        { start: 65.8, end: 68.5, text: "...وغنيت مع لورا تيسورو، التي كانت رائعة." },
        { start: 90.0, end: 91.5, text: "شكراً لكم." },
        { start: 105.2, end: 109.5, text: "من فضلكم، لا تتوقفوا عن فعل ذلك لأن لديكم شيئاً مثيراً للاهتمام، حقاً." },
        { start: 109.8, end: 112.5, text: "لقد سمعت الكثير والكثير من الفتيان يغنون في حياتي." },
        { start: 112.8, end: 119.5, text: "لديك كل شيء لتكون قوياً، ولا أطيق الانتظار لسماع اللحظة التي تصبح فيها قوياً لأنني سأضطر للقلق حينها." },
        { start: 120.0, end: 121.5, text: "شكراً جزيلاً لكم." },
        { start: 123.2, end: 125.0, text: "الآن، نحن في طريقنا إلى ساحة أغورا." },
        { start: 125.5, end: 129.5, text: "إنه مكان ساحر ومهم بالنسبة لي." },
        { start: 129.8, end: 134.5, text: "هذا هو المكان الذي بدأت فيه حقاً تطوير نفسي موسيقياً." },
        { start: 134.8, end: 140.5, text: "بعد برنامج “The Voice Belgique”، أتذكر أن بي جي سكوت أخبرني أنني يجب أن أستمر في ما أفعله لأنني أملك شيئاً ما." },
        { start: 140.8, end: 141.8, text: "وقد قررت القيام بذلك." },
        { start: 142.0, end: 147.5, text: "بعد بضعة أشهر، قررت أن أطلق نفسي، وهنا، في هذا المكان الساحر، طورت نفسي." },
        { start: 147.8, end: 153.5, text: "لقد قابلت فنانين رائعين وتمكنت من مشاركة مشاعري مع العالم أجمع." },
        { start: 164.2, end: 166.5, text: "سأكون صادقاً جداً معكم." },
        { start: 166.8, end: 171.5, text: "لقد كنت خائفاً لفترة طويلة جداً لأنني كنت أقول لنفسي إن الأمر لم يكن جيداً بما فيه الكفاية، وأنه لم يكن صحيحاً." },
        { start: 171.8, end: 175.5, text: "لكن الآن، قلت لنفسي إنني مستعد." },
        { start: 175.8, end: 177.5, text: "سأبذل قصارى جهدي." },
        { start: 177.8, end: 182.5, text: "وأود أن أصدر هذا العام أول ألبوم قصير لي (EP) والذي سيضم 6 أغانٍ." },
        { start: 184.2, end: 188.5, text: "وفي تلك الأغاني الست، سترون أنه ربما ستكون هناك مفاجآت." },
        { start: 190.2, end: 192.5, text: "سأقوم بذلك بشكل مستقل، وهذا مكلف بعض الشيء." },
        { start: 192.8, end: 196.5, text: "لذا بصراحة، إذا كان بإمكانكم دعمي، فسيكون ذلك رائعاً." },
        { start: 196.8, end: 198.5, text: "سأترك رابطاً صغيراً في أسفل الفيديو." },
        { start: 200.2, end: 202.5, text: "شكراً لكم لأنكم لا تزالون هنا." },
        { start: 202.8, end: 204.5, text: "شكراً لكم على الدعم الذي تقدمونه لي." },
        { start: 204.8, end: 206.5, text: "لا أزال أتلقى رسائلكم الرائعة." },
        { start: 206.8, end: 208.5, text: "شكراً، شكراً، شكراً." }
      ]
    };

    return (
      <PageWrapperInstrument className={cn(
        "min-h-screen relative z-10",
        isYoussef ? 'theme-youssef !bg-va-black !text-white' : 'max-w-6xl mx-auto px-6 py-20'
      )}>
        {isYoussef && <ContainerInstrument className="absolute inset-0 bg-va-black -z-10" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <ContainerInstrument className={cn(isYoussef ? 'max-w-6xl mx-auto px-6 py-20' : '')}>
          {/*  STORY LAYOUT HERO (voices-video-left standard - EXPANDED) */}
          <SectionInstrument id="story" className={cn(
            "grid grid-cols-1 gap-12 mb-32 items-start",
            isYoussef ? "lg:grid-cols-2 gap-20" : "lg:grid-cols-12"
          )}>
            <ContainerInstrument className={cn(isYoussef ? "flex flex-col gap-8" : "lg:col-span-5")}>
              {isYoussef ? (
                <>
                  <div className="voices-hero-visual-container rounded-[32px] overflow-hidden shadow-aura-lg bg-va-black border border-white/5 aspect-[9/16] w-full max-w-[500px] mx-auto">
                    <Suspense fallback={<div className="w-full h-full bg-va-black flex items-center justify-center"><Loader2 className="animate-spin text-white/20" /></div>}>
                      <VideoPlayer 
                        src="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/visuals/youssef/crowdfunding/youssef-crowdfunding.mp4"
                        poster="/assets/common/branding/founder/youssef-poster.jpg"
                        aspectRatio="portrait"
                        subtitles={[
                          { label: 'English', srcLang: 'en', data: subtitles.en },
                          { label: 'Nederlands', srcLang: 'nl', data: subtitles.nl },
                          { label: 'Français', srcLang: 'fr', data: subtitles.fr },
                          { label: 'Italiano', srcLang: 'it', data: subtitles.it },
                          { label: 'العربية', srcLang: 'ar', data: subtitles.ar }
                        ]}
                      />
                    </Suspense>
                  </div>

                {/* DONOR OVERVIEW (Integrated) */}
                <ContainerInstrument className="bg-white/5 p-8 rounded-[32px] border border-white/5 backdrop-blur-md max-w-[500px] mx-auto w-full">
                  <HeadingInstrument level={4} className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex justify-between items-center">
                    <span><VoiceglotText translationKey="artist.donors.title" defaultText="Recent Supporters" /></span>
                    <span className="text-[#FFC421]">{artistData.donor_count || 0} <VoiceglotText translationKey="artist.donors.total" defaultText="total" /></span>
                  </HeadingInstrument>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    {donors.length > 0 ? donors.map((donor, idx) => (
                      <div key={idx} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
                        <div>
                          <TextInstrument className="text-[14px] font-black text-white/80">{donor.name}</TextInstrument>
                          {donor.message && <TextInstrument className="text-[12px] text-white/40 italic mt-1 line-clamp-2">&ldquo;{donor.message}&rdquo;</TextInstrument>}
                        </div>
                        <div className="text-right">
                          <TextInstrument className="text-[13px] font-black text-[#FFC421]">€{donor.amount}</TextInstrument>
                        </div>
                      </div>
                    )) : (
                      <TextInstrument className="text-[13px] text-white/20 italic text-center py-8">
                        <VoiceglotText translationKey="artist.donors.empty" defaultText="Be the first to support Youssef’s journey." />
                      </TextInstrument>
                    )}
                  </div>
                </ContainerInstrument>
              </>
            ) : (
              <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg group">
                <Image  
                  src={artistData.photo_url || '/placeholder-artist.jpg'} 
                  alt={artistData.display_name} 
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </ContainerInstrument>
            )}
          </ContainerInstrument>
          
          <ContainerInstrument className={cn(isYoussef ? "" : "lg:col-span-7", "pt-8")}>
            {/* Voices Artist Badge Removed */}

            <HeadingInstrument level={1} className={cn(
              "text-6xl md:text-8xl tracking-tighter leading-[0.9] mb-8 font-black uppercase",
              isYoussef ? 'text-white' : 'text-va-black'
            )}>
              {artistData.display_name}
            </HeadingInstrument>

            {isYoussef && (
              <ContainerInstrument id="support" className="bg-white/5 p-10 rounded-[32px] border border-white/10 mb-12 max-w-xl backdrop-blur-md shadow-aura-lg relative overflow-hidden group/support">
                <Suspense fallback={null}>
                  <LiquidBackground 
                    strokeWidth={1} 
                    className="opacity-20 group-hover/support:opacity-40 transition-opacity duration-1000" 
                  />
                </Suspense>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart size={120} className="text-[#FFC421] fill-current" />
                </div>

                <ContainerInstrument className="relative z-10">
                              <HeadingInstrument level={3} className="text-3xl font-black uppercase tracking-tight mb-2 text-white">
                                <VoiceglotText translationKey="artist.crowdfunding.title" defaultText="Support my first EP" />
                              </HeadingInstrument>
                              
                              <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-black text-[#FFC421]">€{artistData.donation_current || 0}</span>
                                <span className="text-sm text-white/20 font-medium">
                                  <VoiceglotText translationKey="artist.crowdfunding.goal_text" defaultText={`collected of €${artistData.donation_goal || 0} goal`} />
                                </span>
                                {donationAmount > 0 && (
                                  <span className="text-xs font-black text-[#FFC421]/60 ml-auto animate-pulse">
                                    +€{donationAmount} <VoiceglotText translationKey="artist.crowdfunding.impact" defaultText="impact" />
                                  </span>
                                )}
                              </div>
                              
                              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4 relative border border-white/5">
                                {/* Ghost Progress (Current + Selected) */}
                                <div 
                                  className="absolute top-0 left-0 h-full bg-[#FFC421]/30 transition-all duration-500 ease-out" 
                                  style={{ width: `${Math.min(((artistData.donation_current + donationAmount) / (artistData.donation_goal || 1)) * 100, 100)}%` }}
                                />
                                {/* Real Progress */}
                                <div 
                                  className="absolute top-0 left-0 h-full bg-[#FFC421] transition-all duration-1000 shadow-[0_0_20px_rgba(255,196,33,0.5)] z-10" 
                                  style={{ width: `${Math.min(((artistData.donation_current || 0) / (artistData.donation_goal || 1)) * 100, 100)}%` }}
                                />
                                {/* Milestone markers for 6 songs */}
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div 
                                    key={i}
                                    className="absolute top-0 bottom-0 w-px bg-va-black/60 z-20"
                                    style={{ left: `${(i / 6) * 100}%` }}
                                  />
                                ))}
                              </div>

                              <div className="grid grid-cols-3 w-full text-[9px] font-black uppercase tracking-[0.15em] mb-12">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#FFC421]">
                                    <VoiceglotText translationKey="artist.milestone.1.title" defaultText="01. Start" />
                                  </span>
                                  <span className="text-white/10">
                                    <VoiceglotText translationKey="artist.milestone.1.desc" defaultText="Base funding" />
                                  </span>
                                </div>
                                <div className={cn("flex flex-col gap-1 text-center transition-colors duration-500", (artistData.donation_current + donationAmount) / artistData.donation_goal >= 0.5 ? "text-[#FFC421]" : "text-white/20")}>
                                  <span>
                                    <VoiceglotText translationKey="artist.milestone.2.title" defaultText="02. Studio Booking" />
                                  </span>
                                  <span className="opacity-50">
                                    <VoiceglotText translationKey="artist.milestone.2.desc" defaultText="Producers & Band" />
                                  </span>
                                </div>
                                <div className={cn("flex flex-col gap-1 text-right transition-colors duration-500", (artistData.donation_current + donationAmount) / artistData.donation_goal >= 1 ? "text-[#FFC421]" : "text-white/20")}>
                                  <span>
                                    <VoiceglotText translationKey="artist.milestone.3.title" defaultText="03. Release Ready" />
                                  </span>
                                  <span className="opacity-50">
                                    <VoiceglotText translationKey="artist.milestone.3.desc" defaultText="Mixing & Mastering" />
                                  </span>
                                </div>
                              </div>

                  {/* AMOUNT INPUT ZONE */}
                  <div className="space-y-6 mb-8">
                    <div className="flex justify-between items-end">
                      <TextInstrument className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                        <VoiceglotText translationKey="artist.crowdfunding.choose_amount" defaultText="Choose amount" />
                      </TextInstrument>
                      <div className="text-3xl font-black text-white">€{donationAmount}</div>
                    </div>
                    
                    <input 
                      type="range"
                      min="5"
                      max="2500"
                      step="5"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FFC421]"
                    />

                    <div className="flex flex-wrap gap-2">
                      {[25, 100, 500, 1000].map((s) => (
                        <button
                          key={s}
                          onClick={() => setDonationAmount(s)}
                          className={cn(
                            "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border",
                            donationAmount === s 
                              ? 'bg-[#FFC421] border-[#FFC421] text-va-black shadow-aura scale-105' 
                              : 'bg-white/5 border-white/5 text-white/40 hover:border-[#FFC421]/40 hover:text-[#FFC421]'
                          )}
                        >
                          €{s}
                        </button>
                      ))}
                    </div>
                  </div>

                              <ButtonInstrument 
                                onClick={() => setIsDonationOpen(true)}
                                className="w-full py-6 rounded-[15px] bg-[#FFC421] text-va-black text-[15px] font-black uppercase tracking-widest hover:bg-white hover:text-va-black transition-all flex items-center justify-center gap-2 group shadow-aura"
                              >
                                <Heart strokeWidth={1.5} size={20} className="group-hover:scale-110 transition-transform fill-current" />
                                <VoiceglotText translationKey="artist.crowdfunding.cta" defaultText={`Donate €${donationAmount} now`} />
                              </ButtonInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            )}

        {/* SECTION 2: THE STORY (About Youssef) */}
        {isYoussef && (
          <SectionInstrument id="about" className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <ContainerInstrument className="prose leading-relaxed font-medium text-white/70 text-[15px]">
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter mb-8 text-white">
                <VoiceglotText translationKey="artist.story.title_prefix" defaultText="The" /> <span className="text-[#FFC421] italic"><VoiceglotText translationKey="artist.story.title_suffix" defaultText="Story" /></span>
              </HeadingInstrument>
              {artistData.bio?.split('\n').map((para: string, i: number) => (
                <TextInstrument key={i} className="mb-4 font-medium leading-relaxed text-[15px]">{para}</TextInstrument>
              ))}
            </ContainerInstrument>

            <ContainerInstrument className="flex flex-col gap-12">
              {/* VISION SECTION */}
              <div className="bg-white/5 p-10 rounded-[32px] border border-white/5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFC421]/20 to-transparent" />
                <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tighter mb-6 text-white">
                  <VoiceglotText translationKey="artist.vision.title_prefix" defaultText="The" /> <span className="text-[#FFC421] italic"><VoiceglotText translationKey="artist.vision.title_suffix" defaultText="Vision" /></span>
                </HeadingInstrument>
                <TextInstrument className="text-white/60 font-medium leading-relaxed italic text-[15px]">
                  &ldquo;{artistData.vision}&rdquo;
                </TextInstrument>
              </div>

              {/* MANIFESTO (The Why, How, What) */}
              <div className="bg-[#FFC421]/5 p-10 rounded-[32px] border border-[#FFC421]/10 relative overflow-hidden backdrop-blur-md">
                <HeadingInstrument level={3} className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFC421] mb-8">
                  <VoiceglotText translationKey="artist.manifesto.title" defaultText="Label Manifesto" />
                </HeadingInstrument>
                
                <div className="space-y-8">
                  <div>
                    <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                      <VoiceglotText translationKey="artist.manifesto.why.title" defaultText="Why" />
                    </HeadingInstrument>
                    <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                      {manifesto?.why || "We believe a real voice can move people. Voices that connect, not impress. That’s where music becomes meaningful. We believe the most moving music comes from honesty."}
                    </TextInstrument>
                  </div>
                  <div>
                    <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                      <VoiceglotText translationKey="artist.manifesto.how.title" defaultText="How" />
                    </HeadingInstrument>
                    <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                      {manifesto?.how || "By working with singers who dare to be themselves. By honoring authenticity, emotion and ownership. By creating a space of care and respect for the human voice."}
                    </TextInstrument>
                  </div>
                  <div>
                    <HeadingInstrument level={4} className="text-lg font-black uppercase tracking-tight text-white mb-2">
                      <VoiceglotText translationKey="artist.manifesto.what.title" defaultText="What" />
                    </HeadingInstrument>
                    <TextInstrument className="text-white/50 text-[14px] leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: manifesto?.what || "<strong>VOICES / Artists</strong> is a label for real voices and authentic singers. An independent label supporting and presenting voices from Belgium to their audience." }} />
                    </TextInstrument>
                  </div>
                </div>
              </div>
            </ContainerInstrument>
          </SectionInstrument>
        )}
          </ContainerInstrument>
        </SectionInstrument>

        {/*  PERFORMANCES SECTION */}
        {isYoussef && (
          <SectionInstrument id="music" className="mb-32">
            <div className="flex items-center gap-6 mb-16">
              <div className="h-px flex-grow bg-white/10" />
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter text-white">
                <VoiceglotText translationKey="artist.music.title_prefix" defaultText="The" /> <span className="text-[#FFC421] italic"><VoiceglotText translationKey="artist.music.title_suffix" defaultText="Music" /></span>
              </HeadingInstrument>
              <div className="h-px flex-grow bg-white/10" />
            </div>

            {/* ALBUM / EP PREVIEW */}
            {artistData.albums?.map((album: any) => (
              <ContainerInstrument key={album.id} className="mb-20 bg-white/5 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0">
                  <div className="relative aspect-square lg:aspect-auto bg-va-black">
                    <Image src={album.cover_url} alt={album.title} fill className="object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-va-black via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <TextInstrument className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFC421] mb-1">
                        <VoiceglotText translationKey={`artist.album.${album.id}.year`} defaultText={album.year} />
                      </TextInstrument>
                      <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tighter text-white">
                        <VoiceglotText translationKey={`artist.album.${album.id}.title`} defaultText={album.title} />
                      </HeadingInstrument>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="space-y-1">
                      {album.tracks.map((track: any, idx: number) => (
                        <div key={track.id} className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-all group",
                          track.is_locked ? "opacity-30" : "hover:bg-white/5 cursor-pointer"
                        )}>
                          <div className="flex items-center gap-6">
                            <span className="text-[11px] font-black text-white/20 w-4">{String(idx + 1).padStart(2, '0')}</span>
                            <div>
                              <TextInstrument className="text-[15px] font-bold text-white group-hover:text-[#FFC421] transition-colors">
                                <VoiceglotText translationKey={`artist.track.${track.id}.title`} defaultText={track.title} />
                              </TextInstrument>
                              <TextInstrument className="text-[11px] text-white/30 uppercase tracking-widest mt-0.5">
                                {track.is_locked ? (
                                  track.release_date ? (
                                    <VoiceglotText translationKey={`artist.track.${track.id}.release_date`} defaultText={`Release on ${track.release_date}`} />
                                  ) : (
                                    <VoiceglotText translationKey="artist.track.locked" defaultText="Locked" />
                                  )
                                ) : (
                                  <VoiceglotText translationKey="artist.track.preview" defaultText="Preview Available" />
                                )}
                              </TextInstrument>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <TextInstrument className="text-[11px] font-medium text-white/20">{track.duration}</TextInstrument>
                            {track.is_locked ? (
                              <Lock size={14} className="text-white/20" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FFC421]/20 flex items-center justify-center text-[#FFC421] group-hover:bg-[#FFC421] group-hover:text-va-black transition-all">
                                <Play size={12} fill="currentColor" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ContainerInstrument>
            ))}

            <div className="flex items-center gap-6 mb-12">
              <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-widest text-white/40">
                <VoiceglotText translationKey="artist.performances.title_prefix" defaultText="Live" /> <span className="text-white"><VoiceglotText translationKey="artist.performances.title_suffix" defaultText="Performances" /></span>
              </HeadingInstrument>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {artistData.demos?.map((demo: any) => (
                <div key={demo.id} className="flex flex-col gap-4 group">
                  <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-aura bg-va-black border border-white/5">
                    <Suspense fallback={<div className="w-full h-full bg-va-black flex items-center justify-center"><Loader2 className="animate-spin text-white/20" /></div>}>
                      <VideoPlayer 
                        src={demo.url}
                        aspectRatio="video"
                      />
                    </Suspense>
                  </div>
                  <div>
                    <TextInstrument className="text-white/40 text-[10px] font-black tracking-widest uppercase">{demo.category}</TextInstrument>
                    <HeadingInstrument level={4} className="text-white text-xl font-black uppercase tracking-tight group-hover:text-[#FFC421] transition-colors">{demo.title}</HeadingInstrument>
                  </div>
                </div>
              ))}
            </div>
          </SectionInstrument>
        )}
      </ContainerInstrument>

      <DonationModal 
        artistId={artistData.id}
        artistName={artistData.display_name}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        initialAmount={donationAmount}
      />
    </PageWrapperInstrument>
  );
}
