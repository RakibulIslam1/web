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
  CollectionReference,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Order, CartItem } from '../types'

const ordersCollection = collection(db, 'orders') as CollectionReference<Order>

/**
 * Get all orders (admin function)
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(1000))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }))
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
    const q = query(ordersCollection, ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }))
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
    const docRef = doc(db, 'orders', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
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
    const docRef = await addDoc(ordersCollection, {
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
    const docRef = doc(db, 'orders', orderId)
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
    const docRef = doc(db, 'orders', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}
