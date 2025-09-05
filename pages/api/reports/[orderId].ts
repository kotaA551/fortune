// pages/api/reports/[orderId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { DB } from '@/lib/db';
import { generatePdfBuffer } from '@/server/generatePdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { orderId } = req.query;
  if (typeof orderId !== 'string') return res.status(400).end('bad orderId');

  const order = DB.get(orderId);
  if (!order) return res.status(404).end('not found');

  // もし未決済なら拒否（任意）
  if (order.status !== 'paid') return res.status(403).end('not paid');

  const buf = await generatePdfBuffer(order);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${orderId}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.send(buf);
}
