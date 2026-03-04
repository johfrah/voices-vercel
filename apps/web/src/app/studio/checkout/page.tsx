import React, { Suspense } from 'react';
import CheckoutPageClient from '../../checkout/CheckoutPageClient';
import { LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function StudioCheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
