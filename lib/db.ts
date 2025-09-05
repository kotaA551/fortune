// プロト用に Nodeプロセス内で保存（再起動で消える）。
// 本番は Firestore / MySQL / PostgreSQL に置き換え。


export type Order = {
orderId: string;
name: string;
birthdate: string;
email: string;
gender: string;
amount: number;
status: 'pending'|'paid'|'failed';
pdfUrl?: string;
};


const store = new Map<string, Order>();


export const DB = {
upsert(order: Order) {
store.set(order.orderId, order);
return order;
},
get(orderId: string) {
return store.get(orderId) || null;
},
setStatus(orderId: string, status: Order['status']) {
const o = store.get(orderId);
if (!o) return null;
o.status = status;
store.set(orderId, o);
return o;
},
setPdf(orderId: string, pdfUrl: string) {
const o = store.get(orderId);
if (!o) return null;
o.pdfUrl = pdfUrl;
store.set(orderId, o);
return o;
}
};