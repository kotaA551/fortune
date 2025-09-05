// pages/privacy.tsx
export default function Privacy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-violet-50 px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-rose-100 bg-white/85 p-8 backdrop-blur">
        <h1 className="text-2xl font-bold text-rose-900">プライバシーポリシー</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          フォーチュンアトリエ（以下「当社」）は、当社の提供する占いPDFサービス（以下「本サービス」）における
          利用者様の個人情報を、以下の方針に基づき適切に取り扱います。
        </p>

        <section className="mt-6 space-y-6 text-sm text-rose-900/90">
          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">1. 取得する情報</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>氏名、メールアドレス、生年月日、入力フォームの各種項目</li>
              <li>決済情報（決済事業者を通じて処理。カード番号等を当社が保持しない設計を基本とします）</li>
              <li>アクセスログ、クッキー等の技術情報（利便性向上・不正防止・統計分析のため）</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">2. 利用目的</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>占いPDFの生成・提供、サポート対応</li>
              <li>本人確認、不正利用防止、トラブル時の調査</li>
              <li>品質改善、新機能の企画、統計的分析</li>
              <li>法令順守のための必要な範囲での利用</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">3. 第三者提供</h2>
            <p>
              次の場合を除き、本人の同意なく第三者へ提供しません：法令に基づく場合／人の生命・身体・財産の保護に必要な場合／
              業務委託（クラウド・決済・メール配信等）で機密保持契約を締結のうえ必要範囲で提供する場合。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">4. 委託先（例）</h2>
            <p>クラウドインフラ、決済代行（GMO-PG・SBPS 等のいずれか）、メール配信（SendGrid 等）、データベース/ストレージなど。</p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">5. クッキー等</h2>
            <p>
              当社は利便性向上やアクセス解析のためにクッキー等を使用することがあります。ブラウザ設定により無効化可能ですが、機能の一部が制限される場合があります。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">6. 安全管理措置</h2>
            <p>
              最小限の権限設計、暗号化、アクセス制御、ログ監査等により、個人情報の漏えい・滅失・毀損の防止に努めます。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">7. 開示・訂正・利用停止</h2>
            <p>
              ご本人からの請求に基づく保有個人データの開示・訂正・利用停止等の手続きに対応します。下記窓口へご連絡ください。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">8. 未成年者の利用</h2>
            <p>
              20歳未満の方は、保護者の同意を得た上で本サービスをご利用ください。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">9. 免責</h2>
            <p>
              本サービスは娯楽（エンタメ）用途の一般的なリーディングであり、医療・法律・投資等の専門的助言を提供するものではありません。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">10. 改定</h2>
            <p>
              本ポリシーは適宜改定することがあります。重要な変更はサイト上で告知します。
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-rose-900">11. お問い合わせ窓口</h2>
            <address className="not-italic">
              事業者名：フォーチュンアトリエ株式会社（例）<br />
              メール：privacy@example.com
            </address>
          </div>
        </section>

        <div className="mt-8 text-right">
          <a href="/" className="text-sm text-rose-600 underline underline-offset-2 hover:text-rose-800">
            ← トップへ戻る
          </a>
        </div>
      </div>
    </main>
  );
}
