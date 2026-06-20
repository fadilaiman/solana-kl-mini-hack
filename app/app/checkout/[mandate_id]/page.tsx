'use client';

import WalletConnectionProvider from '@/app/components/WalletConnectionProvider';
import CheckoutClient from './CheckoutClient';

export default function CheckoutPage({ params }: { params: { mandate_id: string } }) {
  return (
    <WalletConnectionProvider>
      <CheckoutClient mandateId={params.mandate_id} />
    </WalletConnectionProvider>
  );
}
