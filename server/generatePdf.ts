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
  bgStart: '#f8fafc',   // slate-50
  bgEnd:   '#f5f3ff',   // violet-50
  card:    '#ffffff',
  title:   '#7c3aed',   // violet-600
  sub:     '#6d28d9',   // violet-700
  heading: '#db2777',   // rose-600
  line:    '#fda4af',   // rose-300
  body:    '#374151',   // gray-700
  meta:    '#6b7280',   // gray-500
  accent:  '#a78bfa',   // violet-300 (左バー)
  chip:    '#fce7f3',   // pink-100
  disclaimer: '#6b7280'
};

// 余白を少し広げる（全ページで統一して使う）
const PAGE_MARGIN = 56;

// 背景
function paintBackground(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  const g = (doc as any).linearGradient(0, 0, width, height);
  g.stop(0, COLORS.bgStart);
  g.stop(1, COLORS.bgEnd);
  doc.save();
  doc.rect(0, 0, width, height).fill(g);
  doc.restore();
}

// タイトルヒーロー
function heroHeader(doc: PDFKit.PDFDocument) {
  const { width } = doc.page;
  const left = PAGE_MARGIN;
  const right = width - PAGE_MARGIN;
  const w = right - left;

  doc.save();
  doc.roundedRect(left, 40, w, 92, 18).fillOpacity(0.95).fill(COLORS.card);
  doc.fillOpacity(1);

  doc.fillColor(COLORS.title).fontSize(24)
    .text('Fortune Report / 占いレポート', left + 18, 58, { width: w - 36, align: 'center' });
  doc.fillColor(COLORS.meta).fontSize(11)
    .text('PERSONAL READING • MONTHLY INSIGHTS', left + 18, 88, { width: w - 36, align: 'center' });
  doc.restore();

  doc.moveDown(6);
}

// セクションカード（左にアクセントバー＋柔らかいカード）
function sectionCard(doc: PDFKit.PDFDocument, title: string, body: string) {
  const { width } = doc.page;
  const x = PAGE_MARGIN;
  const maxW = width - PAGE_MARGIN * 2;
  const yStart = doc.y + 6;

  const yContentStart = yStart + 20;

  // 見出し＋本文を一旦描いて高さを測る
  doc.fillColor(COLORS.heading).fontSize(14).text(title, x + 18, yContentStart, { width: maxW - 36 });
  doc.moveDown(0.5);

  const beforeY = doc.y;
  doc.fillColor(COLORS.body).fontSize(12).lineGap(5)
    .text(body, x + 18, doc.y, { width: maxW - 36, paragraphGap: 8 });
  const afterY = doc.y;

  const cardH = Math.max(60, (afterY - yStart) + 16);

  // 背景と左バー
  doc.save();
  doc.rect(x + 3, yStart + 3, maxW, cardH).fillOpacity(0.06).fill('#000'); // shadow
  doc.fillOpacity(0.98).roundedRect(x, yStart, maxW, cardH, 14).fill(COLORS.card);
  doc.fillOpacity(1).fillColor(COLORS.accent).roundedRect(x, yStart, 6, cardH, 14).fill();
  doc.restore();

  // 内容をもう一度前面に
  const saveY = doc.y;
  doc.y = yContentStart;
  doc.fillColor(COLORS.heading).fontSize(14).text(`◦ ${title}`, x + 18, doc.y, { width: maxW - 36 });
  doc.moveDown(0.5);
  doc.fillColor(COLORS.body).fontSize(12).lineGap(5)
    .text(body, x + 18, doc.y, { width: maxW - 36, paragraphGap: 8 });

  doc.y = yStart + cardH + 10;
  if (doc.y < saveY) doc.y = saveY;
}


// ページフッター（ページ番号）
function footer(doc: PDFKit.PDFDocument, pageNo: number) {
  const { width, height } = doc.page;
  doc.fillColor(COLORS.meta).fontSize(10)
     .text(String(pageNo), 0, height - 32, { width, align: 'center' });
}


// Fallback テンプレ（AI失敗時）
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

// ── 本文レンダリング（AI＋フォールバック・モダンUI） ──
async function writeReportContentModern(doc: PDFKit.PDFDocument, order: Order) {
  if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH);
  paintBackground(doc);
  heroHeader(doc);

  // ...（メタカード等そのまま）...

  // AI 生成（失敗時テンプレ）
  let sections: { title: string; body: string }[];
  try {
    sections = await generateFortuneSectionsAI({
      name: order.name, gender: order.gender, birthdate: order.birthdate
    });
  } catch {
    sections = buildSections(order);
  }

  // ← ここでページ番号を管理
  let pageNo = 1;

  sections.forEach((s) => {
    // 改ページ前にフッターを描く
    if (doc.y > doc.page.height - 220) {
      footer(doc, pageNo);
      doc.addPage({
        size: 'A4',
        margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
      });
      pageNo++;                               // ← ページ番号を進める
      if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH);
      paintBackground(doc);
    }
    sectionCard(doc, s.title, s.body);
  });

  // 免責
  doc.moveDown(0.6);
  doc.fillColor(COLORS.meta).fontSize(10)
    .text('※本レポートはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言を提供するものではありません。');

  // 最終ページのフッター
  footer(doc, pageNo);
}


// --- PDFバッファ生成（一本化）---
export async function generatePdfBuffer(order: Order): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  await writeReportContentModern(doc, order);
  doc.end();
  return done;
}

// --- ローカル保存（任意）---
export async function generateAndStorePdfLocal(order: Order): Promise<string> {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const filename = `${order.orderId}.pdf`;
  const filepath = path.join(OUT_DIR, filename);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
  });
  const writeStream = fs.createWriteStream(filepath);
  doc.pipe(writeStream);

  await writeReportContentModern(doc, order);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return `/reports/${filename}`;
}
