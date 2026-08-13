import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for safety
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const {
      name = "",
      phone = "",
      location = "",
      spaceType = "",
      area = "",
      startDate = "",
      details = "",
    } = req.body || {};

    const restApiKey = process.env.KAKAO_REST_API_KEY;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const refreshToken = process.env.KAKAO_REFRESH_TOKEN;

    if (!restApiKey || !refreshToken) {
      console.error("KAKAO NOTIFICATION FAILED");
      console.error("Reason: KAKAO_REST_API_KEY or KAKAO_REFRESH_TOKEN environment variable not set.");
      return res.status(200).json({
        success: false,
        message: "Kakao environment variables not configured on server.",
      });
    }

    // 1. Refresh Access Token using Kakao OAuth API
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "refresh_token");
    tokenParams.append("client_id", restApiKey);
    tokenParams.append("refresh_token", refreshToken);
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
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("KAKAO NOTIFICATION FAILED");
      console.error(
        "Token refresh error:",
        tokenData.error || tokenRes.statusText
      );
      return res.status(200).json({
        success: false,
        message: "Failed to refresh Kakao access token",
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Format Notification Message
    const formattedArea = area ? `${area}평` : "미입력";
    const messageText = `🔔 GENE INTERIOR 새 상담 접수

성함: ${name}
연락처: ${phone}
지역: ${location || "미입력"}
공간 유형: ${spaceType || "미입력"}
면적: ${formattedArea}
희망 일정: ${startDate || "미입력"}
상세 내용: ${details || "없음"}

관리자 페이지에서 확인해주세요.`;

    const templateObject = {
      object_type: "text",
      text: messageText,
      link: {
        web_url: "https://gene-interior.vercel.app",
        mobile_web_url: "https://gene-interior.vercel.app",
      },
      button_title: "관리자 페이지",
    };

    const memoParams = new URLSearchParams();
    memoParams.append("template_object", JSON.stringify(templateObject));

    // 3. Send memo to me (나에게 보내기)
    const memoRes = await fetch(
      "https://kapi.kakao.com/v2/api/talk/memo/default/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: memoParams.toString(),
      }
    );

    const memoData = (await memoRes.json()) as {
      result_code?: number;
      msg?: string;
      code?: number;
    };

    if (memoRes.ok && memoData.result_code === 0) {
      console.log("KAKAO NOTIFICATION SUCCESS");
      return res.status(200).json({ success: true });
    } else {
      console.error("KAKAO NOTIFICATION FAILED");
      console.error("Kakao API error code:", memoData.code || memoData.result_code);
      return res.status(200).json({
        success: false,
        message: memoData.msg || "Failed to send Kakao memo",
      });
    }
  } catch (error: any) {
    console.error("KAKAO NOTIFICATION FAILED");
    console.error("Details:", error?.message || "Unknown error");
    return res.status(200).json({
      success: false,
      error: error?.message || "Send Kakao notification failed",
    });
  }
}
