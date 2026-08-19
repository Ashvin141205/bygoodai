"use client"

import React from "react"
import { Link } from "react-router-dom"
import { Helmet } from 'react-helmet-async'
import { sanitizeHTML } from "../../utils/sanitize"
import SEOComponent from "../Common/SEOComponent"

const Blogmain = ({ categories, blogsDetails }) => {
  const sanitizedDescription = React.useMemo(() => {
    return blogsDetails?.description ? sanitizeHTML(blogsDetails.description) : ""
  }, [blogsDetails?.description])

  // Extract H1 headings for table of contents
  const [tableOfContents, setTableOfContents] = React.useState([])

  React.useEffect(() => {
    if (blogsDetails?.description) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(blogsDetails.description, 'text/html')
      const h1Tags = doc.querySelectorAll('h1')
      
      const toc = Array.from(h1Tags).map((h1, index) => {
        const text = h1.textContent
        const id = `section-${index}`
        h1.setAttribute('id', id)
        return { text, id }
      })
      
      setTableOfContents(toc)
      
      // Add IDs to actual rendered H1s
      setTimeout(() => {
        const renderedH1s = document.querySelectorAll('.d_html h1')
        renderedH1s.forEach((h1, index) => {
          h1.id = `section-${index}`
          h1.style.scrollMarginTop = '80px'
        })
      }, 100)
    }
  }, [blogsDetails?.description])

  // Generate Article schema for blog post
  const generateArticleSchema = () => {
    if (!blogsDetails) return null;
    
    // Extract keywords from tags if available
    const keywords = blogsDetails.tags 
      ? blogsDetails.tags.split(',').map(tag => tag.trim()).join(', ')
      : blogsDetails.keywords || "gaming, online gaming, casino, slots";
    
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blogsDetails.meta_title || blogsDetails.title,
      "description": blogsDetails.meta_description || blogsDetails.title,
      "image": blogsDetails.image || blogsDetails.featured_image ? `https://luckycharmsweep.com${blogsDetails.image || blogsDetails.featured_image}` : "https://luckycharmsweep.com/default-blog-image.jpg",
      "author": {
        "@type": "Person",
        "name": blogsDetails.author || "LuckCharm Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Lucky Charm Sweep",
        "logo": {
          "@type": "ImageObject",
          "url": "https://luckycharmsweep.com/logo.png"
        }
      },
      "datePublished": blogsDetails.created_date || new Date().toISOString(),
      "dateModified": blogsDetails.updated_date || blogsDetails.created_date || new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://luckycharmsweep.com/blog/${blogsDetails.slug || blogsDetails.id}`
      },
      "articleSection": blogsDetails.category_name || categories?.[0]?.name || "Gaming",
      "keywords": keywords,
      "wordCount": blogsDetails.description ? blogsDetails.description.replace(/<[^>]*>/g, '').split(' ').length : 0
    };
  };

  return (
    <>
      {blogsDetails && (
        <>
          <SEOComponent
            title={`${blogsDetails.meta_title || blogsDetails.title} | Lucky Charm Sweep Gaming Blog`}
            description={blogsDetails.meta_description || blogsDetails.title}
            keywords={blogsDetails.tags ? blogsDetails.tags.split(',').map(tag => tag.trim()).join(', ') : blogsDetails.keywords || "gaming, blog, casino, online gaming"}
            ogType="article"
            structuredData={generateArticleSchema()}
          />
          
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify(generateArticleSchema())}
            </script>
            
            {/* Article Meta Tags */}
            <meta property="article:author" content={blogsDetails.author || "Lucky Charm Sweep Team"} />
            <meta property="article:published_time" content={blogsDetails.created_date} />
            <meta property="article:modified_time" content={blogsDetails.updated_date || blogsDetails.created_date} />
            <meta property="article:section" content={blogsDetails.category_name || categories?.[0]?.name || "Gaming"} />
            {blogsDetails.tags && (
              <meta name="keywords" content={blogsDetails.tags.split(',').map(tag => tag.trim()).join(', ')} />
            )}
            
            {/* Open Graph Tags for Social Sharing */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={blogsDetails.meta_title || blogsDetails.title} />
            <meta property="og:description" content={blogsDetails.meta_description || blogsDetails.title} />
            <meta property="og:image" content={blogsDetails.image || 'https://luckycharmsweep.com/default-blog-image.jpg'} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={blogsDetails.image_alt || blogsDetails.title} />
            <meta property="og:url" content={`https://luckycharmsweep.com/blog/${blogsDetails.slug || blogsDetails.id}`} />
            <meta property="og:site_name" content="Lucky Charm Sweep" />
            
            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={blogsDetails.meta_title || blogsDetails.title} />
            <meta name="twitter:description" content={blogsDetails.meta_description || blogsDetails.title} />
            <meta name="twitter:image" content={blogsDetails.image || 'https://luckycharmsweep.com/default-blog-image.jpg'} />
            <meta name="twitter:image:alt" content={blogsDetails.image_alt || blogsDetails.title} />
            
            <link rel="canonical" href={`https://luckycharmsweep.com/blog/${blogsDetails.slug || blogsDetails.id}`} />
          </Helmet>

        <div className="flex justify-between items-start flex-col md:flex-row relative blogdetails mt-10 md:mt-20">
          <div className="w-full md:w-[65%] lg:w-[70%] md:pr-8">
            <div
              className="prose prose-lg prose-invert max-w-none d_html"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
          <div className="w-full md:w-[35%] lg:w-[30%]">
            <div className="sticky top-10 space-y-6">
              {/* Categories Section */}
              <div
                className="space-y-3 p-6"
                style={{
                  background: "#1a1f2c",
                  borderRadius: "1rem",
                }}
              >
                <h1 className="text-xl font-bold mb-4">Categories</h1>
                <ul role="list" className="space-y-1 capitalize list-disc px-8">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link to={`/blog/category/${category.id}`} className="chakra-link css-1ynruec">
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Table of Contents Section */}
              {tableOfContents.length > 0 && (
                <div
                  className="space-y-3 p-6"
                  style={{
                    background: "#1a1f2c",
                    borderRadius: "1rem",
                  }}
                >
                <h2 className="text-xl font-bold uppercase mb-4 text-white">Content Table</h2>
                <ul className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <li key={index}>
                      <a
                        href={`#${item.id}`}
                        className="text-[#CACACA] hover:text-purple-400 transition-colors duration-200 text-sm font-medium block"
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          </div>
        </div>
        </>
      )}
    </>
  )
}

export default Blogmain
