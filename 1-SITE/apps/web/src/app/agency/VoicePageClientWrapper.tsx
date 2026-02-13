"use client";

import React, { Suspense } from 'react';
import VoicePageClient from "./VoicePageClient";
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export default function VoicePageClientWrapper({ results, filters, params, llmContext }: any) {
  return (
    <Suspense fallback={<div><VoiceglotText translationKey="auto.voicepageclientwrapper.loading___.8524de" defaultText="Loading..." /></div>}>
      <VoicePageClient actors={results} />
    </Suspense>
  );
}
