import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOComponent = ({ 
  title,
  description,
  canonical,
  ogImage,
  schema,
  keywords,
  noindex = false,
  article = null,
  product = null
}) => {
  const baseUrl = 'https://www.luckycharmsweep.com';
  const defaultImage = 'https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="Lucky Charm Sweep" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      <meta name="twitter:site" content="@LuckyCharmSweep" />
      
      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product specific meta tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="USD" />
          <meta property="product:availability" content={product.availability} />
        </>
      )}
      
      {/* Custom Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOComponent;