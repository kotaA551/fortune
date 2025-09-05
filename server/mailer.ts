// server/mailer.ts
import nodemailer from 'nodemailer';
import type { Order } from '@/lib/db';

const brand = process.env.BRAND_NAME || 'Fortune Atelier';

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: (process.env.SMTP_USER && process.env.SMTP_PASS)
      ? { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }
      : undefined,
  });
}

export async function sendReceiptEmail(order: Order, pdfUrl: string) {
  const t = transporter();
  const from = process.env.FROM_EMAIL || 'no-reply@example.com';

  const subject = `【${brand}】占いPDFのご用意ができました（注文ID: ${order.orderId}）`;

  const html = renderEmailHtml({ order, pdfUrl, brand });
  const text = renderEmailText({ order, pdfUrl, brand });

  await t.sendMail({
    from,
    to: order.email,
    subject,
    html,
    text,
  });
}

function renderEmailHtml({ order, pdfUrl, brand }:{
  order: Order; pdfUrl: string; brand: string;
}) {
  const terms = `${process.env.APP_BASE_URL}/terms`;
  const privacy = `${process.env.APP_BASE_URL}/privacy`;
  return `
  <meta name="color-scheme" content="light only">
  <div style="font-family: ui-sans-serif, -apple-system, 'Segoe UI', Roboto, 'Noto Sans JP', Helvetica, Arial; background:#fff7fb; padding:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 10px 30px rgba(236,72,153,0.12);">
      <tr>
        <td style="padding:20px 24px; border-bottom:1px solid #fde2eb;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:28px; height:28px; border-radius:12px; background:linear-gradient(135deg,#fb7185,#d946ef); box-shadow:0 6px 16px rgba(236,72,153,.25);"></div>
            <strong style="color:#9f1239; font-size:16px;">${brand}</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0; font-size:18px; color:#111827;">ありがとうございます！PDFのご用意ができました。</h1>
          <p style="margin:12px 0 0; color:#6b7280; font-size:14px;">
            以下のボタンからダウンロードできます。保存してお楽しみください。
          </p>

          <table role="presentation" width="100%" style="margin-top:20px;">
            <tr>
              <td style="padding:14px 16px; border:1px solid #fde2eb; border-radius:12px;">
                <div style="display:flex; justify-content:space-between; font-size:14px; color:#374151;">
                  <span>注文ID</span><span style="font-family: ui-monospace, SFMono-Regular, Menlo;">${order.orderId}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; color:#374151; margin-top:8px;">
                  <span>お名前</span><span>${order.name}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; color:#374151; margin-top:8px;">
                  <span>生年月日</span><span>${order.birthdate}</span>
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align:center; margin-top:22px;">
            <a href="${pdfUrl}" 
               style="display:inline-block; padding:12px 18px; border-radius:12px; background:linear-gradient(90deg,#d946ef,#fb7185); color:#fff; text-decoration:none; font-weight:700;">
              PDFをダウンロード
            </a>
          </div>

          <p style="margin:16px 0 0; font-size:12px; color:#6b7280; word-break:break-all;">
            うまく開けない場合は次のURLをコピー＆ペーストしてください：<br>
            <a href="${pdfUrl}" style="color:#db2777">${pdfUrl}</a>
          </p>

          <p style="margin:16px 0 0; font-size:11px; color:#6b7280;">
            ※本サービスはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言は提供しません。
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px; border-top:1px solid #fde2eb; text-align:center;">
          <a href="${terms}" style="color:#db2777; font-size:11px; text-decoration:underline; margin-right:12px;">特定商取引法に基づく表記</a>
          <a href="${privacy}" style="color:#db2777; font-size:11px; text-decoration:underline;">プライバシーポリシー</a>
          <div style="margin-top:8px; color:#9ca3af; font-size:11px;">© ${new Date().getFullYear()} ${brand}</div>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function renderEmailText({ order, pdfUrl, brand }:{
  order: Order; pdfUrl: string; brand: string;
}) {
  return `
${brand}をご利用いただきありがとうございます。
占いPDFのご用意ができました。以下のリンクからダウンロードできます。

注文ID: ${order.orderId}
お名前: ${order.name}
生年月日: ${order.birthdate}

ダウンロード: ${pdfUrl}

※本サービスはエンタメ用途の一般的なリーディングであり、医療・法律・投資等の専門助言は提供しません。
`;
}
