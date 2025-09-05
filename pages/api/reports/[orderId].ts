// pages/api/reports/[orderId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { DB } from '@/lib/db';
import { generatePdfBuffer } from '@/server/generatePdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'invalid orderId' });
  }

  const order = DB.get(orderId);
  if (!order || order.status !== 'paid') {
    return res.status(404).json({ error: 'order not found or not paid' });
  }

  const buf = await generatePdfBuffer(order);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${orderId}.pdf"`);
  res.send(buf);
}
