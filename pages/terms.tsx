// pages/terms.tsx
export default function Terms() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-violet-50 px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-rose-100 bg-white/85 p-8 backdrop-blur">
        <h1 className="text-2xl font-bold text-rose-900">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          以下は本サービスの取引条件等に関する表示です。適宜、実情報に書き換えてください。
        </p>

        <dl className="mt-6 divide-y divide-rose-100">
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="col-span-1 text-sm font-medium text-rose-900/90">事業者名</dt>
            <dd className="col-span-2 text-sm text-rose-800">（例）フォーチュンアトリエ株式会社</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">運営責任者</dt>
            <dd className="col-span-2 text-sm text-rose-800">（例）山田 太郎</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">所在地</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              （例）〒123-4567 東京都〇〇区〇〇 1-2-3 〇〇ビル 5F
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">連絡先</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              メール：support@example.com（※土日祝を除く2営業日以内にご返信）
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">販売URL</dt>
            <dd className="col-span-2 text-sm text-rose-800">https://your-domain.example</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">販売価格</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              各商品ページに税込価格を表示（例：¥1,980）
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">代金の支払方法</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              クレジットカード／デビットカード／コンビニ決済／キャリア決済 等（導入ゲートウェイに準拠）
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">支払時期</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              ご注文時にお支払いが確定します（前払い）
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">商品の引渡時期</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              決済完了後、システムにて自動生成し速やかにダウンロード提供／メール送付します。
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">返品・キャンセル</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              デジタルコンテンツの性質上、決済完了後の返品・返金は原則不可。重複決済・著しい不具合等は
              個別に対応します。まずはお問い合わせください。
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">動作環境</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              PDF閲覧可能な端末／アプリをご用意ください。スマートフォン／PCに対応。
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm font-medium text-rose-900/90">表現・商品に関する注意</dt>
            <dd className="col-span-2 text-sm text-rose-800">
              本サービスは娯楽（エンタメ）用途の一般的なリーディングであり、医療・法律・投資等の専門的
              助言を提供するものではありません。
            </dd>
          </div>
        </dl>

        <div className="mt-8 text-right">
          <a href="/" className="text-sm text-rose-600 underline underline-offset-2 hover:text-rose-800">
            ← トップへ戻る
          </a>
        </div>
      </div>
    </main>
  );
}
