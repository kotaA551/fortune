// pages/thankyou.tsx
import { useEffect, useState } from 'react';

export default function Thankyou() {
  const [orderId, setOrderId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('orderId') || '';
    setOrderId(id);

    // ポーリングでPDF完成を待つ
    const tick = async () => {
      const res = await fetch('/api/order?orderId=' + id);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        setLoading(false);
      }
    };
    tick();
    const t = setInterval(tick, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-violet-50 flex flex-col">
      {/* Header */}
      <header className="mx-auto w-full max-w-5xl px-6 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[1.2rem] bg-gradient-to-br from-rose-400 to-fuchsia-500 shadow-lg"></div>
            <span className="text-lg font-semibold tracking-tight text-rose-700">
              Fortune Atelier
            </span>
          </div>
          <span className="rounded-full border border-rose-200/70 bg-white/70 px-3 py-1 text-xs text-rose-600 backdrop-blur">
            ご購入ありがとうございます
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex-grow w-full max-w-md px-6 py-10">
        <div className="rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-[0_10px_40px_rgba(236,72,153,0.15)] backdrop-blur text-rose-900">
          <h1 className="text-lg font-semibold">ありがとうございます！</h1>
          <p className="mt-1 text-xs text-rose-700/70">
            決済が完了しました。レポートの準備ができ次第、ダウンロードできます。
          </p>

          <dl className="mt-5 space-y-3 text-sm text-rose-900/90">
            <div className="flex justify-between">
              <dt className="font-medium">注文ID</dt>
              <dd className="font-mono">{orderId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">ステータス</dt>
              <dd>{loading ? 'PDFを生成中…' : '準備完了'}</dd>
            </div>
          </dl>

          {/* 状態表示 */}
          {loading ? (
            <div className="mt-6 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
              <span className="ml-2 text-sm text-rose-700/80">
                数秒〜十数秒お待ちください
              </span>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              <a
                href={pdfUrl}
                download
                className="inline-flex w-full items-center justify-center rounded-[1rem] bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
              >
                PDFをダウンロード
              </a>
              <a
                href="/"
                className="inline-flex w-full items-center justify-center rounded-[1rem] border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50"
              >
                トップへ戻る
              </a>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-5 text-rose-700/70">
            ※ダウンロードボタンが反応しない場合は、数秒後にページを再読み込みしてください。
          </p>
        </div>
      </main>

      {/* Footer */}
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
