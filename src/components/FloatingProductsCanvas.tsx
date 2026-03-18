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
  driftX: number
  driftY: number
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
  const PRODUCT_SIZE = 192
  const containerRef = useRef<HTMLDivElement>(null)
  const [floatingProducts, setFloatingProducts] = useState<FloatingProduct[]>([])
  const [scrollSpeed, setScrollSpeed] = useState(0)
  const scrollSpeedRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null)

  const getCenterPosition = () => ({
    x: window.innerWidth / 2 - PRODUCT_SIZE / 2,
    y: window.innerHeight / 2 - PRODUCT_SIZE / 2,
  })

  const createFloatingProduct = (product: Product): FloatingProduct => {
    const center = getCenterPosition()
    const angle = Math.random() * Math.PI * 2
    const driftMagnitude = 0.8 + Math.random() * 0.9

    return {
      id: product.id,
      x: center.x,
      y: center.y,
      scale: 0.18 + Math.random() * 0.08,
      opacity: 1,
      velocityZ: 0.004 + Math.random() * 0.004,
      baseScale: 0.18 + Math.random() * 0.08,
      driftX: Math.cos(angle) * driftMagnitude,
      driftY: Math.sin(angle) * driftMagnitude,
      product,
    }
  }

  // Initialize floating products at center
  useEffect(() => {
    if (products.length === 0) return

    const initialized = products.map((product) => createFloatingProduct(product))

    setFloatingProducts(initialized)
  }, [products])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFloatingProducts((prevProducts) =>
        prevProducts.map((obj) => {
          let newScale = obj.scale
          let newOpacity = obj.opacity
          let newX = obj.x
          let newY = obj.y

          // Auto-zoom slowly; scroll increases speed proportionally
          const speedBoost = Math.max(0, scrollSpeedRef.current)
          const zoomSpeed = obj.velocityZ * (1 + speedBoost * 2.6)
          const moveSpeed = 0.85 + speedBoost * 3.5

          newScale += zoomSpeed
          newX += obj.driftX * moveSpeed
          newY += obj.driftY * moveSpeed

          const edgeDistanceX = Math.min(newX + PRODUCT_SIZE, window.innerWidth - newX)
          const edgeDistanceY = Math.min(newY + PRODUCT_SIZE, window.innerHeight - newY)
          const edgeDistance = Math.min(edgeDistanceX, edgeDistanceY)
          newOpacity = Math.max(0.35, Math.min(1, edgeDistance / 220))

          const outOfFrame =
            newX > window.innerWidth + PRODUCT_SIZE ||
            newX < -PRODUCT_SIZE * 2 ||
            newY > window.innerHeight + PRODUCT_SIZE ||
            newY < -PRODUCT_SIZE * 2

          // Reset only after object exits frame
          if (outOfFrame) {
            return createFloatingProduct(obj.product)
          }

          return {
            ...obj,
            x: newX,
            y: newY,
            scale: newScale,
            opacity: newOpacity,
          }
        })
      )

      // Gradually decrease scroll speed
      scrollSpeedRef.current *= 0.94
      if (scrollSpeedRef.current < 0.01) scrollSpeedRef.current = 0

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Handle scroll wheel for zoom speed boost
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()

    // Accumulate positive scroll for acceleration and allow upward scroll to reduce speed
    scrollSpeedRef.current = Math.max(0, Math.min(6, scrollSpeedRef.current + e.deltaY * 0.006))
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
