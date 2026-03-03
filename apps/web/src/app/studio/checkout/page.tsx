import React, { Suspense } from 'react';
import CheckoutPageClient from '../../checkout/CheckoutPageClient';
import { MobileCheckoutSheet } from '@/components/checkout/MobileCheckoutSheet';
import { LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function StudioCheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <CheckoutPageClient />
      <MobileCheckoutSheet />
    </Suspense>
  );
}
