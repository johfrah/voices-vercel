import React from 'react';
import CartPageClient from './CartPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Winkelmand | Voices',
  description: 'Bekijk je geselecteerde stemmen en projectdetails.',
};

export default function CartPage() {
  return <CartPageClient />;
}
