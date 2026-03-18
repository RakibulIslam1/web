import { Product } from '../types'

/**
 * Seed data for demo products
 * These are placeholder products with placeholder image URLs
 * In a real app, you would upload actual images to Firebase Storage
 */
export const seedProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Classic Crew Neck Tee',
    slug: 'classic-crew-neck-tee',
    description:
      'Timeless and versatile, this classic crew neck t-shirt is perfect for any casual occasion. Made from premium 100% cotton.',
    price: 49.99,
    category: 'clothing',
    variations: [
      {
        type: 'size',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        type: 'color',
        options: ['Black', 'White', 'Navy', 'Charcoal', 'Cream'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Crew+Neck+Tee',
    isActive: true,
  },
  {
    name: 'Premium Hoodie',
    slug: 'premium-hoodie',
    description:
      'Warm and comfortable hoodie perfect for cooler weather. Features a kangaroo pocket and drawstring hood.',
    price: 89.99,
    category: 'clothing',
    variations: [
      {
        type: 'size',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        type: 'color',
        options: ['Black', 'Heather Gray', 'Navy', 'Forest Green'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Premium+Hoodie',
    isActive: true,
  },
  {
    name: 'Slim Fit Jeans',
    slug: 'slim-fit-jeans',
    description: 'Classic slim fit jeans made from high-quality denim. Perfect for any style.',
    price: 79.99,
    category: 'clothing',
    variations: [
      {
        type: 'size',
        options: ['28', '30', '32', '34', '36', '38', '40'],
      },
      {
        type: 'color',
        options: ['Dark Blue', 'Light Blue', 'Black', 'Charcoal'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Slim+Jeans',
    isActive: true,
  },
  {
    name: 'Canvas Sneakers',
    slug: 'canvas-sneakers',
    description: 'Comfortable and stylish canvas sneakers. Great for everyday wear.',
    price: 65.99,
    category: 'footwear',
    variations: [
      {
        type: 'size',
        options: ['5', '6', '7', '8', '9', '10', '11', '12', '13'],
      },
      {
        type: 'color',
        options: ['White', 'Black', 'Navy', 'Red', 'Cream'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Canvas+Sneakers',
    isActive: true,
  },
  {
    name: 'Baseball Cap',
    slug: 'baseball-cap',
    description: 'Classic baseball cap with adjustable back strap. Perfect for any season.',
    price: 29.99,
    category: 'accessories',
    variations: [
      {
        type: 'color',
        options: ['Black', 'White', 'Navy', 'Red', 'Khaki'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Baseball+Cap',
    isActive: true,
  },
  {
    name: 'Oxford Button-Up Shirt',
    slug: 'oxford-button-up-shirt',
    description: 'Sophisticated oxford shirt perfect for professional or casual settings.',
    price: 69.99,
    category: 'clothing',
    variations: [
      {
        type: 'size',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        type: 'color',
        options: ['White', 'Light Blue', 'Pale Pink', 'Ecru'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Oxford+Shirt',
    isActive: true,
  },
  {
    name: 'Wool Beanie',
    slug: 'wool-beanie',
    description: 'Warm and cozy wool beanie. Perfect for cold weather.',
    price: 34.99,
    category: 'accessories',
    variations: [
      {
        type: 'color',
        options: ['Black', 'Charcoal', 'Navy', 'Forest Green', 'Burgundy'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Wool+Beanie',
    isActive: true,
  },
  {
    name: 'Leather Belt',
    slug: 'leather-belt',
    description: 'Premium leather belt with polished buckle. A timeless accessory.',
    price: 54.99,
    category: 'accessories',
    variations: [
      {
        type: 'size',
        options: ['28', '30', '32', '34', '36', '38', '40'],
      },
      {
        type: 'color',
        options: ['Black', 'Brown', 'Tan'],
      },
    ],
    imageUrl: 'https://via.placeholder.com/400x500?text=Leather+Belt',
    isActive: true,
  },
]

/**
 * Function to seed Firestore with sample products
 * Run this once to populate your database
 */
export async function seedFirestore() {
  try {
    const { getProducts, createProduct } = await import('../services/productsService')
    const existingProducts = await getProducts()

    if (existingProducts.length > 0) {
      console.log('Products already exist in database, skipping seed')
      return
    }

    for (const product of seedProducts) {
      await createProduct(product)
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
