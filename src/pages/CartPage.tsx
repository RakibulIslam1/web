import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import Navigation from '../components/Navigation'

/**
 * Shopping cart page
 */
export const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateCartItem, getCartTotal } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-dark">
        <Navigation />
        <div className="pt-24 max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Your Cart</h1>
          <p className="text-gray-400 mb-8">Your cart is empty</p>
          <Link
            to="/"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const total = getCartTotal()

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.selectedVariations)}`}
                className="bg-slate rounded-lg p-6 flex flex-col sm:flex-row gap-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-dark rounded flex items-center justify-center">
                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product?.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.product?.name}</h3>

                  {/* Variations */}
                  {Object.entries(item.selectedVariations).length > 0 && (
                    <div className="text-sm text-gray-400 mb-3">
                      {Object.entries(item.selectedVariations).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <p className="text-lg font-semibold text-white mb-3">
                    ${item.subtotal.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center hover:bg-dark transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartItem(item.productId, Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-12 px-2 py-1 bg-dark border border-gray-600 rounded text-center text-white"
                    />
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center hover:bg-dark transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="ml-auto text-red-400 hover:text-red-300 transition text-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {/* Items Count */}
              <div className="flex justify-between text-gray-300 mb-4">
                <span>Items:{' '}</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-gray-300 mb-4">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Shipping (fake) */}
              <div className="flex justify-between text-gray-300 mb-4 pb-4 border-b border-gray-700">
                <span>Shipping:</span>
                <span>$0.00</span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-white font-bold text-lg mb-6">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="block w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 transition text-center mb-4"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/"
                className="block w-full border border-gray-600 text-white font-semibold py-3 rounded hover:bg-dark transition text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
