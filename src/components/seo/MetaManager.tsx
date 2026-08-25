import React from "react";
import { Helmet } from "react-helmet-async";
import { SITE_ENTITY, SITE_CONFIG } from "../../config/siteConfig";

export interface MetaManagerProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  noindex?: boolean;
}

export const MetaManager: React.FC<MetaManagerProps> = ({
  title,
  description,
  canonicalPath = "/",
  ogType = "website",
  ogImage,
  noindex = false,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_ENTITY.brand.nameKo}`
    : SITE_CONFIG.seo.mainTitle;

  const fullDescription = description || SITE_CONFIG.seo.metaDescription;

  const normalizedPath = canonicalPath.startsWith("/")
    ? canonicalPath
    : `/${canonicalPath}`;
  const canonicalUrl = `${SITE_ENTITY.url}${normalizedPath === "/" ? "" : normalizedPath}`;

  const resolvedOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${SITE_ENTITY.url}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`
    : `${SITE_ENTITY.url}${SITE_ENTITY.logo}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow, noarchive" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:site_name" content={SITE_ENTITY.brand.displayName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Helmet>
  );
};
