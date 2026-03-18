import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

function getStorageOrThrow() {
  if (!storage) {
    throw new Error('Firebase Storage is not configured')
  }
  return storage
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(getStorageOrThrow(), path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(getStorageOrThrow(), path)
  await deleteObject(storageRef)
}

/**
 * Upload a product image
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
  const path = `products/${productId}/${fileName}`
  return uploadFile(file, path)
}
