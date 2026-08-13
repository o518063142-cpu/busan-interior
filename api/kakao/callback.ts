import type { VercelRequest, VercelResponse } from "@vercel/node";

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift()?.trim();
    const val = decodeURIComponent(parts.join("=").trim());
    if (key) list[key] = val;
  });

  return list;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  // Clear CSRF cookie immediately
  res.setHeader(
    "Set-Cookie",
    "kakao_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );

  const query = req.query || {};
  const code = typeof query.code === "string" ? query.code : "";
  const queryState = typeof query.state === "string" ? query.state : "";
  const errorParam = typeof query.error === "string" ? query.error : "";
  const errorDesc =
    typeof query.error_description === "string" ? query.error_description : "";

  if (errorParam) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>카카오 인증 오류</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="color: #e11d48; margin-top: 0;">카카오 로그인 인가 실패</h2>
          <p>사용자 동의가 취소되었거나 오류가 발생했습니다.</p>
          <div style="background: #fff1f2; padding: 12px 16px; border-radius: 8px; font-family: monospace; color: #be123c;">
            ${errorParam}: ${errorDesc}
          </div>
          <p style="margin-top: 24px;"><a href="/api/kakao/connect" style="color: #2563eb; text-decoration: underline;">다시 연결 시도하기</a></p>
        </div>
      </body>
      </html>
    `);
  }

  // Verify CSRF state
  const cookies = parseCookies(req.headers.cookie);
  const cookieState = cookies.kakao_oauth_state;

  if (!queryState || !cookieState || queryState !== cookieState) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>보안 검증 실패</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #e11d48; margin-top: 0;">보안 상태값(CSRF Token) 불일치</h2>
          <p>인증 요청 세션이 만료되었거나 올바르지 않은 접근입니다.</p>
          <p><a href="/api/kakao/connect" style="color: #2563eb; text-decoration: underline;">/api/kakao/connect 로 다시 시도하세요.</a></p>
        </div>
      </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>인가 코드 없음</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #e11d48; margin-top: 0;">인가 코드가 누락되었습니다.</h2>
          <p><a href="/api/kakao/connect" style="color: #2563eb; text-decoration: underline;">/api/kakao/connect 로 다시 시도하세요.</a></p>
        </div>
      </body>
      </html>
    `);
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;

  if (!apiKey) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>서버 환경변수 누락</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #e11d48; margin-top: 0;">KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.</h2>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("client_id", apiKey);
    tokenParams.append(
      "redirect_uri",
      "https://gene-interior.vercel.app/api/kakao/callback"
    );
    tokenParams.append("code", code);
    if (clientSecret) {
      tokenParams.append("client_secret", clientSecret);
    }

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: tokenParams.toString(),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      token_type?: string;
      refresh_token?: string;
      expires_in?: number;
      refresh_token_expires_in?: number;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.refresh_token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head><meta charset="utf-8"><title>토큰 발급 실패</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="color: #e11d48; margin-top: 0;">카카오 토큰 교환 실패</h2>
            <p>토큰 발급 중 오류가 발생했습니다. (REST API Key 또는 Client Secret 설정을 확인하세요)</p>
            <div style="background: #fff1f2; padding: 12px 16px; border-radius: 8px; font-family: monospace; color: #be123c;">
              ${tokenData.error || "UNKNOWN_ERROR"}: ${tokenData.error_description || "토큰을 받아오지 못했습니다."}
            </div>
            <p style="margin-top: 24px;"><a href="/api/kakao/connect" style="color: #2563eb; text-decoration: underline;">다시 시도하기</a></p>
          </div>
        </body>
        </html>
      `);
    }

    const refreshToken = tokenData.refresh_token;
    const refreshExpiresDays = tokenData.refresh_token_expires_in
      ? Math.floor(tokenData.refresh_token_expires_in / 86400)
      : 60;

    // Return clean, secure HTML showing the Refresh Token one-time to the administrator
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GENE INTERIOR - 카카오 Refresh Token 발급 완료</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 16px; line-height: 1.6; }
          .container { max-width: 680px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07); }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: 600; font-size: 13px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a; }
          p { margin: 0 0 16px 0; font-size: 15px; color: #475569; }
          .token-box { position: relative; background: #0f172a; color: #38bdf8; padding: 18px 20px; border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; word-break: break-all; margin: 20px 0; border: 1px solid #1e293b; }
          .btn-copy { background: #f59e0b; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; margin-top: 10px; transition: background 0.2s; }
          .btn-copy:hover { background: #d97706; }
          .guide-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-top: 24px; font-size: 14px; color: #1e3a8a; }
          .guide-box ol { margin: 8px 0 0 0; padding-left: 20px; }
          .guide-box li { margin-bottom: 6px; }
          .warning { margin-top: 20px; font-size: 13px; color: #dc2626; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">발급 완료</span>
          <h1>GENE INTERIOR 카카오 알림 연동 토큰</h1>
          <p>카카오톡 <strong>'나에게 보내기(talk_message)'</strong> 권한이 성공적으로 승인되었습니다.</p>
          
          <div style="font-weight: 600; font-size: 14px; color: #334155; margin-bottom: 6px;">
            발급된 KAKAO_REFRESH_TOKEN (유효기간: 약 ${refreshExpiresDays}일):
          </div>
          
          <div class="token-box" id="tokenText">${refreshToken}</div>
          <button class="btn-copy" id="copyBtn" onclick="copyToken()">Refresh Token 복사하기</button>
          <span id="copyMsg" style="margin-left: 10px; font-size: 13px; color: #059669; display: none;">복사되었습니다!</span>

          <div class="guide-box">
            <strong>다음 설정 단계 (Vercel 등록):</strong>
            <ol>
              <li>위의 <strong>Refresh Token</strong>을 복사합니다.</li>
              <li><strong>Vercel Dashboard</strong> &gt; 해당 프로젝트 &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>로 이동합니다.</li>
              <li>다음 환경변수를 등록합니다:
                <ul style="margin: 4px 0; padding-left: 18px;">
                  <li><code>KAKAO_REFRESH_TOKEN</code> = 복사한 토큰 값</li>
                  <li><code>KAKAO_REST_API_KEY</code> = 카카오 REST API 키</li>
                  <li><code>KAKAO_CLIENT_SECRET</code> = 카카오 Client Secret (설정한 경우)</li>
                </ul>
              </li>
              <li>Vercel에서 <strong>Redeploy</strong>(재배포)를 실행하면 상담 접수 시 카카오톡 알림이 활성화됩니다.</li>
            </ol>
          </div>

          <p class="warning">
            * 보안을 위해 이 값을 Vercel의 KAKAO_REFRESH_TOKEN 환경변수에 저장한 후 이 연결용 엔드포인트(/api/kakao/connect, /api/kakao/callback)를 제거하세요.
          </p>
        </div>

        <script>
          function copyToken() {
            const token = document.getElementById('tokenText').innerText.trim();
            navigator.clipboard.writeText(token).then(() => {
              const msg = document.getElementById('copyMsg');
              msg.style.display = 'inline';
              setTimeout(() => { msg.style.display = 'none'; }, 3000);
            });
          }
        </script>
      </body>
      </html>
    `);
  } catch (error: any) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="utf-8"><title>서버 오류</title></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h2 style="color: #e53e3e;">카카오 서버 통신 중 오류가 발생했습니다.</h2>
        <p>잠시 후 다시 시도해주세요.</p>
        <p><a href="/api/kakao/connect">다시 시도</a></p>
      </body>
      </html>
    `);
  }
}
