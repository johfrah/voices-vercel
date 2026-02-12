"use client";

import React, { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function LoginPage() {
  return (
    <PageWrapperInstrument>
      <Suspense fallback={<LoadingScreenInstrument />}>
        <LoginPageClient />
      </Suspense>
    </PageWrapperInstrument>
  );
}
