"use client";

import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  OptionInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  SelectInstrument,
  TextInstrument,
} from "@/components/ui/LayoutInstruments";
import { VoiceglotImage } from "@/components/ui/VoiceglotImage";
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { Actor } from "@/types";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type LightActor = Actor & {
  slug?: string;
  photo_url?: string | null;
  native_lang?: string | null;
  demos?: Array<{ audio_url?: string | null }>;
  status?: string | null;
  is_public?: boolean | null;
  menu_order?: number | null;
  total_sales?: number | null;
  voice_score?: number | null;
};

const CONTACT_EMAIL = "johfrah@voices.be";

function getActorName(actor: LightActor): string {
  return actor.display_name || actor.first_name || "Onbekende stem";
}

function getActorDemoUrl(actor: LightActor): string | null {
  const firstDemo = actor.demos?.find((demo) => typeof demo?.audio_url === "string" && demo.audio_url.length > 0);
  return firstDemo?.audio_url || null;
}

function buildMailto(actor: LightActor): string {
  const actorName = getActorName(actor);
  const slugLine = actor.slug ? `- Slug: ${actor.slug}\n` : "";
  const subject = encodeURIComponent(`Interesse in stem: ${actorName}`);
  const body = encodeURIComponent(
    `Dag Johfrah,\n\nIk heb interesse in deze stem:\n- Naam: ${actorName}\n${slugLine}\nKunnen jullie me contacteren met de mogelijkheden?\n\nMijn naam:\nMijn bedrijf:\nMijn briefing:\n\nGroeten,`
  );

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export function TemporaryLightMode() {
  const [actors, setActors] = useState<LightActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [activeActorId, setActiveActorId] = useState<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadActors = async () => {
      try {
        const response = await fetch("/api/actors/?lang=all");
        const data = await response.json();
        if (!mounted) return;

        const market = MarketManager.getCurrentMarket();
        const primaryLanguage = (market.primary_language || "nl-be").toLowerCase();
        const isDutchMarket = primaryLanguage.startsWith("nl");
        const allResults = Array.isArray(data?.results) ? data.results : [];

        const publicLiveResults = allResults.filter((actor: LightActor) => {
          const status = String(actor.status || "").toLowerCase();
          const hasStatus = status.length > 0;
          const actorIsPublic = typeof actor.is_public === "boolean" ? actor.is_public : true;
          const actorIsLive = hasStatus ? status === "live" : true;
          return actorIsPublic && actorIsLive;
        });

        const getLanguagePriority = (actor: LightActor): number => {
          const actorLangRaw = (actor.native_lang || "").toLowerCase();
          const actorLangCode = MarketManager.getLanguageCode(actorLangRaw).toLowerCase();

          if (actorLangCode === primaryLanguage) return 1;
          if (isDutchMarket && (actorLangRaw === "vlaams" || actorLangCode === "nl-be")) return 1;
          if (actorLangCode === "en-gb" || actorLangCode === "en-us") return 2;
          return 100;
        };

        const sorted = [...publicLiveResults].sort((actorA: LightActor, actorB: LightActor) => {
          const menuOrderA = actorA.menu_order ?? 999999;
          const menuOrderB = actorB.menu_order ?? 999999;
          if (menuOrderA !== menuOrderB) return menuOrderA - menuOrderB;

          const languagePriorityA = getLanguagePriority(actorA);
          const languagePriorityB = getLanguagePriority(actorB);
          if (languagePriorityA !== languagePriorityB) return languagePriorityA - languagePriorityB;

          const salesA = actorA.total_sales ?? 0;
          const salesB = actorB.total_sales ?? 0;
          if (salesA !== salesB) return salesB - salesA;

          const voiceScoreA = actorA.voice_score ?? 0;
          const voiceScoreB = actorB.voice_score ?? 0;
          if (voiceScoreA !== voiceScoreB) return voiceScoreB - voiceScoreA;

          return getActorName(actorA).localeCompare(getActorName(actorB));
        });

        setActors(sorted);
      } catch {
        if (mounted) setActors([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadActors();

    return () => {
      mounted = false;
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
    };
  }, []);

  const languageOptions = useMemo(() => {
    const market = MarketManager.getCurrentMarket();
    const supported = market.supported_languages || [];
    const actorLanguages = new Set<string>();

    for (const actor of actors) {
      if (actor.native_lang) actorLanguages.add(MarketManager.getLanguageCode(actor.native_lang));
    }

    const normalizedSupported = supported
      .map((lang: string) => MarketManager.getLanguageCode(lang))
      .filter((lang: string) => actorLanguages.has(lang));

    return ["all", ...normalizedSupported];
  }, [actors]);

  const filteredActors = useMemo(() => {
    if (languageFilter === "all") return actors;
    return actors.filter((actor) => {
      const actorLanguageCode = MarketManager.getLanguageCode(actor.native_lang || "").toLowerCase();
      return actorLanguageCode === languageFilter.toLowerCase();
    });
  }, [actors, languageFilter]);

  const toggleAudio = (actor: LightActor) => {
    const demoUrl = getActorDemoUrl(actor);
    if (!demoUrl) return;

    if (activeActorId === actor.id && activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setActiveActorId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    const audio = new Audio(demoUrl);
    audio.onended = () => {
      setActiveActorId(null);
      activeAudioRef.current = null;
    };
    activeAudioRef.current = audio;
    setActiveActorId(actor.id);
    audio.play().catch(() => {
      setActiveActorId(null);
      activeAudioRef.current = null;
    });
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white text-va-black dark:bg-va-black dark:text-white">
      <SectionInstrument className="py-16 md:py-20">
        <ContainerInstrument className="max-w-6xl mx-auto px-4 md:px-6">
          <ContainerInstrument className="space-y-4 text-center mb-10">
            <HeadingInstrument level={1} className="text-4xl md:text-6xl font-light tracking-tighter">
              Vind de stem voor jouw verhaal.
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 dark:text-white/70">
              Snel, simpel en technisch perfect. Beluister en mail je briefing direct.
            </TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="max-w-sm mx-auto mb-10">
            <TextInstrument className="text-xs uppercase tracking-widest text-va-black/50 dark:text-white/50 mb-2">
              Filter op taal
            </TextInstrument>
            <SelectInstrument
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              className="w-full min-h-[44px] rounded-[10px] border border-black/10 bg-white px-4 text-sm dark:bg-va-black dark:border-white/20"
            >
              {languageOptions.map((option) => (
                <OptionInstrument key={option} value={option}>
                  {option === "all" ? "Alle talen" : MarketManager.getLanguageLabel(option)}
                </OptionInstrument>
              ))}
            </SelectInstrument>
          </ContainerInstrument>

          {isLoading ? (
            <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <ContainerInstrument
                  key={`light-loading-${index}`}
                  className="h-[360px] rounded-[14px] bg-white animate-pulse border border-black/5 dark:bg-white/10 dark:border-white/10"
                />
              ))}
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActors.map((actor) => {
                const actorName = getActorName(actor);
                const demoUrl = getActorDemoUrl(actor);
                const isPlaying = activeActorId === actor.id;

                return (
                  <ContainerInstrument
                    key={actor.id}
                    className="rounded-[14px] border border-black/10 bg-white overflow-hidden dark:bg-va-black dark:border-white/20"
                  >
                    <ContainerInstrument className="relative aspect-[4/3] bg-va-black/5 dark:bg-white/10">
                      {actor.photo_url ? (
                        <VoiceglotImage
                          src={actor.photo_url}
                          alt={actorName}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </ContainerInstrument>

                    <ContainerInstrument className="p-4 space-y-3">
                      <ContainerInstrument className="space-y-1">
                        <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
                          {actorName}
                        </HeadingInstrument>
                        <TextInstrument className="text-sm text-va-black/60 dark:text-white/60">
                          {MarketManager.getLanguageLabel(actor.native_lang || "") || "Onbekende taal"}
                        </TextInstrument>
                      </ContainerInstrument>

                      <ContainerInstrument className="grid grid-cols-2 gap-2">
                        <ButtonInstrument
                          onClick={() => toggleAudio(actor)}
                          disabled={!demoUrl}
                          className="min-h-[44px] rounded-[10px] bg-white border border-black/15 text-va-black text-sm dark:bg-white/5 dark:text-white dark:border-white/20"
                        >
                          <ContainerInstrument className="flex items-center justify-center gap-2">
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            {isPlaying ? "Pauzeer" : "Beluister"}
                          </ContainerInstrument>
                        </ButtonInstrument>

                        <ButtonInstrument
                          onClick={() => {
                            window.location.href = buildMailto(actor);
                          }}
                          className="min-h-[44px] rounded-[10px] bg-va-black text-white text-sm dark:bg-white dark:text-va-black"
                        >
                          Interesse
                        </ButtonInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                );
              })}
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
