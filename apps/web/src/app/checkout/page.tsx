import React, { Suspense } from 'react';
import CheckoutPageClient from './CheckoutPageClient';
import { LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function CheckoutPage() {
  return (
    <Suspense  fallback={<LoadingScreenInstrument />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
