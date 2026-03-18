import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Order, Product } from '../types'
import { getUserOrders } from '../services/ordersService'
import { getProducts } from '../services/productsService'
import Navigation from '../components/Navigation'
import ProductModal from '../components/ProductModal'

/**
 * Orders page for viewing user's orders
 */
export const OrdersPage: React.FC = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [shopProducts, setShopProducts] = useState<Product[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (!currentUser) return

    const loadOrders = async () => {
      try {
        const data = await getUserOrders(currentUser.uid)
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoadingOrders(false)
      }
    }

    const loadProducts = async () => {
      try {
        const data = await getProducts(true)
        setShopProducts(data)
      } catch (error) {
        console.error('Error loading products for shop view:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadOrders()
    loadProducts()
  }, [currentUser])

  if (!currentUser) return null

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-4">Shop & Orders</h1>
        <p className="text-gray-400 mb-10">
          Browse products in a regular shop layout, then track your order history below.
        </p>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Shop Products</h2>

          {loadingProducts ? (
            <div className="text-center text-gray-400">Loading products...</div>
          ) : shopProducts.length === 0 ? (
            <div className="text-center py-10 bg-slate rounded-lg">
              <p className="text-gray-400">No active products available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shopProducts.map((product) => (
                <div key={product.id} className="bg-slate rounded-lg p-4 border border-gray-700/70">
                  <div className="aspect-square bg-dark rounded mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">{product.category}</p>
                  <p className="text-lg text-white font-bold mb-4">${product.price.toFixed(2)}</p>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Order History</h2>

          {loadingOrders ? (
            <div className="text-center text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-8">You haven't placed any orders yet</p>
              <Link
                to="/cart"
                className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
              >
                Go to Cart
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate rounded-lg p-6 cursor-pointer hover:bg-slate/90 transition"
                  onClick={() => navigate(`/order-confirmation/${order.id}`)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Order ID</p>
                      <p className="text-white font-semibold text-sm">{order.id.substring(0, 8)}...</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Date</p>
                      <p className="text-white font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <div className="inline-block">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold capitalize ${
                            order.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : order.status === 'shipped'
                              ? 'bg-blue-500/20 text-blue-400'
                              : order.status === 'processing'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-1">Total</p>
                      <p className="text-white font-semibold text-lg">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={`${item.productId}-${idx}`} className="text-xs bg-dark px-2 py-1 rounded text-gray-300">
                          {item.product?.name || 'Product'}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs bg-dark px-2 py-1 rounded text-gray-400">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </div>
  )
}

export default OrdersPage
