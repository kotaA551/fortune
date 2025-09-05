// pages/index.tsx
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    birthdate: '',
    email: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      alert('エラー: ' + data?.error);
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
            3分でPDFお届け
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-grow px-6 py-10 md:grid-cols-2 md:gap-10">
        {/* Left: Hero copy */}
        <section className="order-2 mt-8 md:order-1 md:mt-0">
          <h1 className="text-balance text-3xl font-bold leading-tight text-rose-900 md:text-4xl">
            あなただけの
            <span className="bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              占いPDF
            </span>
            をお届け
          </h1>
          <p className="mt-4 text-sm leading-6 text-rose-700/80">
            お名前・生年月日を入力して決済するだけ。数十秒でダウンロードOK。
            恋愛、仕事、金運、健康、総合運について占います。
          </p>

          <ul className="mt-6 space-y-2 text-sm text-rose-700/80">
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
              日本語フォント埋め込みの見やすいPDF
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              後から何度でも再ダウンロード可能
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
              免責明記で安心
            </li>
          </ul>
        </section>

        {/* Right: Form card */}
        <section className="order-1 md:order-2">
          <div className="rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-[0_10px_40px_rgba(236,72,153,0.15)] backdrop-blur">
            <h2 className="text-lg font-semibold text-rose-900">お申込み</h2>
            <p className="mt-1 text-xs text-rose-700/70">
              入力 → 決済 → 自動生成してお届けします
            </p>

            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <label className="text-sm text-rose-900/90">
                お名前
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-[1rem] border border-rose-200/70 bg-white px-3 py-2 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="例）山田 花子"
                />
              </label>

              <label className="text-sm text-rose-900/90">
                性別
                <select
                    required
                    value={form.gender || ''}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="mt-1 w-full rounded-[1rem] border border-rose-200/70 bg-white px-3 py-2 text-rose-900 shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                >
                    <option value="" disabled>
                    選択してください
                    </option>
                    <option value="female">女性</option>
                    <option value="male">男性</option>
                    <option value="non-binary">ノンバイナリー</option>
                    <option value="transgender">トランスジェンダー</option>
                    <option value="genderqueer">ジェンダークィア</option>
                    <option value="prefer-not">回答しない</option>
                </select>
              </label>

              <label className="text-sm text-rose-900/90">
                生年月日
                <input
                  type="date"
                  required
                  value={form.birthdate}
                  onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  className="mt-1 w-full rounded-[1rem] border border-rose-200/70 bg-white px-3 py-2 text-rose-900 shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <label className="text-sm text-rose-900/90">
                メール
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-[1rem] border border-rose-200/70 bg-white px-3 py-2 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="hanako@example.com"
                />
              </label>

              <button
                disabled={loading}
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-[1rem] bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? '作成中…' : '決済へ進む（¥330）[税込]'}
              </button>

              <p className="mt-2 text-[11px] leading-5 text-rose-700/70">
                ※本サービスはエンタメ用途の一般的なリーディングです。医療・法律・投資等の専門助言は提供しません。
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 pb-10">
        <div className="rounded-2xl border border-rose-100 bg-white/60 p-4 text-center text-xs text-rose-700/70 backdrop-blur">
          <nav className="mb-2 flex justify-center gap-4 text-[11px] text-rose-600/80 underline-offset-2 hover:[&_a]:text-rose-800">
            <Link href="/terms" className="hover:text-rose-800">特定商取引法に基づく表記</Link>
            <Link href="/privacy" className="hover:text-rose-800">プライバシーポリシー</Link>
          </nav>
          © {new Date().getFullYear()} Fortune Atelier
        </div>
      </footer>
    </div>
  );
}
