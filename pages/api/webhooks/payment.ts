// pages/api/webhooks/payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getProvider } from '@/lib/payments/provider';
import { DB } from '@/lib/db';
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

  // ローカル or Vercel で挙動を分ける
  const isLocal = !process.env.VERCEL;

  if (evt.type === 'payment.succeeded') {
    // 1) ステータス反映
    DB.setStatus(evt.orderId, 'paid');

    // 2) PDF の配布URLを決定（ローカルは保存、Vercelは都度生成APIのURL）
    const order = DB.get(evt.orderId);
    if (order) {
      let pdfUrl: string;

      if (isLocal) {
        // ローカル開発: public/reports に保存してURLを返す
        const { generateAndStorePdfLocal } = await import('@/server/generatePdf');
        pdfUrl = await generateAndStorePdfLocal(order);
      } else {
        // Vercel本番: 永続ストレージ無し → ダウンロードAPIで都度生成
        pdfUrl = `/api/reports/${order.orderId}`;
      }

      DB.setPdf(order.orderId, pdfUrl);

      // 3) メール送信（失敗しても致命ではない）
      try {
        const base = process.env.APP_BASE_URL || 'https://example.com';
        await sendReceiptEmail(order, `${base}${pdfUrl}`);
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
