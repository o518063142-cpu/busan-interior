import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import estimateHandler from "./api/ai-estimate";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", company: "지니인테리어" });
});

// Admin Email Notification API endpoint
app.post("/api/notify-consultation", async (req, res) => {
  try {
    const {
      name,
      phone,
      location = "",
      spaceType = "",
      area = "",
      startDate = "",
      details = "",
      docPath = "",
      createdAt = new Date().toLocaleString("ko-KR"),
    } = req.body;

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

    const mailText = `[지니 인테리어] 새로운 상담신청

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
      from: `"지니 인테리어 알림" <${emailUser}>`,
      to: adminEmail,
      subject: "[지니 인테리어] 새로운 상담신청이 접수되었습니다.",
      text: mailText,
    });

    console.log("EMAIL NOTIFICATION SUCCESS");
    return res.json({ success: true });
  } catch (error: any) {
    console.error("EMAIL NOTIFICATION FAILED");
    console.error("Details:", error?.message || error);
    return res.status(200).json({
      success: false,
      error: error?.message || "Send mail failed",
    });
  }
});

// Keep local preview and the deployed function on the same estimate rules.
app.post("/api/ai-estimate", async (req, res) => {
  await estimateHandler(req as any, res as any);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`지니 인테리어 홈페이지 서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer();
