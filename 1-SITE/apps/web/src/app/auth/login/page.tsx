"use client";

import React, { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function LoginPage() {
  return (
    <PageWrapperInstrument>
      <Suspense strokeWidth={1.5} fallback={<LoadingScreenInstrument / />}>
        <LoginPageClient strokeWidth={1.5} / />
      </Suspense>
    </PageWrapperInstrument>
  );
}
