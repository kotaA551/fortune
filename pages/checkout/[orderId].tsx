import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Checkout() {
  const router = useRouter();
  const { orderId, name, amount } = router.query;
  const [loading, setLoading] = useState(false);

  const pay = async (success: boolean) => {
    setLoading(true);
    await fetch('/api/webhooks/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: success ? 'payment.succeeded' : 'payment.failed',
        orderId,
      }),
    });
    setLoading(false);
    if (success) {
      router.push('/thankyou?orderId=' + orderId);
    } else {
      alert('支払いに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-violet-50 flex flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[1.2rem] bg-gradient-to-br from-rose-400 to-fuchsia-500 shadow-lg"></div>
            <span className="text-lg font-semibold tracking-tight text-rose-700">
              Fortune Atelier
            </span>
          </div>
          <span className="rounded-full border border-rose-200/70 bg-white/70 px-3 py-1 text-xs text-rose-600 backdrop-blur">
            安全な決済ページ
          </span>
        </div>
      </header>

      <main className="mx-auto flex-grow w-full max-w-md px-6 py-10">
        <div className="rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-[0_10px_40px_rgba(236,72,153,0.15)] backdrop-blur">
          <h1 className="text-lg font-semibold text-rose-900">お支払い（モック）</h1>
          <p className="mt-1 text-xs text-rose-700/70">
            以下の内容をご確認ください。
          </p>

          <dl className="mt-5 space-y-3 text-sm text-rose-900/90">
            <div className="flex justify-between">
              <dt className="font-medium">注文ID</dt>
              <dd>{orderId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">お名前</dt>
              <dd>{name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">金額</dt>
              <dd>¥{amount}</dd>
            </div>
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              disabled={loading}
              onClick={() => pay(true)}
              className="rounded-[1rem] bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? '処理中…' : '支払う（成功）'}
            </button>
            <button
              disabled={loading}
              onClick={() => pay(false)}
              className="rounded-[1rem] border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              支払失敗
            </button>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10">
        <div className="rounded-2xl border border-rose-100 bg-white/60 p-4 text-center text-xs text-rose-700/70 backdrop-blur">
          <nav className="mb-2 flex justify-center gap-4 text-[11px] text-rose-600/80 underline-offset-2 hover:[&_a]:text-rose-800">
            <a href="/terms">特定商取引法に基づく表記</a>
            <a href="/privacy">プライバシーポリシー</a>
          </nav>
          © {new Date().getFullYear()} Fortune Atelier
        </div>
      </footer>
    </div>
  );
}
