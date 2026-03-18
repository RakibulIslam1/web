import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createOrder } from '../services/ordersService'
import Navigation from '../components/Navigation'

/**
 * Checkout page for placing orders
 */
export const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postal: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = getCartTotal()

  // Redirect to auth if not logged in
  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-dark pt-24">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-8">You need to be signed in to checkout</p>
          <button
            onClick={() => navigate('/auth')}
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    )
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-dark pt-24">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!formData.fullName || !formData.address || !formData.city || !formData.postal || !formData.phone) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      // Create order
      const orderId = await createOrder(
        currentUser.uid,
        currentUser.email,
        cartItems,
        total,
        formData
      )

      // Clear cart
      clearCart()

      // Redirect to order confirmation
      navigate(`/order-confirmation/${orderId}`)
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                  placeholder="John Doe"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                  placeholder="123 Main St"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                  placeholder="New York"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code *</label>
                <input
                  type="text"
                  name="postal"
                  value={formData.postal}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                  placeholder="10001"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:opacity-50 transition mt-6"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="bg-slate rounded-lg p-6 space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pb-4 border-b border-gray-700">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${JSON.stringify(item.selectedVariations)}`} className="text-sm">
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>{item.product?.name}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                    {Object.entries(item.selectedVariations).length > 0 && (
                      <div className="text-xs text-gray-500 ml-2">
                        {Object.entries(item.selectedVariations).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 ml-2">Qty: {item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
