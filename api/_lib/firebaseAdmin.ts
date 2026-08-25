let adminDb: any = null;

export async function getFirestoreAdmin(): Promise<any> {
  if (adminDb) return adminDb;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Missing required credentials in environment
    return null;
  }

  try {
    privateKey = privateKey.replace(/\\n/g, "\n");
    const admin: any = await import("firebase-admin");
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    adminDb = admin.firestore();
    return adminDb;
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
    return null;
  }
}

/**
 * 프로젝트 공개 판정 함수:
 * - status === "private" | "draft" | "deleted" -> 제외
 * - isPublished === false -> 제외
 * - 명시적 비공개 설정이 없는 기존 레거시 프로젝트는 공개 처리
 */
export function isProjectPublic(project: any): boolean {
  if (!project) return false;
  if (
    project.status === "private" ||
    project.status === "draft" ||
    project.status === "deleted"
  ) {
    return false;
  }
  if (project.isPublished === false) {
    return false;
  }
  return true;
}
