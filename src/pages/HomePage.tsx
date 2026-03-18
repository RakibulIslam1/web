import React, { useEffect, useState } from 'react'
import { Product } from '../types'
import { getProducts } from '../services/productsService'
import FloatingProductsCanvas from '../components/FloatingProductsCanvas'
import ProductModal from '../components/ProductModal'

/**
 * Home page with floating products canvas
 */
export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null)

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts(true)
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleProductHover = (product: Product | null) => {
    setHoveredProduct(product)
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-4">GUFRAM</div>
          <div className="text-gray-400">Loading collection...</div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-4">GUFRAM</div>
          <div className="text-gray-400">No products available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <FloatingProductsCanvas
        products={products}
        onProductClick={handleProductClick}
        onProductHover={handleProductHover}
      />

      {/* Hovered Product Name Display (optional, can be in canvas) */}
      {hoveredProduct && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
          <div className="text-white font-semibold text-lg">{hoveredProduct.name}</div>
          <div className="text-gray-400 text-sm">${hoveredProduct.price.toFixed(2)}</div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default HomePage
