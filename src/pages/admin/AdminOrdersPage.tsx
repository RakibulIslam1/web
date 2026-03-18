import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Order } from '../../types'
import { getAllOrders, updateOrderStatus } from '../../services/ordersService'
import Navigation from '../../components/Navigation'

/**
 * Admin orders management page
 */
export const AdminOrdersPage: React.FC = () => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/')
    return null
  }

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAllOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleStatusChange = async (
    orderId: string,
    newStatus: typeof orders[0]['status']
  ) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Orders</h1>

        {loading ? (
          <div className="text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 font-semibold text-gray-300">Order ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-300">Customer</th>
                  <th className="px-4 py-3 font-semibold text-gray-300">Items</th>
                  <th className="px-4 py-3 font-semibold text-gray-300 text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700/50 hover:bg-slate/50 transition">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                        className="text-white font-semibold hover:text-gray-300 transition text-sm"
                      >
                        {order.id.substring(0, 8)}...
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-semibold">{order.shippingInfo.fullName}</p>
                        <p className="text-gray-400 text-sm">{order.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{order.items.length}</td>
                    <td className="px-4 py-3 text-white font-semibold text-right">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as typeof order.status
                          )
                        }
                        disabled={updating === order.id}
                        className={`px-3 py-1 rounded text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 ${
                          order.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'shipped'
                            ? 'bg-blue-500/20 text-blue-400'
                            : order.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
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

export default AdminOrdersPage
