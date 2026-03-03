import React from 'react';
import type { Metadata } from 'next';
import CartPageClient from '../../cart/CartPageClient';

export const metadata: Metadata = {
  title: 'Studio Overzicht | Voices',
  description: 'Bekijk je workshop-inschrijving en rond veilig af.',
};

export default function StudioCartPage() {
  return <CartPageClient />;
}
