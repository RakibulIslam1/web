import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { AuthContextType, User } from '../types'
import { signup as authSignup, login as authLogin, logout as authLogout, getUserDoc, isAdminUser } from '../services/authService'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get user document from Firestore
          const userDoc = await getUserDoc(firebaseUser.uid)
          setCurrentUser(userDoc)
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string) => {
    await authSignup(email, password)
  }

  const login = async (email: string, password: string) => {
    await authLogin(email, password)
  }

  const logout = async () => {
    await authLogout()
  }

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    isAdmin: currentUser ? isAdminUser(currentUser.email) : false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
