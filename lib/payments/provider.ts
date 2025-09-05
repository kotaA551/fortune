import { PaymentProvider } from './types';
import { MockProvider } from './mock';


// ここに将来: import { GmoPgProvider } from './gmo'; import { SbpsProvider } from './sbps';


export function getProvider(): PaymentProvider {
const key = process.env.PAYMENT_PROVIDER || 'mock';
switch (key) {
// case 'gmo': return new GmoPgProvider();
// case 'sbps': return new SbpsProvider();
default: return new MockProvider();
}
}