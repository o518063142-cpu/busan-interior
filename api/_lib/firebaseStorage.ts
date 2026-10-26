import type { App } from "firebase-admin/app";
import { getFirebaseAdminApp } from "./firebaseAdmin.js";

const DEFAULT_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET || "busan-interior.firebasestorage.app";

async function getAccessToken(app: App) {
  const credential = app.options.credential;
  if (!credential) throw new Error("Firebase Admin credential is unavailable.");
  const token = await credential.getAccessToken();
  if (!token?.access_token) throw new Error("Firebase Admin access token is unavailable.");
  return token.access_token;
}

export async function uploadPrivateStorageObject(
  objectPath: string,
  body: Buffer,
  contentType: string
) {
  const app = await getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");

  const accessToken = await getAccessToken(app);
  const endpoint =
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(DEFAULT_BUCKET)}` +
    `/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Storage upload failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return response.json().catch(() => ({}));
}

export async function downloadPrivateStorageObject(objectPath: string) {
  const app = await getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured.");

  const accessToken = await getAccessToken(app);
  const endpoint =
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(DEFAULT_BUCKET)}` +
    `/o/${encodeURIComponent(objectPath)}?alt=media`;

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Storage download failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
