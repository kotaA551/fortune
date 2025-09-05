// lib/ai.ts
import OpenAI from "openai";

export type Section = { title: string; body: string };

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateFortuneSectionsAI(order: {
  name?: string;
  gender?: string;
  birthdate?: string;
}): Promise<Section[]> {
  const heads = ["あなたへ","総合運","恋愛運","仕事運","金運","健康運","今月のアクション"];

  const system = [
    "あなたは落ち着いた日本語で、断定を避ける占い系ライター。",
    "各セクションの本文は 350〜550 文字を目安に（重複NG、具体的な行動ヒントを入れる）。",
    "医療・法律・投資の断定は避け、安心感のあるトーン。",
    "句読点や助詞のリズムは自然に、比喩は控えめ。",
    "最後の「今月のアクション」は箇条書き 5〜6 項目、各1〜2行。",
    "出力は**有効なJSON配列のみ**。前後の文章・説明・コードフェンスは禁止。",
  ].join(" ");

  const user = `
依頼者:
- 名前: ${order.name ?? "未設定"}
- 性別: ${order.gender ?? "未設定"}
- 生年月日: ${order.birthdate ?? "未設定"}

出力要件:
- 見出しの順序は固定: ${heads.join(", ")}
- JSON配列のみで返す（前後に文章を付けない）
- 形: [{"title":"あなたへ","body":"..."}, ... 最後は「今月のアクション"}]
- 文字種は日本語のみ。絵文字・過度な装飾は不可。
`;

  const resp = await client.responses.create({
    model: "gpt-5-nano",
    input: [
      { role: "system", content: system },
      { role: "user",   content: user  },
    ],
    temperature: 0.6,
    max_output_tokens: 4000,
  });

  const raw = resp.output_text ?? "";

  const parsed = safeParseSections(raw, heads);
  if (parsed) return parsed;

  // JSONが前後に混ざった場合の救済
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) {
    const parsed2 = safeParseSections(m[0], heads);
    if (parsed2) return parsed2;
  }

  console.warn("[fortune] AI JSON parse failed. Using template sections.");
  return buildTemplate(order, heads);
}

/* ---------- helpers ---------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isSection(v: unknown): v is Section {
  return isRecord(v)
    && typeof v.title === "string"
    && typeof v.body === "string";
}

function safeParseSections(text: string, heads: string[]): Section[] | null {
  try {
    const obj: unknown = JSON.parse(text);

    let arrUnknown: unknown;
    if (Array.isArray(obj)) {
      arrUnknown = obj;
    } else if (isRecord(obj) && Array.isArray(obj.sections)) {
      arrUnknown = obj.sections;
    } else {
      return null;
    }

    const arr = arrUnknown as unknown[];
    const map = new Map<string, Section>();
    for (const item of arr) {
      if (isSection(item)) {
        map.set(item.title.trim(), {
          title: item.title.trim(),
          body: cleanup(item.body),
        });
      }
    }

    const ordered: Section[] = heads.map(h => map.get(h) ?? { title: h, body: "" });

    const nonEmpty = ordered.filter(s => s.body.length > 40).length;
    if (nonEmpty < Math.ceil(heads.length / 2)) return null;

    // 箇条書き整形
    const last = ordered[ordered.length - 1];
    if (last.title === "今月のアクション") {
      last.body = normalizeBullets(last.body);
    }

    return ordered;
  } catch {
    return null;
  }
}

function cleanup(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeBullets(s: string): string {
  const lines = s
    .split(/\n+/)
    .map(l => l.replace(/^[-•・*]\s?/, "").trim())
    .filter(l => l.length > 0)
    .slice(0, 6);

  return lines.length ? lines.map(l => `・${l}`).join("\n") : s;
}

function buildTemplate(order: { gender?: string }, heads: string[]): Section[] {
  const p = (t: string) =>
    `${t}\n\n` +
    "新しい視点が芽生えるタイミング。過去に縛られず、軽やかに一歩踏み出すと流れが整います。" +
    " 小さな改善を積み重ねると、7〜10日後に変化として表れてくるでしょう。";

  const firstBody =
    order.gender === "female" ? "心の安定と直感がテーマです。" :
    order.gender === "male"   ? "挑戦と行動力がテーマです。" :
                                 "自分らしくあることがテーマです。";

  const data: Record<string, string> = {
    "あなたへ": p(firstBody),
    "総合運": p("全体の流れ"),
    "恋愛運": p("人間関係と愛情"),
    "仕事運": p("集中と成果"),
    "金運": p("価値と交換"),
    "健康運": p("休息と回復"),
    "今月のアクション": [
      "朝の10分散歩",
      "情報の断捨離",
      "水分摂取の見直し",
      "睡眠の固定化",
      "小さな投資は計画してから",
      "週1回のセルフリセット",
    ].map(x => `・${x}`).join("\n"),
  };

  return heads.map(h => ({ title: h, body: data[h] ?? "" }));
}
