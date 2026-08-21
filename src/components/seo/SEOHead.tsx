/**
 * ByGoodAI - React Dynamic Head & SEO Component
 * Dynamic metadata is applied client-side.
 * Automatically injects titles, meta tags, canonicals, social sharing attributes,
 * and JSON-LD structured data into the browser document head.
 */

import React, { useEffect } from 'react';
import { SEOMetadata, updateDOMHead } from '../../lib/seo';

export interface SEOHeadProps extends SEOMetadata {
  children?: React.ReactNode;
}

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  useEffect(() => {
    const cleanup = updateDOMHead(props);
    return cleanup;
  }, [
    props.title,
    props.description,
    props.canonicalPath,
    props.robots,
    props.isPrivate,
    props.ogTitle,
    props.ogDescription,
    props.ogImage,
    props.ogUrl,
    props.ogType,
    props.twitterTitle,
    props.twitterDescription,
    props.twitterImage,
    props.twitterCard,
    JSON.stringify(props.jsonLd || null),
    JSON.stringify(props.breadcrumbs || null),
  ]);

  return null;
};
