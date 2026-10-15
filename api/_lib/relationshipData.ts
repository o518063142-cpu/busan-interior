import { INFORMATION_ARTICLES } from "../_data/informationData.js";
import { getFirestoreAdmin } from "./firebaseAdmin.js";
import { isPublishedArticle, mergeRelationContent, type RelationContent } from "./contentRelations.js";

export async function loadRelationshipArticles(): Promise<RelationContent[]> {
  let articles: RelationContent[] = [];
  try {
    const db = await getFirestoreAdmin();
    if (db) {
      const snap = await db.collection("articles").where("status", "in", ["published", "public"]).get();
      articles = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter(isPublishedArticle);
    }
  } catch (error) {
    console.warn("Related article lookup notice:", error);
  }
  // Static article URLs are resolved first by the existing detail renderer.
  return mergeRelationContent<RelationContent>(INFORMATION_ARTICLES, articles, "article");
}
