import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>설정 오류</title></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h2 style="color: #e53e3e;">KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.</h2>
        <p>Vercel 대시보드의 Environment Variables에 <strong>KAKAO_REST_API_KEY</strong>를 등록한 후 다시 시도해주세요.</p>
      </body>
      </html>
    `);
  }

  // Generate random CSRF state
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = "https://gene-interior.vercel.app/api/kakao/callback";

  // Set CSRF state cookie (HttpOnly, Secure, 10 min expiry)
  res.setHeader(
    "Set-Cookie",
    `kakao_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(
    apiKey
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=talk_message&state=${encodeURIComponent(state)}`;

  return res.redirect(302, authUrl);
}
