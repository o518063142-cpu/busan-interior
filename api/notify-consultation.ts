import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

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
      docPath = "",
      createdAt = new Date().toLocaleString("ko-KR"),
    } = req.body || {};

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    if (!emailUser || !emailPassword) {
      console.error("EMAIL NOTIFICATION FAILED");
      console.error("Reason: EMAIL_USER or EMAIL_PASSWORD environment variable not set.");
      return res.status(200).json({
        success: false,
        message: "Email environment variables not configured on server.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const mailText = `한신인테리어 새로운 상담신청

성함: ${name}
연락처: ${phone}
지역: ${location}
공간 유형: ${spaceType}
면적: ${area}평
희망 일정: ${startDate}
상세 내용: ${details || "없음"}

Firestore 문서:
${docPath}

접수 시간:
${createdAt}

관리자 페이지에서 상담 내용을 확인해주세요.`;

    await transporter.sendMail({
      from: `"한신인테리어 알림" <${emailUser}>`,
      to: adminEmail,
      subject: "[한신인테리어] 새로운 상담신청이 접수되었습니다.",
      text: mailText,
    });

    console.log("EMAIL NOTIFICATION SUCCESS");
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("EMAIL NOTIFICATION FAILED");
    console.error("Details:", error?.message || error);
    return res.status(200).json({
      success: false,
      error: error?.message || "Send mail failed",
    });
  }
}
