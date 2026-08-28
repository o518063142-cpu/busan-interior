import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import { InformationDetailContent } from "../components/content/InformationDetailContent";
import {
  InformationArticleData,
  PILLAR_ARTICLES,
} from "../data/informationData";
import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface InformationDetailPageProps {
  initialData?: InformationArticleData | null;
  openContactModal?: () => void;
}

export const InformationDetailPage: React.FC<InformationDetailPageProps> = ({
  initialData,
  openContactModal,
}) => {
  const { slug } = useParams<{ slug: string }>();

  // Determine initial state: prop > global window initial data > pillar > null
  const [article, setArticle] = useState<InformationArticleData | null>(() => {
    if (initialData) return initialData;
    if (typeof window !== "undefined" && (window as any).__GENE_INITIAL_DATA__) {
      const gData = (window as any).__GENE_INITIAL_DATA__;
      if (gData.type === "article" && gData.data) {
        return gData.data as InformationArticleData;
      }
    }
    if (slug && PILLAR_ARTICLES[slug]) {
      return PILLAR_ARTICLES[slug];
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!article);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (article && article.slug === slug) {
      setLoading(false);
      return;
    }

    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (PILLAR_ARTICLES[slug]) {
      setArticle(PILLAR_ARTICLES[slug]);
      setLoading(false);
      setNotFound(false);
      return;
    }

    let isMounted = true;
    async function fetchArticle() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "articles"),
          where("slug", "==", slug),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!isMounted) return;

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();

          // Reject draft or private articles for public visitor view
          if (data.status === "draft" || data.status === "private") {
            setNotFound(true);
            return;
          }

          setArticle({
            id: docSnap.id,
            slug: data.slug || slug,
            title: data.title || "인테리어 지식 안내",
            shortAnswer: data.shortAnswer || data.summary || "",
            content: data.content || "",
            category: data.category || "인테리어 가이드",
            consumerChecklist: Array.isArray(data.consumerChecklist) ? data.consumerChecklist : [],
            faq: Array.isArray(data.faq) ? data.faq : [],
            featuredImage: data.featuredImage || data.coverImage || "",
            publishedAt: data.publishedAt || "",
            updatedAt: data.updatedAt || "",
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn("Notice: Firestore article lookup notice:", err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">콘텐츠를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <MetaManager
          title="콘텐츠를 찾을 수 없습니다"
          description="요청하신 인테리어 지식 콘텐츠가 존재하지 않거나 비공개 상태입니다."
          noindex={true}
        />
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2 font-sans">
          <h1 className="text-2xl font-bold font-sans text-stone-900 break-keep">
            요청하신 콘텐츠를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-stone-600 font-sans break-keep">
            해당 글이 삭제되었거나 주소가 변경되었을 수 있습니다.
          </p>
        </div>
        <div>
          <Link
            to="/information"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>지식센터 목록으로 이동</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaManager
        title={article.title}
        description={article.shortAnswer || article.content.slice(0, 160)}
        canonicalPath={`/information/${article.slug}`}
        ogType="article"
        ogImage={article.featuredImage}
      />
      <StructuredData
        type="article"
        title={article.title}
        description={article.shortAnswer || article.content.slice(0, 160)}
        slug={article.slug}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt || article.publishedAt}
        image={article.featuredImage}
      />
      <InformationDetailContent
        article={article}
        onOpenContactModal={openContactModal}
      />
    </>
  );
};
