// lib/payments/types.ts
import type { NextApiRequest } from 'next';

export type CheckoutPayload = {
  name: string;
  birthdate: string; // YYYY-MM-DD
  email: string;
  gender: 'female' | 'male' | 'non-binary' | 'transgender' | 'genderqueer' | 'prefer-not';
  amount: number; // JPY
};

export type CheckoutResponse = {
  checkoutUrl: string; // 遷移先
  orderId: string;
};

export type WebhookEvent = {
  type: 'payment.succeeded' | 'payment.failed';
  orderId: string;
};

export interface PaymentProvider {
  createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse>;
  // 署名検証は各社実装。Next.jsのAPIリクエスト型を使う
  parseWebhook(req: NextApiRequest): Promise<WebhookEvent | null>;
}
