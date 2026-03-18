import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Auth page for sign in and sign up
 */
export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const [isSignUp, setIsSignUp] = useState(modeParam === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        await signup(email, password)
      } else {
        await login(email, password)
      }

      navigate('/')
    } catch (err) {
      console.error('Auth error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark to-slate pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">GUFRAM</h1>
          <p className="text-gray-400">{isSignUp ? 'Create Account' : 'Sign In'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate p-8 rounded-lg space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password (Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                const nextIsSignUp = !isSignUp
                setIsSignUp(nextIsSignUp)
                setSearchParams({ mode: nextIsSignUp ? 'signup' : 'signin' })
                setError('')
              }}
              className="text-white font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Demo credentials:</p>
          <p>Email: rakibul.rir06@gmail.com</p>
          <p>(Will be admin)</p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
