// pages/api/webhooks/payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getProvider } from '@/lib/payments/provider';
import { DB } from '@/lib/db';
import { generateAndStorePdf } from '@/server/generatePdf';
import { sendReceiptEmail } from '@/server/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Webhook は基本 POST 想定
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const provider = getProvider();

  // 決済プロバイダごとに署名検証 → 標準化イベントにパース
  const evt = await provider.parseWebhook(req);
  if (!evt) {
    return res.status(400).json({ error: 'invalid event' });
  }

  if (evt.type === 'payment.succeeded') {
    // 1) ステータス反映
    DB.setStatus(evt.orderId, 'paid');

    // 2) PDF 生成 → 保存
    const order = DB.get(evt.orderId);
    if (order) {
      const pdfUrl = await generateAndStorePdf(order);
      DB.setPdf(evt.orderId, pdfUrl);

      // 3) メール送信（失敗しても致命ではない）
      try {
        await sendReceiptEmail(order, pdfUrl);
      } catch (e) {
        console.error('email send failed', e);
      }
    }
  } else if (evt.type === 'payment.failed') {
    DB.setStatus(evt.orderId, 'failed');
  }

  // プロバイダに 200 を返す
  return res.status(200).json({ ok: true });
}

// 署名検証で rawBody が必要なプロバイダ（本番のGMO-PG/SBPS想定）に備え、
// 必要になったらここで bodyParser を無効化して raw を渡す。
// export const config = { api: { bodyParser: false } };
