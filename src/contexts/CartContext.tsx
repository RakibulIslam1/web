import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem, Product } from '../types'

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity: number, selectedVariations: Record<string, string>) => void
  removeFromCart: (productId: string) => void
  updateCartItem: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'gufram_cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCartItems(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product, quantity: number, selectedVariations: Record<string, string>) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedVariations) === JSON.stringify(selectedVariations)
      )

      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map((item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedVariations) === JSON.stringify(selectedVariations)
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.itemPrice,
              }
            : item
        )
      }

      // Add new item
      return [
        ...prevItems,
        {
          productId: product.id,
          product,
          quantity,
          selectedVariations,
          itemPrice: product.price,
          subtotal: quantity * product.price,
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.itemPrice,
            }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * Hook to use cart context
 */
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
