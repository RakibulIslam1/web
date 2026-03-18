import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Product } from '../types'

function getDbOrThrow() {
  if (!db) throw new Error('Firebase Firestore is not configured')
  return db
}

function productsCollection() {
  return collection(getDbOrThrow(), 'products')
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (value && typeof value === 'object' && 'toDate' in value) {
    const maybeTimestamp = value as { toDate: () => Date }
    return maybeTimestamp.toDate()
  }
  return new Date()
}

/**
 * Get all active products from Firestore
 */
export async function getProducts(isActive: boolean = true): Promise<Product[]> {
  try {
    const constraints: QueryConstraint[] = [where('isActive', '==', isActive)]
    const q = query(productsCollection(), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
        createdAt?: unknown
        updatedAt?: unknown
      }
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(getDbOrThrow(), 'products', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
        createdAt?: unknown
        updatedAt?: unknown
      }
      return {
        ...data,
        id: docSnap.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(productsCollection(), {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(getDbOrThrow(), 'products', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(getDbOrThrow(), 'products', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
