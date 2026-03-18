import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '../../types'
import { getProducts, deleteProduct } from '../../services/productsService'
import Navigation from '../../components/Navigation'

/**
 * Admin products management page
 */
export const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Load all products (both active and inactive)
        const data = await getProducts(undefined)
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeleting(productId)
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Products</h1>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-8">No products yet</p>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
            >
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 font-semibold text-gray-300">Product</th>
                  <th className="px-4 py-3 font-semibold text-gray-300">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-300 text-right">Price</th>
                  <th className="px-4 py-3 font-semibold text-gray-300 text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700/50 hover:bg-slate/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div>
                          <p className="text-white font-semibold">{product.name}</p>
                          <p className="text-gray-400 text-sm">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{product.category}</td>
                    <td className="px-4 py-3 text-white font-semibold text-right">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          product.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                        className="text-blue-400 hover:text-blue-300 transition text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="text-red-400 hover:text-red-300 transition text-sm font-semibold disabled:opacity-50"
                      >
                        {deleting === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProductsPage
