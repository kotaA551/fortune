// 例: モックの parseWebhook
import type { NextApiRequest } from 'next';
import type { WebhookEvent } from './types';

export async function parseWebhook(req: NextApiRequest): Promise<WebhookEvent | null> {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body?.type || !body?.orderId) return null;
  return { type: body.type, orderId: body.orderId } as WebhookEvent;
}
