function storageDisabledError() {
  return new Error('Firebase Storage is disabled in this project. Use imageUrl fields with public URLs.')
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  void file
  void path
  throw storageDisabledError()
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  void path
  throw storageDisabledError()
}

/**
 * Upload a product image
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  void file
  void productId
  throw storageDisabledError()
}
