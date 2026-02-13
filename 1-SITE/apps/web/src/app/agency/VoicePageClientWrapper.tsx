"use client";

import React, { Suspense } from 'react';
import VoicePageClient from "./VoicePageClient";
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export default function VoicePageClientWrapper({ results, filters, params, llmContext }: any) {
  return (
    <Suspense strokeWidth={1.5} fallback={<div><VoiceglotText strokeWidth={1.5} translationKey="auto.voicepageclientwrapper.loading___.8524de" defaultText="Loading..." / /></div>}>
      <VoicePageClient strokeWidth={1.5} actors={results} / />
    </Suspense>
  );
}
