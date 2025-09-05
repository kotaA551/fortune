// server/generatePdf.ts
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { Order } from '@/lib/db';
import { generateFortuneSectionsAI } from '@/lib/ai';

const OUT_DIR = path.join(process.cwd(), 'public', 'reports');
const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');

// カラー（Tailwind系）
const COLORS = {
  bgStart: '#fff1f2',   // rose-50
  bgEnd:   '#f5f3ff',   // violet-50
  card:    '#ffffff',
  title:   '#8B5CF6',   // violet-500
  heading: '#EC4899',   // pink-500
  line:    '#F9A8D4',   // pink-300
  body:    '#374151',   // gray-700
  meta:    '#6B7280',   // gray-500
  disclaimer: '#6B7280'
};

// 背景とカード
function paintBackground(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  const grad = (doc as any).linearGradient(0, 0, width, height);
  grad.stop(0, COLORS.bgStart);
  grad.stop(1, COLORS.bgEnd);
  doc.save();
  doc.rect(0, 0, width, height);
  doc.fill(grad);
  doc.fillOpacity(0.92);
  doc.roundedRect(36, 36, width - 72, height - 72, 16).fill(COLORS.card);
  doc.fillOpacity(1);
  doc.restore();
}

// 見出し＆区切り線
function sectionHeading(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(0.75);
  doc.fillColor(COLORS.heading).fontSize(15).text(text);
  doc.moveDown(0.25);
  doc.strokeColor(COLORS.line).lineWidth(1);
  const x1 = doc.page.margins.left;
  const x2 = doc.page.width - doc.page.margins.right;
  doc.moveTo(x1, doc.y).lineTo(x2, doc.y).stroke();
  doc.moveDown(0.4);
}

// --- Fallback テンプレ ---
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
    { title: '健康運', body: p('休息と回復') },
    { title: '今月のアクション', body: '・朝の10分散歩\n・情報の断捨離\n・週1回のセルフリセット' },
  ];
}

function mapGender(g?: string) {
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

// --- 本文描画（AI＋フォールバック）---
async function writeReportContentAI(doc: PDFKit.PDFDocument, order: Order) {
  if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH);

  paintBackground(doc);

  // タイトル
  doc.fillColor(COLORS.title).fontSize(22)
     .text('Fortune Report / 占いレポート', { align: 'center' });
  doc.moveDown(0.8);

  // メタ
  doc.fillColor(COLORS.meta).fontSize(11);
  doc.text(`依頼者: ${order.name}`);
  doc.text(`生年月日: ${order.birthdate}`);
  doc.text(`性別: ${mapGender(order.gender)}`);
  doc.text(`生成日時: ${dayjs().format('YYYY-MM-DD HH:mm')}`);
  doc.moveDown(0.6);

  // 区切り線
  doc.strokeColor(COLORS.line).lineWidth(1);
  const x1 = doc.page.margins.left;
  const x2 = doc.page.width - doc.page.margins.right;
  doc.moveTo(x1, doc.y).lineTo(x2, doc.y).stroke();
  doc.moveDown(0.6);

  // AI生成（失敗時はテンプレ）
  let sections: { title: string; body: string }[];
  try {
    sections = await generateFortuneSectionsAI({
      name: order.name,
      gender: order.gender,
      birthdate: order.birthdate
    });
  } catch {
    sections = buildSections(order);
  }

  // 本文
  doc.fillColor(COLORS.body).fontSize(12).lineGap(4);
  sections.forEach((s, idx) => {
    sectionHeading(doc, s.title);
    doc.text(s.body, { paragraphGap: 10 });
    if (idx !== sections.length - 1) doc.moveDown(0.2);
  });

  // 免責
  doc.moveDown(0.8);
  doc.fillColor(COLORS.disclaimer).fontSize(10)
    .text('※本レポートはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言を提供するものではありません。');
}

// --- PDFバッファ生成（一本化）---
export async function generatePdfBuffer(order: Order): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks: Buffer[] = [];

  // data/end/error は end 前にリッスン
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  await writeReportContentAI(doc, order);
  doc.end();
  return done;
}

// --- ローカル保存（任意）---
export async function generateAndStorePdfLocal(order: Order): Promise<string> {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const filename = `${order.orderId}.pdf`;
  const filepath = path.join(OUT_DIR, filename);

  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const writeStream = fs.createWriteStream(filepath);
  doc.pipe(writeStream);

  await writeReportContentAI(doc, order);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return `/reports/${filename}`;
}
