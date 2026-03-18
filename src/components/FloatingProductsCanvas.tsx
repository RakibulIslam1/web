import React, { useEffect, useRef, useState } from 'react'
import { Product } from '../types'

interface FloatingProduct {
  id: string
  slotIndex: number
  cycle: number
  x: number
  y: number
  scale: number
  opacity: number
  velocityZ: number
  baseScale: number
  directionX: number
  directionY: number
  travel: number
  age: number
  launchDelay: number
  product: Product
}

interface FloatingProductsCanvasProps {
  products: Product[]
  onProductClick: (product: Product) => void
  onProductHover?: (product: Product | null) => void
  isPaused?: boolean
}

/**
 * Canvas-like component that renders floating products with zoom animation
 * Scroll wheel controls zoom speed instead of scrolling page
 */
export const FloatingProductsCanvas: React.FC<FloatingProductsCanvasProps> = ({
  products,
  onProductClick,
  onProductHover,
  isPaused = false,
}) => {
  const PRODUCT_SIZE = 192
  const containerRef = useRef<HTMLDivElement>(null)
  const [floatingProducts, setFloatingProducts] = useState<FloatingProduct[]>([])
  const [scrollSpeed, setScrollSpeed] = useState(0)
  const scrollSpeedRef = useRef(0)
  const isPausedRef = useRef(isPaused)
  const animationFrameRef = useRef<number>()
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null)

  const getCenterPosition = () => ({
    x: window.innerWidth / 2 - PRODUCT_SIZE / 2,
    y: window.innerHeight / 2 - PRODUCT_SIZE / 2,
  })

  const createFloatingProduct = (
    product: Product,
    slotIndex: number,
    total: number,
    cycle = 0
  ): FloatingProduct => {
    const center = getCenterPosition()
    const safeTotal = Math.max(1, total)
    const angle = (slotIndex / safeTotal) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
    const directionX = Math.cos(angle)
    const directionY = Math.sin(angle)
    // Deterministic delay per slot keeps launch staggering stable across infinite loops.
    // Use much shorter delay after first cycle so the loop transition has no visible gap.
    const launchDelay =
      cycle === 0 ? 10 + ((slotIndex * 11 + cycle * 7) % 70) : (slotIndex + cycle) % 8

    return {
      id: `${product.id}-${slotIndex}-${cycle}`,
      slotIndex,
      cycle,
      x: center.x,
      y: center.y,
      scale: 0.08 + Math.random() * 0.04,
      opacity: 0.28,
      velocityZ: 0.004 + Math.random() * 0.004,
      baseScale: 0.08 + Math.random() * 0.04,
      directionX,
      directionY,
      travel: 0,
      age: 0,
      launchDelay,
      product,
    }
  }

  // Initialize floating products at center
  useEffect(() => {
    if (products.length === 0) return

    const initialized = products.map((product, index) => createFloatingProduct(product, index, products.length, 0))

    setFloatingProducts(initialized)
  }, [products])

  // Animation loop
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const animate = () => {
      setFloatingProducts((prevProducts) =>
        prevProducts
          .map((obj, idx) => {
            if (isPausedRef.current) return obj

            let newScale = obj.scale
            let newOpacity = obj.opacity
            let newX = obj.x
            let newY = obj.y
            let newTravel = obj.travel
            let newAge = obj.age + 1

            // Auto-zoom slowly; scroll increases speed proportionally
            const speedBoost = Math.max(0, scrollSpeedRef.current)
            const zoomSpeed = obj.velocityZ * (1 + speedBoost * 2.6)
            const moveSpeed = 0.9 + speedBoost * 3.6

            newScale += zoomSpeed * 0.9

            // Hold product at center/back briefly before launch to avoid top-biased feel and reduce crowding
            if (newAge <= obj.launchDelay) {
              const center = getCenterPosition()
              return {
                ...obj,
                x: center.x,
                y: center.y,
                scale: newScale,
                opacity: Math.min(0.45, 0.16 + newAge * 0.012),
                age: newAge,
              }
            }

            // Grow depth from center, then accelerate outward with scroll
            newTravel += moveSpeed * (0.8 + newScale * 1.2)

            const center = getCenterPosition()
            newX = center.x + obj.directionX * newTravel
            newY = center.y + obj.directionY * newTravel

            const edgeDistanceX = Math.min(newX + PRODUCT_SIZE, window.innerWidth - newX)
            const edgeDistanceY = Math.min(newY + PRODUCT_SIZE, window.innerHeight - newY)
            const edgeDistance = Math.min(edgeDistanceX, edgeDistanceY)

            // Fade in from center-back, then fade as leaving frame
            const fadeIn = Math.min(1, newTravel / 110)
            const fadeOut = Math.max(0.2, Math.min(1, edgeDistance / 220))
            newOpacity = Math.min(fadeIn, fadeOut)

            const outOfFrame =
              newX > window.innerWidth ||
              newX < -PRODUCT_SIZE ||
              newY > window.innerHeight ||
              newY < -PRODUCT_SIZE

            // Reset only after object exits frame, maintaining index-based distribution
            if (outOfFrame) {
              return createFloatingProduct(obj.product, obj.slotIndex, prevProducts.length, obj.cycle + 1)
            }

            return {
              ...obj,
              x: newX,
              y: newY,
              scale: newScale,
              opacity: newOpacity,
              travel: newTravel,
              age: newAge,
            }
          })
      )

      // Gradually decrease scroll speed
      if (!isPausedRef.current) {
        scrollSpeedRef.current *= 0.94
        if (scrollSpeedRef.current < 0.01) scrollSpeedRef.current = 0
      }

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

    if (isPausedRef.current) return

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

  const handleMouseEnter = (floatingId: string, product: Product) => {
    setHoveredProductId(floatingId)
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
          onMouseEnter={() => handleMouseEnter(obj.id, obj.product)}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-48 h-48 cursor-pointer transition-opacity duration-150 hover:opacity-90"
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
