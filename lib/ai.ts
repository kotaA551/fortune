// lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type Section = { title: string; body: string };

// AIで占い文を生成
export async function generateFortuneSectionsAI(order: {
  name?: string;
  gender?: string;
  birthdate?: string; // "YYYY-MM-DD"
}) : Promise<Section[]> {
  // 生成したい見出しを固定（日本語でプロンプト制御しやすい）
  const heads = ["あなたへ","総合運","恋愛運","仕事運","金運","健康運","今月のアクション"];

  const system = [
    "あなたは優しく断定しすぎない口調の日本語ライター。",
    "各セクションは 180〜220 文字程度。誇大表現や確定表現は避ける。",
    "非専門の助言である旨を匂わせ、行動のヒントを入れる。",
  ].join(" ");

  const user = `
依頼者:
- 名前: ${order.name ?? "未設定"}
- 性別: ${order.gender ?? "未設定"}
- 生年月日: ${order.birthdate ?? "未設定"}

出力要件:
- セクション見出しはこの順に固定: ${heads.join(",")}
- JSONで返す。形式: [{"title":"あなたへ","body":"..."}, ...]
- 絵文字や改行装飾は不要。です/ます調。
`;

  const resp = await client.responses.create({
    model: "gpt-4.1-mini", // コスト/品質バランス。必要に応じて変更
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    // ぶれを抑える
    temperature: 0.6,
    max_output_tokens: 900,
  });

  const text = resp.output_text ?? ""; // SDKがまとめたテキスト
  // JSONパース（壊れた時用にtry/catch）
  try {
    const parsed = JSON.parse(text) as Section[];
    // タイトル順のバリデーション（足りなければ弾く）
    if (Array.isArray(parsed) && parsed.length >= 5) return parsed;
  } catch { /* fallthrough */ }

  throw new Error("AI output parse failed");
}
