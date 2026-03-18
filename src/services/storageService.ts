import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../firebase'

function getStorageOrThrow() {
  if (!storage) {
    throw new Error('Firebase Storage is not configured')
  }
  return storage
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs)
    }),
  ])
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(getStorageOrThrow(), path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  await withTimeout(
    new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        undefined,
        (error) => reject(error),
        () => resolve()
      )
    }),
    20000,
    'Upload timed out after 20 seconds. Check Storage bucket config and rules.'
  )

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
