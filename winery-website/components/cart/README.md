# Shopping Cart Components

This directory contains the shopping cart functionality for the wine e-commerce platform.

## Components

### CartContext
The main context provider that manages cart state globally.

**Features:**
- Add/remove/update items
- Persistent storage with localStorage
- Total calculation
- Item count tracking

**Usage:**
```tsx
import { CartProvider, useCart } from '../../context/CartContext';

// Wrap your app with CartProvider
<CartProvider>
  <App />
</CartProvider>

// Use cart in components
const { addItem, removeItem, items, total, itemCount } = useCart();
```

### Cart Component
Full cart page component with item management.

**Features:**
- Display all cart items
- Quantity adjustment
- Item removal
- Total calculation
- Empty cart state

**Usage:**
```tsx
import Cart from './Cart';

<Cart className="custom-cart" />
```

### CartIcon Component
Header cart icon with item count badge.

**Features:**
- SVG cart icon
- Item count badge
- Click handler support
- Accessibility compliant

**Usage:**
```tsx
import CartIcon from './CartIcon';

<CartIcon 
  onClick={() => setCartOpen(true)}
  showCount={true}
  className="header-cart"
/>
```

### MiniCart Component
Dropdown/sidebar mini cart for quick access.

**Features:**
- Slide-in animation
- Item preview
- Quick actions
- Responsive design

**Usage:**
```tsx
import MiniCart from './MiniCart';

<MiniCart 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onViewCart={() => navigate('/cart')}
/>
```

## Integration Example

See `examples/cartUsage.tsx` for a complete integration example.

## Key Features

1. **Persistent Storage**: Cart data is saved to localStorage
2. **Real-time Updates**: All components sync automatically
3. **Accessibility**: Full keyboard navigation and screen reader support
4. **Responsive**: Works on all device sizes
5. **Animations**: Smooth transitions and hover effects
6. **Error Handling**: Graceful handling of localStorage errors

## Testing

Unit tests are provided for all components:
- `test/context/CartContext.test.tsx`
- `test/components/cart/Cart.test.tsx`
- `test/components/cart/CartIcon.test.tsx`

Run tests with:
```bash
npm test -- --run test/context/CartContext.test.tsx
```