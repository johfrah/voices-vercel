import { Suspense } from 'react';
import AccountDashboardClient from './AccountDashboardClient';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function AccountDashboard() {
  return (
    <PageWrapperInstrument>
      <Suspense  fallback={<LoadingScreenInstrument />}>
        <AccountDashboardClient strokeWidth={1.5} />
      </Suspense>
    </PageWrapperInstrument>
  );
}
