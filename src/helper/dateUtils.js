import { format, formatDistanceToNow, parseISO, isValid } from "date-fns"

/**
 * Format date to YYYY-MM-DD
 * Replaces moment(date).format('YYYY-MM-DD')
 */
export const formatDate = (date) => {
  if (!date) return ""
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date
    return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : ""
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * Replaces moment(date).fromNow()
 */
export const formatRelativeTime = (date) => {
  if (!date) return ""
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date
    return isValid(parsedDate) ? formatDistanceToNow(parsedDate, { addSuffix: true }) : ""
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

/**
 * Format date with custom format string
 * Replaces moment(date).format(formatString)
 */
export const formatCustomDate = (date, formatString = "yyyy-MM-dd") => {
  if (!date) return ""
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date
    return isValid(parsedDate) ? format(parsedDate, formatString) : ""
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

/**
 * Parse and validate ISO date string
 * Replaces moment.utc(date, moment.ISO_8601, true)
 */
export const parseISODate = (dateString) => {
  if (!dateString) return null
  try {
    const trimmed = dateString.trim()
    const parsed = parseISO(trimmed)
    return isValid(parsed) ? parsed : null
  } catch (error) {
    console.error("Date parsing error:", error)
    return null
  }
}
