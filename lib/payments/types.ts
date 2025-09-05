export type CheckoutPayload = {
name: string;
birthdate: string; // YYYY-MM-DD
email: string;
gender: 'female'|'male'|'non-binary'|'transgender'|'genderqueer'|'prefer-not';
amount: number; // in JPY
};


export type CheckoutResponse = {
checkoutUrl: string; // 遷移先
orderId: string;
};


export type WebhookEvent = {
type: 'payment.succeeded' | 'payment.failed';
orderId: string;
};


export interface PaymentProvider {
createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse>;
parseWebhook(req: any): Promise<WebhookEvent | null>; // 署名検証は後で各社実装
}