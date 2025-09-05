// lib/payments/provider.ts
import type { PaymentProvider } from './types';
import { MockProvider } from './mock';

/**
 * 今はモックを返す。将来は環境変数で切り替え:
 * PAYMENT_PROVIDER = 'mock' | 'gmopg' | 'sbps' など
 */
export function getProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();

  switch (name) {
    // case 'gmopg': return new GmoPgProvider();
    // case 'sbps':  return new SbpsProvider();
    case 'mock':
    default:
      return new MockProvider();
  }
}

export type { PaymentProvider } from './types';
export * from './types';
