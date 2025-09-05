// lib/payments/mock.ts
import type { NextApiRequest } from 'next';
import {
  PaymentProvider,
  CheckoutPayload,
  CheckoutResponse,
  WebhookEvent,
} from './types';

// モック: チェックアウトURLは自サイトの簡易ページへ
export class MockProvider implements PaymentProvider {
  async createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const orderId = 'ord_' + Math.random().toString(36).slice(2, 10);
    const qs = new URLSearchParams({
      orderId,
      name: payload.name,
      birthdate: payload.birthdate,
      email: payload.email,
      gender: payload.gender,
      amount: String(payload.amount),
    });
    return {
      checkoutUrl: `/checkout/${orderId}?` + qs.toString(),
      orderId,
    };
  }

  // ESLint対策: any禁止 → NextApiRequest を使う
  async parseWebhook(req: NextApiRequest): Promise<WebhookEvent | null> {
    // Vercel/Nextの都合で body が string のこともある
    const raw = typeof req.body === 'string' ? safeJSON(req.body) : req.body ?? {};

    // 互換: { type: 'payment.succeeded'|'payment.failed', orderId }
    if (isWebhookByType(raw)) {
      return { type: raw.type, orderId: raw.orderId };
    }

    // 互換: { orderId, ok: boolean }  ← 旧モックUI
    if (isWebhookByOk(raw)) {
      return { type: raw.ok ? 'payment.succeeded' : 'payment.failed', orderId: raw.orderId };
    }

    return null;
  }
}

// ---- helpers ----
function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return {}; }
}

function isWebhookByType(x: unknown): x is { type: 'payment.succeeded' | 'payment.failed'; orderId: string } {
  return !!x &&
    typeof (x as any).orderId === 'string' &&
    ((x as any).type === 'payment.succeeded' || (x as any).type === 'payment.failed');
}

function isWebhookByOk(x: unknown): x is { orderId: string; ok: boolean } {
  return !!x &&
    typeof (x as any).orderId === 'string' &&
    typeof (x as any).ok === 'boolean';
}
