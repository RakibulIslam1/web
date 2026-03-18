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
  limit,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Order, CartItem } from '../types'

function getDbOrThrow() {
  if (!db) throw new Error('Firebase Firestore is not configured')
  return db
}

function ordersCollection() {
  return collection(getDbOrThrow(), 'orders')
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
 * Get all orders (admin function)
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(ordersCollection(), orderBy('createdAt', 'desc'), limit(1000))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
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
    console.error('Error fetching orders:', error)
    return []
  }
}

/**
 * Get orders for a specific user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ]
    const q = query(ordersCollection(), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
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
    console.error('Error fetching user orders:', error)
    return []
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const docRef = doc(getDbOrThrow(), 'orders', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
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
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Create a new order
 */
export async function createOrder(
  userId: string,
  userEmail: string,
  items: CartItem[],
  total: number,
  shippingInfo: Order['shippingInfo']
): Promise<string> {
  try {
    const docRef = await addDoc(ordersCollection(), {
      userId,
      userEmail,
      items,
      total,
      status: 'pending',
      shippingInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Update order status (admin function)
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'completed'
): Promise<void> {
  try {
    const docRef = doc(getDbOrThrow(), 'orders', orderId)
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

/**
 * Delete an order (admin function)
 */
export async function deleteOrder(id: string): Promise<void> {
  try {
    const docRef = doc(getDbOrThrow(), 'orders', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}
