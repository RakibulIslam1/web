// Product data model
export interface Variation {
  type: 'size' | 'color'
  options: string[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  variations: Variation[]
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// Order data model
export interface CartItem {
  productId: string
  product?: Product
  quantity: number
  selectedVariations: Record<string, string>
  itemPrice: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed'
  shippingInfo: {
    fullName: string
    address: string
    city: string
    postal: string
    phone: string
  }
  createdAt: Date
  updatedAt: Date
}

// User data model
export interface User {
  uid: string
  email: string
  role: 'admin' | 'customer'
  createdAt: Date
}

// Auth context
export interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}
