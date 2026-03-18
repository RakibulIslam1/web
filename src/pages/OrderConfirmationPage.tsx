import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Order } from '../types'
import { getOrder } from '../services/ordersService'
import Navigation from '../components/Navigation'

/**
 * Order confirmation page
 */
export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return

      try {
        const orderData = await getOrder(orderId)
        setOrder(orderData)
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-dark pt-24">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-gray-400">Loading order...</div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full min-h-screen bg-dark pt-24">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Order Not Found</h1>
          <Link
            to="/"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-8 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">✓ Order Confirmed!</div>
          <p className="text-green-300">Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="bg-slate rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Order Details</h2>

            {/* Order ID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-700">
              <div>
                <p className="text-gray-400 text-sm mb-1">Order ID</p>
                <p className="text-white font-semibold">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className="text-white font-semibold capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Order Date</p>
                <p className="text-white font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Shipping Information</h3>
              <div className="text-gray-300 space-y-1">
                <p>{order.shippingInfo.fullName}</p>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.postal}
                </p>
                <p>{order.shippingInfo.phone}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${JSON.stringify(item.selectedVariations)}`}
                  className="flex justify-between items-center py-3 border-b border-gray-700"
                >
                  <div>
                    <p className="text-white font-semibold">{item.product?.name || item.productId}</p>
                    {Object.entries(item.selectedVariations).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedVariations)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ')}
                      </div>
                    )}
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white font-semibold">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-700 pt-6 text-right">
            <p className="text-3xl font-bold text-white">
              Total: ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition text-center"
          >
            View All Orders
          </Link>
          <Link
            to="/"
            className="inline-block border border-gray-600 text-white font-semibold px-8 py-3 rounded hover:bg-slate transition text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
