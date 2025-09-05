// lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type Section = { title: string; body: string };

// AIで占い文を生成
// ……OpenAIクライアントはそのまま……

export async function generateFortuneSectionsAI(order: {
  name?: string;
  gender?: string;
  birthdate?: string;
}) {
  const heads = ["あなたへ","総合運","恋愛運","仕事運","金運","健康運","今月のアクション"];

  const system = [
    "あなたは落ち着いた日本語で、断定を避ける占い系ライター。",
    "1セクションの本文は 350〜550 文字を目安にする。",
    "内容は重複を避け、具体的な行動ヒントを1つ以上入れる。",
    "過度な専門助言（医療・法律・投資の断定）は避け、安心感のあるトーンにする。",
    "句読点や助詞のリズムを自然に、比喩は控えめに。",
    "最後のセクション「今月のアクション」は 箇条書き 5〜6項目、各1〜2行で。"
  ].join(" ");

  const user = `
依頼者:
- 名前: ${order.name ?? "未設定"}
- 性別: ${order.gender ?? "未設定"}
- 生年月日: ${order.birthdate ?? "未設定"}

出力要件:
- 見出しの順序は固定: ${heads.join(", ")}
- JSON配列で返す: [{"title":"あなたへ","body":"..."}, ...]
- 文字種は日本語。絵文字や過度な装飾は使わない。
`;

  const resp = await client.responses.create({
    model: "gpt-5-nano",
    input: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.6,
    max_output_tokens: 2400, // ← 文字数増に合わせて拡大
  });

  const text = resp.output_text ?? "";
  return JSON.parse(text) as { title: string; body: string }[];
}
