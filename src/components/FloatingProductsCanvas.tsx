import React, { useEffect, useRef, useState } from 'react'
import { Product } from '../types'

interface FloatingProduct {
  id: string
  x: number
  y: number
  scale: number
  opacity: number
  velocityZ: number
  baseScale: number
  product: Product
}

interface FloatingProductsCanvasProps {
  products: Product[]
  onProductClick: (product: Product) => void
  onProductHover?: (product: Product | null) => void
}

/**
 * Canvas-like component that renders floating products with zoom animation
 * Scroll wheel controls zoom speed instead of scrolling page
 */
export const FloatingProductsCanvas: React.FC<FloatingProductsCanvasProps> = ({
  products,
  onProductClick,
  onProductHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [floatingProducts, setFloatingProducts] = useState<FloatingProduct[]>([])
  const [scrollSpeed, setScrollSpeed] = useState(0)
  const scrollSpeedRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null)

  // Initialize floating products with random positions
  useEffect(() => {
    if (products.length === 0) return

    const initialized = products.map((product) => ({
      id: product.id,
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 200),
      scale: Math.random() * 0.3 + 0.2, // 0.2 - 0.5
      opacity: 1,
      velocityZ: 0.015 + Math.random() * 0.01, // Base zoom speed
      baseScale: Math.random() * 0.3 + 0.2,
      product,
    }))

    setFloatingProducts(initialized)
  }, [products])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFloatingProducts((prevProducts) =>
        prevProducts.map((obj) => {
          let newScale = obj.scale
          let newOpacity = obj.opacity

          // Adjust zoom speed based on scroll input
          const zoomSpeed = obj.velocityZ * (1 + scrollSpeedRef.current * 0.5)
          newScale += zoomSpeed

          // Fade out as object zooms in
          newOpacity = Math.max(0, 1 - (newScale - obj.baseScale) / 2)

          // Reset if fully zoomed in / faded out
          if (newScale > obj.baseScale + 2 || newOpacity <= 0) {
            return {
              ...obj,
              x: Math.random() * (window.innerWidth - 200),
              y: Math.random() * (window.innerHeight - 200),
              scale: obj.baseScale,
              opacity: 1,
            }
          }

          return {
            ...obj,
            scale: newScale,
            opacity: newOpacity,
          }
        })
      )

      // Gradually decrease scroll speed
      scrollSpeedRef.current *= 0.95

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Handle scroll wheel for zoom speed
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    // Positive wheel delta = scrolling down = faster zoom in
    scrollSpeedRef.current = Math.max(-2, Math.min(2, e.deltaY * 0.001))
    setScrollSpeed(scrollSpeedRef.current)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleProductClick = (product: Product) => {
    onProductClick(product)
  }

  const handleMouseEnter = (product: Product) => {
    setHoveredProductId(product.id)
    onProductHover?.(product)
  }

  const handleMouseLeave = () => {
    setHoveredProductId(null)
    onProductHover?.(null)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-dark to-slate cursor-grab active:cursor-grabbing"
    >
      {/* Floating Products */}
      {floatingProducts.map((obj) => (
        <div
          key={obj.id}
          className="absolute group"
          style={{
            left: `${obj.x}px`,
            top: `${obj.y}px`,
            opacity: obj.opacity,
            zIndex: Math.floor(obj.scale * 100),
          }}
          onClick={() => handleProductClick(obj.product)}
          onMouseEnter={() => handleMouseEnter(obj.product)}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-48 h-48 cursor-pointer transition-transform duration-200 hover:scale-110"
            style={{
              transform: `scale(${obj.scale})`,
              transformOrigin: 'center',
            }}
          >
            <img
              src={obj.product.imageUrl}
              alt={obj.product.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />

            {/* Hover Tooltip */}
            {hoveredProductId === obj.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-white text-black text-sm rounded whitespace-nowrap pointer-events-none">
                {obj.product.name}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Scroll Speed Indicator */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400 pointer-events-none">
        <div>Scroll to control zoom speed</div>
        <div>Click product for details</div>
      </div>
    </div>
  )
}

export default FloatingProductsCanvas
