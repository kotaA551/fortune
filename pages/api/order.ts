import type { NextApiRequest, NextApiResponse } from 'next';
import { DB } from '@/lib/db';


export default function handler(req: NextApiRequest, res: NextApiResponse) {
const orderId = req.query.orderId as string;
const o = DB.get(orderId);
if (!o) return res.status(404).json({ error: 'not found' });
res.json({ status: o.status, pdfUrl: o.pdfUrl || null });
}