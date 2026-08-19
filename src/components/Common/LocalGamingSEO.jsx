import React from 'react';
import { Helmet } from 'react-helmet-async';

const LocalGamingSEO = ({ 
    targetRegions = ['United States', 'Canada', 'United Kingdom', 'Australia'],
    includeLocalBusiness = false,
    businessInfo = {}
}) => {
    // Generate location-based gaming keywords
    const generateLocalGamingKeywords = () => {
        const baseKeywords = [
            'online gaming',
            'casino games',
            'slot games',
            'gaming platform',
            'digital gaming',
            'secure gaming',
            'gaming credits',
            'instant gaming'
        ];

        const locationKeywords = [];
        
        targetRegions.forEach(region => {
            baseKeywords.forEach(keyword => {
                locationKeywords.push(`${keyword} ${region}`);
                locationKeywords.push(`${keyword} in ${region}`);
                locationKeywords.push(`best ${keyword} ${region}`);
            });
        });

        // Add region-specific gaming terms
        const regionSpecific = [
            ...targetRegions.map(region => `${region} online gaming`),
            ...targetRegions.map(region => `${region} casino games`),
            ...targetRegions.map(region => `legal gaming ${region}`),
            ...targetRegions.map(region => `secure gaming platform ${region}`)
        ];

        return [...baseKeywords, ...locationKeywords, ...regionSpecific].join(', ');
    };

    // Generate LocalBusiness schema if applicable
    const generateLocalBusinessSchema = () => {
        if (!includeLocalBusiness) return null;

        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": businessInfo.name || "LuckCharm Gaming",
            "description": "Premier online gaming platform serving players worldwide with secure transactions and instant gameplay",
            "url": "https://luckcharm.com",
            "telephone": businessInfo.phone || "+1-800-LUCKCHARM",
            "email": businessInfo.email || "support@luckcharm.com",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": businessInfo.country || "US",
                "addressRegion": businessInfo.region || "Global"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": businessInfo.latitude || "40.7128",
                "longitude": businessInfo.longitude || "-74.0060"
            },
            "areaServed": targetRegions.map(region => ({
                "@type": "Country",
                "name": region
            })),
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": "40.7128",
                    "longitude": "-74.0060"
                },
                "geoRadius": "20000000"
            },
            "makesOffer": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Online Gaming Platform",
                        "description": "Secure online gaming with instant deposits and withdrawals"
                    },
                    "priceValidUntil": "2025-12-31",
                    "areaServed": targetRegions,
                    "shippingDetails": {
                        "@type": "OfferShippingDetails",
                        "deliveryTime": {
                            "@type": "ShippingDeliveryTime",
                            "handlingTime": {
                                "@type": "QuantitativeValue",
                                "minValue": 0,
                                "maxValue": 0,
                                "unitCode": "MIN"
                            }
                        }
                    },
                    "hasMerchantReturnPolicy": {
                        "@type": "MerchantReturnPolicy",
                        "applicableCountry": "US",
                        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                    }
                }
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "5000",
                "bestRating": "5",
                "worstRating": "1"
            },
            "review": [
                {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "International Player"
                    },
                    "reviewBody": "Best online gaming platform with global reach and secure payments!",
                    "datePublished": "2025-03-10"
                },
                {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "4.9",
                        "bestRating": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Verified User"
                    },
                    "reviewBody": "Excellent customer service and fast transactions worldwide.",
                    "datePublished": "2025-04-05"
                }
            ],
            "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59",
            "sameAs": [
                "https://facebook.com/luckcharmgaming",
                "https://twitter.com/luckcharmgaming",
                "https://instagram.com/luckcharmgaming"
            ]
        };
    };

    // Generate region-specific service schema
    const generateRegionalServiceSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "International Online Gaming Platform",
            "description": "Secure online gaming platform serving players across multiple countries with localized support and payment methods",
            "provider": {
                "@type": "Organization",
                "name": "LuckCharm Gaming",
                "url": "https://luckcharm.com"
            },
            "areaServed": targetRegions.map(region => ({
                "@type": "Country",
                "name": region
            })),
            "availableLanguage": ["English", "Spanish", "French", "German"],
            "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            },
            "serviceType": "Online Gaming Platform",
            "serviceOutput": "Gaming Entertainment",
            "offers": targetRegions.map(region => ({
                "@type": "Offer",
                "name": `Gaming Services in ${region}`,
                "description": `Secure online gaming platform available to players in ${region}`,
                "priceValidUntil": "2025-12-31",
                "areaServed": {
                    "@type": "Country",
                    "name": region
                },
                "availability": "https://schema.org/InStock",
                "priceCurrency": region === "United Kingdom" ? "GBP" : region === "Canada" ? "CAD" : "USD",
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": region === "United Kingdom" ? "GB" : region === "Canada" ? "CA" : "US"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 0,
                            "unitCode": "MIN"
                        }
                    },
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "0.00",
                        "currency": region === "United Kingdom" ? "GBP" : region === "Canada" ? "CAD" : "USD"
                    }
                },
                "hasMerchantReturnPolicy": {
                    "@type": "MerchantReturnPolicy",
                    "applicableCountry": region === "United Kingdom" ? "GB" : region === "Canada" ? "CA" : "US",
                    "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                }
            }))
        };
    };

    // Generate combined schemas
    const generateCombinedLocalSchema = () => {
        const schemas = [];
        
        const businessSchema = generateLocalBusinessSchema();
        if (businessSchema) schemas.push(businessSchema);
        
        const serviceSchema = generateRegionalServiceSchema();
        if (serviceSchema) schemas.push(serviceSchema);

        return schemas.length > 0 ? schemas : null;
    };

    // Generate region-specific meta descriptions
    const generateRegionalDescription = () => {
        const primaryRegion = targetRegions[0] || 'Worldwide';
        return `Experience premium online gaming in ${primaryRegion} and beyond. Secure platform with instant deposits, 24/7 support, and legal compliance across ${targetRegions.join(', ')}.`;
    };

    return (
        <Helmet>
            {/* Location-based meta tags */}
            <meta name="keywords" content={generateLocalGamingKeywords()} />
            <meta name="description" content={generateRegionalDescription()} />
            <meta name="geo.region" content={targetRegions.join(', ')} />
            <meta name="geo.placename" content={targetRegions.join(', ')} />
            
            {/* Region-specific Open Graph tags */}
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="en_GB" />
            <meta property="og:locale:alternate" content="en_CA" />
            <meta property="og:locale:alternate" content="en_AU" />
            
            {/* Hreflang for international SEO */}
            <link rel="alternate" hrefLang="en-us" href="https://luckcharm.com" />
            <link rel="alternate" hrefLang="en-gb" href="https://luckcharm.com/uk" />
            <link rel="alternate" hrefLang="en-ca" href="https://luckcharm.com/ca" />
            <link rel="alternate" hrefLang="en-au" href="https://luckcharm.com/au" />
            <link rel="alternate" hrefLang="x-default" href="https://luckcharm.com" />
            
            {/* Regional business information */}
            <meta name="business.coverage_area" content={targetRegions.join(', ')} />
            <meta name="business.hours" content="24/7" />
            <meta name="business.contact" content="support@luckcharm.com" />
            
            {/* Schema markup */}
            {generateCombinedLocalSchema() && (
                <script type="application/ld+json">
                    {JSON.stringify(generateCombinedLocalSchema())}
                </script>
            )}
            
            {/* Additional regional SEO meta tags */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="coverage" content="Worldwide" />
            <meta name="distribution" content="Global" />
            <meta name="target" content="all" />
            <meta name="audience" content="all" />
            
            {/* Currency and payment method indicators */}
            <meta name="payment.currency" content="USD, GBP, CAD, AUD, EUR" />
            <meta name="payment.methods" content="PayPal, Credit Card, Cryptocurrency" />
            
            {/* Gaming-specific regional compliance */}
            <meta name="gaming.compliance" content="Licensed and Regulated" />
            <meta name="gaming.age_restriction" content="18+" />
            <meta name="gaming.responsible" content="Responsible Gaming Practices" />
        </Helmet>
    );
};

export default LocalGamingSEO;