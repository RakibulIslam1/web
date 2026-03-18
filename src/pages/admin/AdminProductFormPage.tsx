import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Product, Variation } from '../../types'
import { getProduct, createProduct, updateProduct, deleteProduct } from '../../services/productsService'
import { uploadProductImage } from '../../services/storageService'
import Navigation from '../../components/Navigation'

/**
 * Admin product form for creating/editing products
 */
export const AdminProductFormPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const isEditMode = !!productId && productId !== 'new'

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    category: 'clothing',
    variations: [],
    imageUrl: '',
    isActive: true,
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [deletingProduct, setDeletingProduct] = useState(false)

  // Load product if editing
  useEffect(() => {
    if (!isEditMode) return

    const loadProduct = async () => {
      try {
        const data = await getProduct(productId!)
        if (data) {
          setProduct(data)
          setImagePreview(data.imageUrl)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [isEditMode, productId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setProduct((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : finalValue,
    }))

    if (name === 'imageUrl') {
      setImagePreview(value)
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploadingImage(true)
    try {
      const uploadId = isEditMode ? productId! : `new-${Date.now()}`
      const imageUrl = await uploadProductImage(file, uploadId)
      setProduct((prev) => ({
        ...prev,
        imageUrl,
      }))
      setImagePreview(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      const message = error instanceof Error ? error.message : 'Unknown upload error'
      setUploadError(message)
      alert(`Failed to upload image: ${message}`)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleAddVariation = () => {
    setProduct((prev) => ({
      ...prev,
      variations: [
        ...(prev.variations || []),
        { type: 'size', options: [] },
      ],
    }))
  }

  const handleRemoveVariation = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      variations: prev.variations?.filter((_, i) => i !== index),
    }))
  }

  const handleVariationChange = (index: number, field: string, value: any) => {
    if (!product.variations) return

    const newVariations = [...product.variations]
    if (field === 'type') {
      newVariations[index].type = value
    } else if (field === 'options') {
      newVariations[index].options = value.split(',').map((opt: string) => opt.trim())
    }

    setProduct((prev) => ({
      ...prev,
      variations: newVariations,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...product,
      } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

      if (isEditMode) {
        await updateProduct(productId!, productData)
      } else {
        await createProduct(productData)
      }

      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!isEditMode || !productId) return
    if (!confirm('Delete this product permanently?')) return

    setDeletingProduct(true)
    try {
      await deleteProduct(productId)
      navigate('/admin/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setDeletingProduct(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-dark pt-24">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-gray-400">Loading product...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dark">
      <Navigation />

      <div className="pt-24 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-slate rounded-lg p-8 space-y-6">
          {/* Image URL */}
          <div>
            <label className="block text-lg font-semibold text-white mb-3">Product Image</label>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-32 h-32 bg-dark rounded flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-gray-500">No image</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 mb-2">Upload image file</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage || saving}
                  className="w-full mb-3 px-4 py-2 bg-dark border border-gray-600 rounded text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white file:text-black file:font-semibold"
                />
                {uploadingImage && <p className="text-xs text-yellow-300 mb-3">Uploading image...</p>}
                {uploadError && <p className="text-xs text-red-400 mb-3">{uploadError}</p>}

                <label className="block text-xs font-semibold text-gray-400 mb-2">Or paste image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={product.imageUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
                />
                <p className="text-xs text-gray-500 mt-2">You can upload from your device or use a direct URL.</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
              placeholder="e.g., Classic T-Shirt"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={product.slug}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
              placeholder="e.g., classic-t-shirt"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition resize-none"
              placeholder="Product description..."
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
                placeholder="0.00"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
              <select
                name="category"
                value={product.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
              >
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={product.isActive}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-semibold text-gray-300">Active (visible on shop)</label>
          </div>

          {/* Variations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-semibold text-white">Product Variations</label>
              <button
                type="button"
                onClick={handleAddVariation}
                className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
              >
                + Add Variation
              </button>
            </div>

            <div className="space-y-3">
              {product.variations?.map((variation, index) => (
                <div key={index} className="bg-dark p-4 rounded space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Type</label>
                      <select
                        value={variation.type}
                        onChange={(e) => handleVariationChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-1 bg-slate border border-gray-600 rounded text-white text-sm"
                      >
                        <option value="size">Size</option>
                        <option value="color">Color</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={variation.options.join(', ')}
                        onChange={(e) => handleVariationChange(index, 'options', e.target.value)}
                        className="w-full px-3 py-1 bg-slate border border-gray-600 rounded text-white text-sm"
                        placeholder="e.g., XS, S, M, L, XL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(index)}
                      className="text-red-400 hover:text-red-300 text-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 border border-gray-600 text-white font-semibold py-3 rounded hover:bg-slate transition"
            >
              Cancel
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deletingProduct || saving}
                className="flex-1 border border-red-500 text-red-300 font-semibold py-3 rounded hover:bg-red-500/10 disabled:opacity-50 transition"
              >
                {deletingProduct ? 'Deleting...' : 'Delete Product'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductFormPage
