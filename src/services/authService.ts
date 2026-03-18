import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { User } from '../types'

const ADMIN_EMAILS = ['rakibul.rir06@gmail.com']

function getAuthOrThrow() {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return auth
}

function getDbOrThrow() {
  if (!db) throw new Error('Firebase Firestore is not configured')
  return db
}

/**
 * Determine if user is admin based on email
 */
export function isAdminUser(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

/**
 * Create a user document in Firestore after signup
 */
export async function createUserDoc(uid: string, email: string): Promise<void> {
  try {
    const userRef = doc(getDbOrThrow(), 'users', uid)
    await setDoc(userRef, {
      uid,
      email,
      role: isAdminUser(email) ? 'admin' : 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error creating user document:', error)
    throw error
  }
}

/**
 * Get all users for admin management
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(getDbOrThrow(), 'users')
    const snapshot = await getDocs(usersRef)

    return snapshot.docs
      .map((userDoc) => {
        const data = userDoc.data()
        return {
          uid: data.uid,
          email: data.email,
          role: data.role || 'customer',
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as User
      })
      .sort((a, b) => a.email.localeCompare(b.email))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

/**
 * Update user role by email
 */
export async function updateUserRoleByEmail(
  email: string,
  role: 'admin' | 'customer'
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      return { success: false, message: 'Email is required' }
    }

    const usersRef = collection(getDbOrThrow(), 'users')
    const userQuery = query(usersRef, where('email', '==', normalizedEmail), limit(1))
    const userSnapshot = await getDocs(userQuery)

    if (userSnapshot.empty) {
      return {
        success: false,
        message: 'User not found. Ask the user to sign up first, then promote them.',
      }
    }

    const userDocRef = userSnapshot.docs[0].ref
    await updateDoc(userDocRef, {
      role,
      updatedAt: new Date(),
    })

    return { success: true, message: `User role updated to ${role}` }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, message: 'Failed to update role. Check Firestore rules.' }
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserDoc(uid: string): Promise<User | null> {
  try {
    const userRef = doc(getDbOrThrow(), 'users', uid)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        uid: data.uid,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      }
    }

    // If doc doesn't exist, create it
    await createUserDoc(uid, auth?.currentUser?.email ?? '')
    return getUserDoc(uid)
  } catch (error) {
    console.error('Error getting user document:', error)
    return null
  }
}

/**
 * Sign up with email and password
 */
export async function signup(email: string, password: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(getAuthOrThrow(), email, password)
    await createUserDoc(result.user.uid, email)

    const user = await getUserDoc(result.user.uid)
    if (!user) throw new Error('Failed to create user document')

    return user
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

/**
 * Sign in with email and password
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(getAuthOrThrow(), email, password)
    const user = await getUserDoc(result.user.uid)
    if (!user) throw new Error('User document not found')

    return user
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Sign out
 */
export async function logout(): Promise<void> {
  try {
    await signOut(getAuthOrThrow())
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}
