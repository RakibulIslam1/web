import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Order } from '../types'
import { getUserOrders } from '../services/ordersService'
import Navigation from '../components/Navigation'

/**
 * Orders page for viewing user's orders
 */
export const OrdersPage: React.FC = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth')
    return null
  }

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getUserOrders(currentUser.uid)
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [currentUser])

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Your Orders</h1>

        {loading ? (
          <div className="text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-8">You haven't placed any orders yet</p>
            <Link
              to="/"
              className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
            >
              Start Shopping
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
                  {/* Order ID */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order ID</p>
                    <p className="text-white font-semibold text-sm">
                      {order.id.substring(0, 8)}...
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date</p>
                    <p className="text-white font-semibold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <div className="inline-block">
                      <span className={`px-3 py-1 rounded text-xs font-semibold capitalize ${
                        order.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400'
                          : order.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Total</p>
                    <p className="text-white font-semibold text-lg">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.productId} className="text-xs bg-dark px-2 py-1 rounded text-gray-300">
                        {item.product?.name}
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
      </div>
    </div>
  )
}

export default OrdersPage
