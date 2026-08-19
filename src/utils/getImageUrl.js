const CLOUDFRONT_BASE_URL = "https://d1txq81lrc562k.cloudfront.net"

/**
 * Generate optimized CloudFront URLs with transformation parameters
 * Note: CloudFront serves images directly without transformation parameters
 * @param {string} path - Image path or full URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {string} options.quality - Image quality (1-100)
 * @param {string} options.format - Output format (auto, webp, jpg, png)
 * @param {boolean} options.progressive - Progressive loading
 * @param {string} options.blur - Blur amount for placeholder
 * @returns {string} Optimized ImageKit URL
 */
export const getImageUrl = (path, options = {}) => {
  // If path is already a full CloudFront URL, return as-is
  if (path && path.startsWith(CLOUDFRONT_BASE_URL)) {
    return path
  }

  // If path is an old ImageKit URL, extract the image filename
  if (path && path.includes('imagekit.io')) {
    const url = new URL(path)
    const pathParts = url.pathname.split('/')
    path = '/' + pathParts[pathParts.length - 1] + url.search
  }

  const { width, height, quality = 80, format = "auto", progressive = true, blur, aspectRatio } = options

  // CloudFront doesn't support transformation parameters like ImageKit
  // Images are served directly without transformation
  // For transformations, consider using Lambda@Edge or pre-generating sizes

  return `${CLOUDFRONT_BASE_URL}${path}`
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} path - Image path
 * @param {object} sizes - Size configurations for different breakpoints
 * @returns {object} URLs for different screen sizes
 */
export const getResponsiveImageUrls = (path, sizes = {}) => {
  const defaultSizes = {
    mobile: { width: 640, quality: 75 },
    tablet: { width: 1024, quality: 80 },
    desktop: { width: 1920, quality: 85 },
    ...sizes,
  }

  return {
    mobile: getImageUrl(path, defaultSizes.mobile),
    tablet: getImageUrl(path, defaultSizes.tablet),
    desktop: getImageUrl(path, defaultSizes.desktop),
  }
}

/**
 * Generate a low-quality placeholder image URL
 * @param {string} path - Image path
 * @returns {string} Blurred placeholder URL
 */
export const getPlaceholderUrl = (path) => {
  return getImageUrl(path, {
    width: 50,
    quality: 20,
    blur: 10,
    format: "webp",
  })
}
