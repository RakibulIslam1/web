import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import { User } from '../../types'
import { getAllUsers, updateUserRoleByEmail } from '../../services/authService'

/**
 * Admin dashboard main page
 */
export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [updatingRole, setUpdatingRole] = useState(false)

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const userList = await getAllUsers()
      setUsers(userList)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSetRole = async (role: 'admin' | 'customer', email?: string) => {
    const targetEmail = (email || emailInput).trim().toLowerCase()
    if (!targetEmail) {
      alert('Please enter an email')
      return
    }

    setUpdatingRole(true)
    const result = await updateUserRoleByEmail(targetEmail, role)
    setUpdatingRole(false)

    alert(result.message)
    if (result.success) {
      setEmailInput('')
      await loadUsers()
    }
  }

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

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Access Management</h2>

          <div className="bg-slate rounded-lg p-6 mb-6">
            <p className="text-gray-400 text-sm mb-4">
              Promote an existing signed-up user to admin by email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white"
              />
              <button
                onClick={() => handleSetRole('admin')}
                disabled={updatingRole}
                className="px-5 py-2 rounded bg-white text-black font-semibold hover:bg-gray-200 disabled:opacity-50 transition"
              >
                {updatingRole ? 'Updating...' : 'Make Admin'}
              </button>
            </div>
          </div>

          <div className="bg-slate rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
            {loadingUsers ? (
              <p className="text-gray-400">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-400">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.uid} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-dark rounded p-3">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-xs text-gray-400">Role: {user.role}</p>
                    </div>

                    <div className="flex gap-2">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => handleSetRole('admin', user.email)}
                          disabled={updatingRole}
                          className="px-3 py-1 rounded bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-50 transition"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetRole('customer', user.email)}
                          disabled={updatingRole}
                          className="px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50 transition"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
