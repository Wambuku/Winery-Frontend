// Shopping cart component with item management and total calculation

import React from 'react';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../types';

interface CartProps {
  className?: string;
}

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (wineId: string, quantity: number) => void;
  onRemove: (wineId: string) => void;
}

function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemComponentProps) {
  const { wine, quantity } = item;
  const itemTotal = wine.price * quantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onUpdateQuantity(wine.id, newQuantity);
    }
  };

  const incrementQuantity = () => {
    onUpdateQuantity(wine.id, quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onUpdateQuantity(wine.id, quantity - 1);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={wine.image} alt={wine.name} />
      </div>
      
      <div className="cart-item-details">
        <h3 className="cart-item-name">{wine.name}</h3>
        <p className="cart-item-price">KSh {wine.price.toLocaleString()}</p>
        <p className="cart-item-vintage">{wine.vintage} • {wine.region}</p>
      </div>
      
      <div className="cart-item-quantity">
        <button 
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          className="quantity-btn"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
          className="quantity-input"
          aria-label="Item quantity"
        />
        <button 
          onClick={incrementQuantity}
          className="quantity-btn"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      
      <div className="cart-item-total">
        <p>KSh {itemTotal.toLocaleString()}</p>
      </div>
      
      <button 
        onClick={() => onRemove(wine.id)}
        className="remove-btn"
        aria-label={`Remove ${wine.name} from cart`}
      >
        ×
      </button>
    </div>
  );
}

export default function Cart({ className = '' }: CartProps) {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className={`cart empty-cart ${className}`}>
        <div className="empty-cart-content">
          <h2>Your cart is empty</h2>
          <p>Add some wines to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cart ${className}`}>
      <div className="cart-header">
        <h2>Shopping Cart ({itemCount} items)</h2>
        <button 
          onClick={clearCart}
          className="clear-cart-btn"
          aria-label="Clear entire cart"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="cart-items">
        {items.map((item) => (
          <CartItemComponent
            key={item.wine.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <h3>Total: KSh {total.toLocaleString()}</h3>
        </div>
        
        <div className="cart-actions">
          <button className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .cart {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .empty-cart {
          text-align: center;
          padding: 60px 20px;
        }
        
        .empty-cart-content h2 {
          color: #666;
          margin-bottom: 10px;
        }
        
        .empty-cart-content p {
          color: #999;
        }
        
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #eee;
        }
        
        .cart-header h2 {
          margin: 0;
          color: #333;
        }
        
        .clear-cart-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .clear-cart-btn:hover {
          background: #c82333;
        }
        
        .cart-items {
          margin-bottom: 30px;
        }
        
        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto auto auto;
          gap: 15px;
          align-items: center;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
          transition: box-shadow 0.2s;
        }
        
        .cart-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .cart-item-image img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .cart-item-details h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #333;
        }
        
        .cart-item-price {
          font-weight: bold;
          color: #8B0000;
          margin: 0 0 5px 0;
        }
        
        .cart-item-vintage {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .cart-item-quantity {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .quantity-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        
        .quantity-btn:hover:not(:disabled) {
          background: #f5f5f5;
        }
        
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity-input {
          width: 50px;
          height: 30px;
          text-align: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .cart-item-total {
          font-weight: bold;
          color: #333;
          text-align: right;
        }
        
        .remove-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: #dc3545;
          color: white;
          cursor: pointer;
          border-radius: 50%;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .remove-btn:hover {
          background: #c82333;
        }
        
        .cart-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .cart-total {
          text-align: right;
          margin-bottom: 20px;
        }
        
        .cart-total h3 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }
        
        .cart-actions {
          text-align: right;
        }
        
        .checkout-btn {
          background: #8B0000;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .checkout-btn:hover {
          background: #660000;
        }
        
        @media (max-width: 768px) {
          .cart {
            padding: 15px;
          }
          
          .cart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .cart-header h2 {
            font-size: 18px;
          }
          
          .cart-item {
            grid-template-columns: 80px 1fr auto;
            gap: 12px;
            padding: 15px;
          }
          
          .cart-item-details h3 {
            font-size: 15px;
          }
          
          .cart-item-quantity {
            grid-column: 1 / -1;
            justify-self: start;
            margin-top: 12px;
          }
          
          .cart-item-total {
            grid-column: 1 / -1;
            justify-self: center;
            margin-top: 8px;
            font-size: 16px;
          }
          
          .remove-btn {
            grid-row: 1;
            grid-column: 3;
            justify-self: end;
            align-self: start;
          }
          
          .quantity-btn {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
          
          .quantity-input {
            width: 60px;
            height: 36px;
            font-size: 16px;
          }
          
          .cart-summary {
            padding: 15px;
          }
          
          .cart-total h3 {
            font-size: 18px;
          }
          
          .checkout-btn {
            width: 100%;
            padding: 15px 30px;
            font-size: 18px;
          }
        }
        
        @media (max-width: 480px) {
          .cart {
            padding: 10px;
          }
          
          .cart-item {
            grid-template-columns: 60px 1fr auto;
            gap: 8px;
            padding: 12px;
          }
          
          .cart-item-image img {
            width: 60px;
            height: 60px;
          }
          
          .cart-item-details h3 {
            font-size: 14px;
          }
          
          .cart-item-price {
            font-size: 14px;
          }
          
          .cart-item-vintage {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}