import React, { Suspense } from 'react';
import PartnerDashboardClient from './PartnerDashboardClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function PartnerDashboard() {
  return (
    <PageWrapperInstrument>
      <Suspense  fallback={<LoadingScreenInstrument />}>
        <PartnerDashboardClient strokeWidth={1.5} />
      </Suspense>
    </PageWrapperInstrument>
  );
}
