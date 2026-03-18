import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
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
    })
  } catch (error) {
    console.error('Error creating user document:', error)
    throw error
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
