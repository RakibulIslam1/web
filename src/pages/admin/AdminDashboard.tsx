import React from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../../components/Navigation'

/**
 * Admin dashboard main page
 */
export const AdminDashboard: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Admin Panel</h1>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products */}
          <Link
            to="/admin/products"
            className="bg-slate rounded-lg p-8 hover:bg-slate/90 transition group"
          >
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition">
              📦 Products
            </h2>
            <p className="text-gray-400">Manage product catalog, add, edit, or delete items</p>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className="bg-slate rounded-lg p-8 hover:bg-slate/90 transition group"
          >
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition">
              📋 Orders
            </h2>
            <p className="text-gray-400">View all customer orders and update status</p>
          </Link>
        </div>

        {/* Quick Stats (optional) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Products</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
            <div className="bg-slate rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
            <div className="bg-slate rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Pending Orders</p>
              <p className="text-3xl font-bold text-white">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
