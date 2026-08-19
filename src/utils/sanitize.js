/**
 * HTML Sanitization Utility
 * Provides safe HTML rendering by removing potentially dangerous content
 */

// DOMPurify-like sanitization without external dependency
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "code",
  "pre",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "span",
]

const ALLOWED_ATTRIBUTES = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  div: ["class"],
  span: ["class"],
  code: ["class"],
  pre: ["class"],
}

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"]

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== "string") return ""

  // Create a temporary DOM element
  const temp = document.createElement("div")
  temp.innerHTML = html

  // Recursively clean the DOM tree
  const cleanNode = (node) => {
    // Remove script tags and event handlers
    if (node.tagName === "SCRIPT" || node.tagName === "STYLE") {
      node.remove()
      return
    }

    // Check if tag is allowed
    if (node.tagName && !ALLOWED_TAGS.includes(node.tagName.toLowerCase())) {
      // Replace with text content
      const textNode = document.createTextNode(node.textContent)
      node.parentNode?.replaceChild(textNode, node)
      return
    }

    // Clean attributes
    if (node.attributes) {
      const allowedAttrs = ALLOWED_ATTRIBUTES[node.tagName.toLowerCase()] || []
      Array.from(node.attributes).forEach((attr) => {
        // Remove event handlers
        if (attr.name.startsWith("on")) {
          node.removeAttribute(attr.name)
          return
        }

        // Remove dangerous attributes
        if (!allowedAttrs.includes(attr.name)) {
          node.removeAttribute(attr.name)
          return
        }

        // Check for dangerous protocols in href/src
        if ((attr.name === "href" || attr.name === "src") && attr.value) {
          const lowerValue = attr.value.toLowerCase().trim()
          if (DANGEROUS_PROTOCOLS.some((protocol) => lowerValue.startsWith(protocol))) {
            node.removeAttribute(attr.name)
          }
        }
      })

      // Add security attributes to links
      if (node.tagName === "A") {
        node.setAttribute("rel", "noopener noreferrer")
        if (node.getAttribute("target") === "_blank") {
          // Keep target blank but ensure security
        } else {
          node.removeAttribute("target")
        }
      }
    }

    // Recursively clean children
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 1) {
        // Element node
        cleanNode(child)
      }
    })
  }

  // Clean all nodes
  Array.from(temp.childNodes).forEach((child) => {
    if (child.nodeType === 1) {
      cleanNode(child)
    }
  })

  return temp.innerHTML
}

/**
 * Sanitize user input text (for form inputs)
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return ""

  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize email
 * @param {string} email - Email address
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return ""

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, "") // Only allow valid email characters
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL string
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== "string") return null

  try {
    const urlObj = new URL(url)

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return null
    }

    return urlObj.href
  } catch {
    return null
  }
}

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== "string") return ""

  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
