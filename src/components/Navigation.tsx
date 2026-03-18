import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

/**
 * Navigation bar component
 */
export const Navigation: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth()
  const { cartItems } = useCart()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 bg-dark/95 backdrop-blur border-b border-gray-700 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
          GUFRAM
        </Link>

        {/* Menu Items */}
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link
              to="/admin"
              className={`transition ${
                isActive('/admin') ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Admin
            </Link>
          )}

          {currentUser && (
            <Link
              to="/orders"
              className={`transition ${
                isActive('/orders') ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Orders
            </Link>
          )}

          {/* Cart Link */}
          <Link
            to="/cart"
            className={`relative transition ${
              isActive('/cart') ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
            }`}
          >
            Cart
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Auth */}
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
