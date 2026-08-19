"use client"

import { useState, useEffect } from "react"
import { getImageUrl, getPlaceholderUrl } from "../utils/getImageUrl"

const OptimizedImage = ({ src, alt, className = "", width, height, quality, loading = "lazy", onLoad, fetchPriority, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState("")

  useEffect(() => {
    // Generate placeholder
    const placeholder = getPlaceholderUrl(src)
    setCurrentSrc(placeholder)

    // Preload full image
    const img = new Image()
    const fullSrc = getImageUrl(src, { width, height, quality })

    img.src = fullSrc
    img.onload = () => {
      setCurrentSrc(fullSrc)
      setIsLoaded(true)
      onLoad?.()
    }
  }, [src, width, height, quality, onLoad])

  return (
    <img
      src={currentSrc || "/placeholder.svg"}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-60"}`}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchpriority={fetchPriority || (loading === 'eager' ? 'high' : 'low')}
      {...props}
    />
  )
}

export default OptimizedImage
