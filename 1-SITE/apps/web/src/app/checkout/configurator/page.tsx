import React, { Suspense } from 'react';
import ConfiguratorPageClient from './ConfiguratorPageClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <ConfiguratorPageClient />
    </Suspense>
  );
}
