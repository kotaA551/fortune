// lib/payments/mock.ts
import type { NextApiRequest } from 'next';
import {
  PaymentProvider,
  CheckoutPayload,
  CheckoutResponse,
  WebhookEvent,
} from './types';

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
      checkoutUrl: `/checkout/${orderId}?${qs.toString()}`,
      orderId,
    };
  }

  async parseWebhook(req: NextApiRequest): Promise<WebhookEvent | null> {
    const rawBody = typeof req.body === 'string' ? safeJSON(req.body) : (req.body ?? {});
    if (isWebhookByType(rawBody)) {
      return { type: rawBody.type, orderId: rawBody.orderId };
    }
    if (isWebhookByOk(rawBody)) {
      return { type: rawBody.ok ? 'payment.succeeded' : 'payment.failed', orderId: rawBody.orderId };
    }
    return null;
  }
}

/* ---------- helpers ---------- */

function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return {}; }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isWebhookByType(
  x: unknown
): x is { type: 'payment.succeeded' | 'payment.failed'; orderId: string } {
  if (!isRecord(x)) return false;
  const t = x['type'];
  const id = x['orderId'];
  const validType = t === 'payment.succeeded' || t === 'payment.failed';
  return validType && typeof id === 'string';
}

function isWebhookByOk(
  x: unknown
): x is { orderId: string; ok: boolean } {
  if (!isRecord(x)) return false;
  const id = x['orderId'];
  const ok = x['ok'];
  return typeof id === 'string' && typeof ok === 'boolean';
}
