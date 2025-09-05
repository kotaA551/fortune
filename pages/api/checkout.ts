import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getProvider } from '@/lib/payments/provider';
import { DB } from '@/lib/db';


const schema = z.object({
name: z.string().min(1),
birthdate: z.string().min(8),
email: z.string().email(),
gender: z.enum([
    'female', 'male', 'non-binary', 'transgender', 'genderqueer', 'prefer-not'
])
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });


const parsed = schema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: 'Bad request' });


const payload = {
...parsed.data,
amount: 330,
} as const;


const provider = getProvider();
const result = await provider.createCheckout(payload);


DB.upsert({
orderId: result.orderId,
name: payload.name,
birthdate: payload.birthdate,
email: payload.email,
gender: payload.gender,
amount: payload.amount,
status: 'pending'
});


res.json({ checkoutUrl: result.checkoutUrl, orderId: result.orderId });
}