import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import dayjs from "dayjs";
import { Order } from "@/lib/db";
import { generateFortuneSectionsAI } from "@/lib/ai";

const OUT_DIR = path.join(process.cwd(), "public", "reports");
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSansJP-Regular.ttf");

// ---- Theme -------------------------------------------------------------
const COLORS = {
  bgStart: "#f8fafc", // slate-50
  bgEnd:   "#f5f3ff", // violet-50
  card:    "#ffffff",
  title:   "#7c3aed", // violet-600
  sub:     "#6d28d9", // violet-700
  heading: "#16a34a", // emerald-600
  line:    "#a7f3d0", // emerald-200
  body:    "#374151", // gray-700
  meta:    "#6b7280", // gray-500
  disclaimer: "#6b7280",
};

const PAGE_MARGIN = 64;

// ---- Utils -------------------------------------------------------------
function applyFont(doc: PDFKit.PDFDocument) {
  if (fs.existsSync(FONT_PATH)) doc.font(FONT_PATH);
}

function paintGradientBackground(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  const g = (doc as any).linearGradient(0, 0, width, height);
  g.stop(0, COLORS.bgStart);
  g.stop(1, COLORS.bgEnd);
  doc.save();
  doc.rect(0, 0, width, height).fill(g);
  doc.restore();
}

function footerPageNumber(doc: PDFKit.PDFDocument, current: number, total: number) {
  const { width, height } = doc.page;
  const label = `${current} / ${total}`;
  // 下端中央にだけ描く（はみ出さない固定座標）
  doc.fillColor(COLORS.meta).fontSize(10)
     .text(label, 0, height - 32, { width, align: "center" });
}

// ---- Fallback (AI失敗時) -----------------------------------------------
function buildSections(order: Order) {
  const p = (t: string) =>
    `${t}\n\n` +
    "本日はあなたにとって、新しい視点が芽生えるタイミング。" +
    " 過去の選択に縛られず、軽やかに一歩踏み出すことで運気は回り始めます。" +
    " 小さな改善が積み重なり、7〜10日後に目に見える変化として表れるでしょう。";

  const first =
    order.gender === "female"
      ? { title: "女性のあなたへ", body: p("心の安定と直感がテーマです。") }
      : order.gender === "male"
      ? { title: "男性のあなたへ", body: p("挑戦と行動力がテーマです。") }
      : order.gender === "non-binary"
      ? { title: "ノンバイナリーのあなたへ", body: p("自由な選択と調和がテーマです。") }
      : order.gender === "transgender"
      ? { title: "トランスジェンダーのあなたへ", body: p("変化と自己受容がテーマです。") }
      : order.gender === "genderqueer"
      ? { title: "ジェンダークィアのあなたへ", body: p("独自性と可能性がテーマです。") }
      : { title: "あなたへ", body: p("自分らしくあることがテーマです。") };

  return [
    first,
    { title: "総合運",   body: p("全体の流れ") },
    { title: "恋愛運",   body: p("人間関係と愛情") },
    { title: "仕事運",   body: p("集中と成果") },
    { title: "金運",     body: p("価値と交換") },
    { title: "健康運",   body: p("休息と回復") },
    { title: "今月のアクション", body: "・朝の10分散歩\n・情報の断捨離\n・週1回のセルフリセット" },
  ];
}

function mapGender(g?: string) {
  switch (g) {
    case "female": return "女性";
    case "male": return "男性";
    case "non-binary": return "ノンバイナリー";
    case "transgender": return "トランスジェンダー";
    case "genderqueer": return "ジェンダークィア";
    case "prefer-not": return "回答しない";
    default: return "未設定";
  }
}

// ---- Pages -------------------------------------------------------------
function drawCoverPage(doc: PDFKit.PDFDocument, order: Order) {
  paintGradientBackground(doc);
  applyFont(doc);

  const { width, height } = doc.page;
  const title = `${order.name ?? "あなた"} 型の性格`;
  const subtitle = "占いレポート";

  const cardW = width - PAGE_MARGIN * 2;
  const cardH = 140;
  const cardX = PAGE_MARGIN;
  const cardY = height * 0.22;

  doc.save();
  doc.roundedRect(cardX, cardY, cardW, cardH, 18).fillOpacity(0.95).fill(COLORS.card);
  doc.restore();

  doc.fillColor(COLORS.title).fontSize(42).text(title, 0, cardY + 26, { width, align: "center" });
  doc.fillColor(COLORS.sub).fontSize(18).text(subtitle, 0, cardY + 26 + 56, { width, align: "center" });

  const meta = [
    `依頼者: ${order.name ?? ""}`,
    `生年月日: ${order.birthdate ?? ""}`,
    `性別: ${mapGender(order.gender)}`,
    `生成日時: ${dayjs().format("YYYY-MM-DD HH:mm")}`
  ].join(" / ");

  doc.fillColor(COLORS.meta).fontSize(11).text(meta, 0, cardY + cardH + 24, { width, align: "center" });
}

function drawSectionPage(doc: PDFKit.PDFDocument, title: string, body: string, isLast: boolean) {
  paintGradientBackground(doc);
  applyFont(doc);

  const { width, height } = doc.page;

  // heading
  doc.fillColor(COLORS.heading).fontSize(22)
     .text(title, PAGE_MARGIN, PAGE_MARGIN, { width: width - PAGE_MARGIN * 2, align: "center" });

  // underline
  doc.strokeColor(COLORS.line).lineWidth(1);
  doc.moveTo(PAGE_MARGIN, PAGE_MARGIN + 32).lineTo(width - PAGE_MARGIN, PAGE_MARGIN + 32).stroke();

  // body
  const colX = PAGE_MARGIN + 24;
  const colW = width - (PAGE_MARGIN + 24) * 2;
  const topY = PAGE_MARGIN + 56;

  doc.fillColor(COLORS.body).fontSize(12).lineGap(6)
     .text(body, colX, topY, { width: colW, align: "left", paragraphGap: 10 });

  if (isLast) {
    const disclaimerY = height - PAGE_MARGIN - 36;
    doc.fillColor(COLORS.disclaimer).fontSize(10).text(
      "※本レポートはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言を提供するものではありません。",
      PAGE_MARGIN, disclaimerY, { width: width - PAGE_MARGIN * 2, align: "left" }
    );
  }
}

// ---- Render flow（各ページでフッター直書き） --------------------------
async function composeAllPages(doc: PDFKit.PDFDocument, order: Order) {
  // Cover
  drawCoverPage(doc, order);

  // AI 生成（失敗時はテンプレ）
  let sections: { title: string; body: string }[] = [];
  try {
    sections = await generateFortuneSectionsAI({
      name: order.name,
      gender: order.gender,
      birthdate: order.birthdate,
    });
  } catch (e) {
    console.warn("[fortune] AI generation failed, fallback used:", (e as Error)?.message);
    sections = buildSections(order);
  }

  // 1セクション=1ページ、各ページでフッターを描く
  const totalPagesForSections = sections.length; // フッターに出す総数はセクション数だけ
  sections.forEach((s, idx) => {
    doc.addPage({
      size: "A4",
      margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
    });

    const isLast = idx === sections.length - 1;
    drawSectionPage(doc, s.title, s.body, isLast);

    // ここでそのページだけにフッターを書く（増殖しない）
    footerPageNumber(doc, idx + 1, totalPagesForSections);
  });
}

// ---- Public APIs -------------------------------------------------------
export async function generatePdfBuffer(order: Order): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
    bufferPages: false, // ← フッター増殖対策：ページごとに即時描画
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  await composeAllPages(doc, order);
  doc.end();
  return done;
}

export async function generateAndStorePdfLocal(order: Order): Promise<string> {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const filename = `${order.orderId}.pdf`;
  const filepath = path.join(OUT_DIR, filename);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
    bufferPages: false,
  });
  const writeStream = fs.createWriteStream(filepath);
  doc.pipe(writeStream);

  await composeAllPages(doc, order);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return `/reports/${filename}`;
}
