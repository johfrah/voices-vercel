"use client";

import React, { Suspense } from 'react';
import VoicePageClient from "./VoicePageClient";

export default function VoicePageClientWrapper({ results, filters, params, llmContext }: any) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoicePageClient actors={results} />
    </Suspense>
  );
}
