import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { Order } from '@/lib/db';

const OUT_DIR = path.join(process.cwd(), 'public', 'reports');
const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

export async function generateAndStorePdf(order: Order): Promise<string> {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const filename = `${order.orderId}.pdf`;
  const filepath = path.join(OUT_DIR, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  if (fs.existsSync(FONT_PATH)) {
    doc.font(FONT_PATH);
  }

  // 表紙
  doc.fontSize(22).text('Fortune Report / 占いレポート', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`依頼者: ${order.name}`);
  doc.text(`生年月日: ${order.birthdate}`);
  doc.text(`性別: ${mapGender(order.gender)}`);
  doc.text(`生成日時: ${dayjs().format('YYYY-MM-DD HH:mm')}`);
  doc.moveDown();
  doc.moveTo(48, doc.y).lineTo(547, doc.y).stroke();
  doc.moveDown();

  // 本文（性別に応じた1セクション + 共通セクション）
  const sections = buildSections(order);
  for (const s of sections) {
    doc.fontSize(16).text(s.title, { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(s.body, { paragraphGap: 10 });
    doc.moveDown();
  }

  // 免責
  doc.moveDown();
  doc.fontSize(10).text(
    '※本レポートはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言を提供するものではありません。',
    { align: 'left' }
  );

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  return `/reports/${filename}`;
}

function buildSections(order: Order) {
  const p = (t: string) =>
    `${t}\n\n` +
    '本日はあなたにとって、新しい視点が芽生えるタイミング。' +
    ' 過去の選択に縛られず、軽やかに一歩踏み出すことで運気は回り始めます。' +
    ' 小さな改善が積み重なり、7〜10日後に目に見える変化として表れるでしょう。';

  const first =
    order.gender === 'female'
      ? { title: '女性のあなたへ', body: p('心の安定と直感がテーマです。') }
      : order.gender === 'male'
      ? { title: '男性のあなたへ', body: p('挑戦と行動力がテーマです。') }
      : order.gender === 'non-binary'
      ? { title: 'ノンバイナリーのあなたへ', body: p('自由な選択と調和がテーマです。') }
      : order.gender === 'transgender'
      ? { title: 'トランスジェンダーのあなたへ', body: p('変化と自己受容がテーマです。') }
      : order.gender === 'genderqueer'
      ? { title: 'ジェンダークィアのあなたへ', body: p('独自性と可能性がテーマです。') }
      : { title: 'あなたへ', body: p('自分らしくあることがテーマです。') };

  return [
    first,
    { title: '総合運', body: p('全体の流れ') },
    { title: '恋愛運', body: p('人間関係と愛情') },
    { title: '仕事運', body: p('集中と成果') },
    { title: '金運', body: p('価値と交換') },
    { title: 'ヘルス', body: p('休息と回復') },
    { title: '今月のアクション', body: '・朝の10分散歩\n・情報の断捨離\n・週1回のセルフリセット' },
  ];
}

function mapGender(g: string | undefined) {
  switch (g) {
    case 'female': return '女性';
    case 'male': return '男性';
    case 'non-binary': return 'ノンバイナリー';
    case 'transgender': return 'トランスジェンダー';
    case 'genderqueer': return 'ジェンダークィア';
    case 'prefer-not': return '回答しない';
    default: return '未設定';
  }
}
