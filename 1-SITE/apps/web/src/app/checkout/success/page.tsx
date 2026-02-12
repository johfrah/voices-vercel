import SuccessPageClient from './SuccessPageClient';
import { Suspense } from 'react';
import { LoadingScreenInstrument } from '@/components/ui/LayoutInstruments';

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <SuccessPageClient />
    </Suspense>
  );
}
