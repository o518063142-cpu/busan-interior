import { auth } from "../firebase";

type Kind = "after" | "before" | "process";

async function projectMediaAction(body: Record<string, string>) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("관리자 계정으로 다시 로그인해주세요.");
  const response = await fetch("/api/project-media", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error || "사진 저장소 요청에 실패했습니다.");
  return payload;
}

export async function uploadProjectImage(projectId: string, kind: Kind, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 업로드할 수 있습니다.");
  if (file.size > 10 * 1024 * 1024) throw new Error("사진 한 장은 10MB 이하로 등록해주세요.");
  const signed = await projectMediaAction({ action: "sign-upload", projectId, kind });
  const form = new FormData();
  form.append("file", file);
  form.append("folder", signed.folder);
  form.append("timestamp", signed.timestamp);
  form.append("api_key", signed.apiKey);
  form.append("signature", signed.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const uploaded = await response.json();
  if (!response.ok || typeof uploaded.secure_url !== "string") {
    throw new Error(uploaded?.error?.message || "사진 업로드에 실패했습니다.");
  }
  return uploaded.secure_url;
}

export async function deleteProjectMedia(projectId: string): Promise<void> {
  await projectMediaAction({ action: "delete-project-media", projectId });
}
