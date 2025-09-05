// pages/api/webhooks/payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getProvider } from '@/lib/payments/provider';
import { DB } from '@/lib/db';
import { generateAndStorePdfLocal } from '@/server/generatePdf'; // ← ローカル用だけimport
import { sendReceiptEmail } from '@/server/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const provider = getProvider();
  const evt = await provider.parseWebhook(req);
  if (!evt) return res.status(400).json({ error: 'invalid event' });

  const isLocal = !process.env.VERCEL;

  if (evt.type === 'payment.succeeded') {
    DB.setStatus(evt.orderId, 'paid');

    const order = DB.get(evt.orderId);
    if (order) {
      let pdfUrl: string;

      if (isLocal) {
        // ローカル: ファイルとして保存
        pdfUrl = await generateAndStorePdfLocal(order);
      } else {
        // Vercel: 保存しない。ダウンロードAPIを指す
        pdfUrl = `/api/reports/${order.orderId}`;
      }

      DB.setPdf(evt.orderId, pdfUrl);

      try {
        const base = process.env.APP_BASE_URL ?? '';
        await sendReceiptEmail(order, `${base}${pdfUrl}`);
      } catch (e) {
        console.error('email send failed', e);
      }
    }
  } else if (evt.type === 'payment.failed') {
    DB.setStatus(evt.orderId, 'failed');
  }

  return res.status(200).json({ ok: true });
}

// 署名検証が必要になったら bodyParser を切る↓
// export const config = { api: { bodyParser: false } };
