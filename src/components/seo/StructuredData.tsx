import React from "react";
import { Helmet } from "react-helmet-async";
import { SITE_ENTITY } from "../../config/siteConfig";

export interface LocalBusinessSchemaProps {
  type: "home";
}

export interface WebPageSchemaProps {
  type: "page";
  title: string;
  description: string;
  path: string;
  breadcrumb?: { name: string; path: string }[];
}

export interface ArticleSchemaProps {
  type: "article";
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  breadcrumb?: { name: string; path: string }[];
}

export interface ProjectSchemaProps {
  type: "project";
  title: string;
  description: string;
  slug: string;
  category: string;
  location: string;
  images?: string[];
  breadcrumb?: { name: string; path: string }[];
}

export type StructuredDataProps =
  | LocalBusinessSchemaProps
  | WebPageSchemaProps
  | ArticleSchemaProps
  | ProjectSchemaProps;

export const StructuredData: React.FC<StructuredDataProps> = (props) => {
  let schemaData: Record<string, any> = {};

  const orgId = `${SITE_ENTITY.url}/#organization`;
  const websiteId = `${SITE_ENTITY.url}/#website`;

  if (props.type === "home") {
    schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "HomeAndConstructionBusiness",
          "@id": orgId,
          "name": SITE_ENTITY.brand.nameKo,
          "alternateName": [
            SITE_ENTITY.brand.nameEn,
            SITE_ENTITY.brand.nameKo.replace(/\s+/g, ""),
          ],
          "legalName": SITE_ENTITY.legal.businessName,
          "url": `${SITE_ENTITY.url}/`,
          "logo": `${SITE_ENTITY.url}${SITE_ENTITY.logo}`,
          "image": `${SITE_ENTITY.url}${SITE_ENTITY.logo}`,
          "telephone": SITE_ENTITY.contact.phone,
          "description": `${SITE_ENTITY.brand.displayName}(법적상호: ${SITE_ENTITY.legal.businessName})는 부산의 주거·소형 상업공간 인테리어·리모델링을 다루는 ${SITE_ENTITY.license.officialTitle}입니다.`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": SITE_ENTITY.address.street,
            "addressLocality": SITE_ENTITY.address.locality,
            "addressRegion": SITE_ENTITY.address.region,
            "addressCountry": SITE_ENTITY.address.country,
          },
          "areaServed": SITE_ENTITY.serviceArea.map((area) => ({
            "@type": "AdministrativeArea",
            "name": area.includes("부산") ? area : `부산광역시 ${area}`,
          })),
          ...(SITE_ENTITY.socialLinks.naverPlace
            ? { sameAs: [SITE_ENTITY.socialLinks.naverPlace] }
            : {}),
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          "url": `${SITE_ENTITY.url}/`,
          "name": SITE_ENTITY.brand.displayName,
          "publisher": {
            "@id": orgId,
          },
        },
      ],
    };
  } else if (props.type === "article") {
    const canonical = `${SITE_ENTITY.url}/information/${props.slug}`;
    const breadcrumbList = props.breadcrumb || [
      { name: "홈", path: "/" },
      { name: "지식센터", path: "/information" },
      { name: props.title, path: `/information/${props.slug}` },
    ];

    schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${canonical}#article`,
          "headline": props.title,
          "description": props.description,
          "url": canonical,
          "publisher": {
            "@id": orgId,
          },
          "author": {
            "@type": "Organization",
            "name": SITE_ENTITY.brand.nameKo,
            "url": SITE_ENTITY.url,
          },
          ...(props.datePublished
            ? { "datePublished": props.datePublished }
            : {}),
          ...(props.dateModified
            ? { "dateModified": props.dateModified }
            : {}),
          ...(props.image ? { "image": props.image } : {}),
          "mainEntityOfPage": canonical,
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          "itemListElement": breadcrumbList.map((item, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": item.name,
            "item": `${SITE_ENTITY.url}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
          })),
        },
      ],
    };
  } else if (props.type === "project") {
    const canonical = `${SITE_ENTITY.url}/projects/${props.slug}`;
    const breadcrumbList = props.breadcrumb || [
      { name: "홈", path: "/" },
      { name: "시공사례", path: "/projects" },
      { name: props.title, path: `/projects/${props.slug}` },
    ];

    schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": `${canonical}#project`,
          "name": props.title,
          "description": props.description,
          "url": canonical,
          "creator": {
            "@id": orgId,
          },
          "genre": props.category,
          "contentLocation": {
            "@type": "Place",
            "name": props.location,
          },
          ...(props.images && props.images.length > 0
            ? { "image": props.images }
            : {}),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          "itemListElement": breadcrumbList.map((item, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": item.name,
            "item": `${SITE_ENTITY.url}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
          })),
        },
      ],
    };
  } else if (props.type === "page") {
    const canonical = `${SITE_ENTITY.url}${props.path.startsWith("/") ? props.path : `/${props.path}`}`;
    schemaData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      "url": canonical,
      "name": props.title,
      "description": props.description,
      "publisher": {
        "@id": orgId,
      },
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData, null, 2)}
      </script>
    </Helmet>
  );
};
