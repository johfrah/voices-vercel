import React, { Suspense } from 'react';
import CheckoutPageClient from './CheckoutPageClient';
import { MobileCheckoutSheet } from '@/components/checkout/MobileCheckoutSheet';
import { PageWrapperInstrument, LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <Check strokeWidth={1.5}outPageClient />
      <MobileCheckoutSheet />
    </Suspense>
  );
}
