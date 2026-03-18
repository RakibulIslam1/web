import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from '../firebase'

function getStorageOrThrow() {
  if (!storage) throw new Error('Firebase Storage is not configured')
  return storage
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(getStorageOrThrow(), path)
    await uploadBytes(storageRef, file)
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const fileRef = ref(getStorageOrThrow(), path)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Upload a product image
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${productId}-${timestamp}`
  const path = `products/${fileName}`
  return uploadFile(file, path)
}
