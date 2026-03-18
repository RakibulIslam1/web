import React, { useState } from 'react'
import { Product, Variation } from '../types'
import { useCart } from '../contexts/CartContext'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal component for displaying product details
 */
export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({})
  const [addedMessage, setAddedMessage] = useState(false)

  if (!isOpen || !product) return null

  const handleVariationChange = (type: string, value: string) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleAddToCart = () => {
    // Validate all required variations are selected
    const requiredVariations = product.variations.filter((v) => v.options.length > 0)
    const allSelected = requiredVariations.every((v) => selectedVariations[v.type])

    if (!allSelected) {
      alert('Please select all product variations')
      return
    }

    addToCart(product, quantity, selectedVariations)
    setAddedMessage(true)

    setTimeout(() => {
      setAddedMessage(false)
    }, 2000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate w-full max-w-md rounded-lg overflow-hidden shadow-2xl max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Product Image */}
        <div className="flex items-center justify-center bg-gradient-to-b from-dark to-slate py-8 px-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-full max-h-80 object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="border-b border-gray-700 pb-4">
            <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
            {product.category && <p className="text-sm text-gray-400 mt-1">Category: {product.category}</p>}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Variations */}
          {product.variations.length > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Options</h3>
              <div className="space-y-4">
                {product.variations.map((variation: Variation) => (
                  <div key={variation.type}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {variation.type}
                    </label>
                    <select
                      value={selectedVariations[variation.type] || ''}
                      onChange={(e) => handleVariationChange(variation.type, e.target.value)}
                      className="w-full px-3 py-2 bg-dark border border-gray-600 rounded text-white text-sm hover:border-gray-500 focus:outline-none focus:border-white transition"
                    >
                      <option value="">Select {variation.type}</option>
                      {variation.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 bg-dark border border-gray-600 rounded text-center text-white"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 transition duration-200"
          >
            Add to Cart – ${(product.price * quantity).toFixed(2)}
          </button>

          {addedMessage && (
            <div className="text-center text-sm text-green-400 animate-pulse">
              ✓ Added to cart!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductModal
