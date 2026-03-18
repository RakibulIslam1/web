import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { getProducts } from '../services/productsService'
import FloatingProductsCanvas from '../components/FloatingProductsCanvas'
import ProductModal from '../components/ProductModal'
import { firebaseConfigError } from '../firebase'
import { seedFirestore } from '../data/seedData'
import Navigation from '../components/Navigation'

/**
 * Home page with floating products canvas
 */
export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null)
  const [seeding, setSeeding] = useState(false)

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

  const handleSeedProducts = async () => {
    setSeeding(true)
    try {
      await seedFirestore()
      const data = await getProducts(true)
      setProducts(data)
    } catch (error) {
      console.error('Error seeding products:', error)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-dark">
        <Navigation />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">GUFRAM</div>
            <div className="text-gray-400">Loading collection...</div>
          </div>
        </div>
      </div>
    )
  }

  if (firebaseConfigError) {
    return (
      <div className="w-full h-screen bg-dark px-6">
        <Navigation />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="text-4xl font-bold text-white mb-4">GUFRAM</div>
            <div className="text-yellow-300 mb-3">Firebase is not configured on this deployment.</div>
            <div className="text-gray-400 text-sm break-words">{firebaseConfigError}</div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="w-full h-screen bg-dark px-6">
        <Navigation />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="text-4xl font-bold text-white mb-4">GUFRAM</div>
            <div className="text-gray-300 mb-3">No products available yet.</div>
            <div className="text-gray-500 text-sm mb-8">
              Sign in to access admin tools, or sign up as a customer to use cart and checkout.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link
                to="/auth?mode=signin"
                className="px-5 py-2 rounded bg-white text-black font-semibold hover:bg-gray-200 transition"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-5 py-2 rounded border border-gray-500 text-white hover:bg-slate transition"
              >
                Sign Up
              </Link>
            </div>

            {isAdmin && (
              <button
                onClick={handleSeedProducts}
                disabled={seeding}
                className="px-5 py-2 rounded border border-yellow-500 text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-50 transition"
              >
                {seeding ? 'Seeding Products...' : 'Seed Demo Products'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Navigation />
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
