import { PaymentProvider, CheckoutPayload, CheckoutResponse, WebhookEvent } from './types';


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
amount: String(payload.amount)
});
return {
checkoutUrl: `/checkout/${orderId}?` + qs.toString(),
orderId
};
}


async parseWebhook(req: any): Promise<WebhookEvent | null> {
// モック用: フロントから直接POSTされたJSONをそのまま採用
try {
const { orderId, ok } = req.body || {};
if (!orderId) return null;
return {
type: ok ? 'payment.succeeded' : 'payment.failed',
orderId
};
} catch {
return null;
}
}
}