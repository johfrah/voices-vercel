import React, { Suspense } from 'react';
import ConfiguratorPageClient from './ConfiguratorPageClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';
import { requireAdminRedirect } from '@/lib/auth/server-auth';

export default async function ConfiguratorPage() {
  await requireAdminRedirect('/checkout/configurator');

  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <ConfiguratorPageClient />
    </Suspense>
  );
}
