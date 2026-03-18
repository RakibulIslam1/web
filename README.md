# Gufram Clothing - Full-Stack React + Firebase App

A modern, full-stack e-commerce platform for a clothing brand inspired by the Gufram website interactions. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### Frontend
- **Floating Products Canvas**: Interactive 3D-like animation with products floating and zooming
- **Scroll-Controlled Zoom**: Scroll wheel controls animation speed instead of page scroll
- **Product Details Modal**: Click on products to see detailed information
- **Shopping Cart**: Add items with variations, manage quantities
- **Checkout Flow**: Simple checkout with shipping information
- **Order Tracking**: View past orders and status updates

### Backend & Data
- **Firebase Authentication**: Email/password sign-up and login
- **Firestore Database**: Cloud-hosted data with real-time capabilities
- **Firebase Storage**: Product image hosting
- **Role-Based Access**: Admin and customer roles

### Admin Panel
- **Product Management**: Create, edit, delete products with image uploads
- **Order Management**: View all orders and update status
- **Protected Routes**: Admin pages only accessible to authorized users

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Context API
- **Animations**: requestAnimationFrame + CSS

## Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrderConfirmationPage.tsx
│   ├── OrdersPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminProductsPage.tsx
│       ├── AdminProductFormPage.tsx
│       └── AdminOrdersPage.tsx
├── components/
│   ├── Navigation.tsx
│   ├── FloatingProductsCanvas.tsx
│   └── ProductModal.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── services/
│   ├── authService.ts
│   ├── productsService.ts
│   ├── ordersService.ts
│   └── storageService.ts
├── types/
│   └── index.ts
├── data/
│   └── seedData.ts
├── firebase.ts
└── App.tsx
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project (create one at [firebase.google.com](https://firebase.google.com))

### Installation

1. **Clone the repository** (or download the code)
   ```bash
   cd "maisha's demand"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Create a Storage bucket
   - Copy your config and update `.env.local`:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Create Firestore collections**
   - Create collections in Firestore:
     - `users` (auto-created on first signup)
     - `products` (for product catalog)
     - `orders` (auto-created on first order)

5. **Start the development server**
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:5173`

### Seed Initial Data

To populate the database with sample products, uncomment the seed function call in `src/main.tsx` or run:

```typescript
import { seedFirestore } from './data/seedData'
seedFirestore()
```

## Admin Access

The email `rakibul.rir06@gmail.com` is configured as an admin user. Sign up with this email to access the admin panel at `/admin`.

### Admin Features
- View all products
- Create new products
- Edit products
- Delete products
- View all customer orders
- Update order status

## Key Components

### FloatingProductsCanvas
Renders floating product images with zoom animation controlled by scroll:
- Scroll up: slower zoom
- Scroll down: faster zoom
- Hover: Shows product name tooltip
- Click: Opens product detail modal

### ProductModal
Displays product details with:
- Product image
- Price and description
- Size/color variations
- Quantity selector
- Add to cart button

### CheckoutFlow
Simple checkout with shipping information collection and order creation.

## Data Models

### Product
```typescript
{
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  variations: Variation[]
  imageUrl: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Order
```typescript
{
  id: string
  userId: string
  userEmail: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed'
  shippingInfo: ShippingInfo
  createdAt: Date
  updatedAt: Date
}
```

## Customization

### Modify Animation Speed
Edit `src/components/FloatingProductsCanvas.tsx`:
```typescript
velocityZ: 0.015 + Math.random() * 0.01, // Adjust these values
```

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      dark: '#0a0a0a',      // Change background
      slate: '#1a1a1a',     // Change card background
    },
  },
}
```

### Add More Admin Users
Edit `src/services/authService.ts`:
```typescript
const ADMIN_EMAILS = ['rakibul.rir06@gmail.com', 'your@email.com']
```

## Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Inventory management
- [ ] Multi-language support

## Troubleshooting

### Products not appearing?
1. Check Firebase credentials in `.env.local`
2. Seed the database with sample products
3. Check Firestore rules allow reading from `products` collection

### Can't upload images?
1. Check Firebase Storage rules
2. Ensure Firebase Storage bucket is created
3. Check browser console for errors

### Admin panel not accessible?
1. Sign in with `rakibul.rir06@gmail.com`
2. Wait for auth state to update
3. Check browser console for errors

## Production Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## License

MIT

## Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.
