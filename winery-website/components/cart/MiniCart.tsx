// Mini cart component for dropdown/sidebar display with animations

import React from 'react';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../types';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart?: () => void;
  className?: string;
}

interface MiniCartItemProps {
  item: CartItem;
  onRemove: (wineId: string) => void;
}

function MiniCartItem({ item, onRemove }: MiniCartItemProps) {
  const { wine, quantity } = item;
  const itemTotal = wine.price * quantity;

  return (
    <div className="mini-cart-item">
      <div className="mini-item-image">
        <img src={wine.image} alt={wine.name} />
      </div>
      
      <div className="mini-item-details">
        <h4 className="mini-item-name">{wine.name}</h4>
        <p className="mini-item-info">
          {quantity} × KSh {wine.price.toLocaleString()}
        </p>
        <p className="mini-item-total">KSh {itemTotal.toLocaleString()}</p>
      </div>
      
      <button 
        onClick={() => onRemove(wine.id)}
        className="mini-remove-btn"
        aria-label={`Remove ${wine.name} from cart`}
      >
        ×
      </button>
    </div>
  );
}

export default function MiniCart({ isOpen, onClose, onViewCart, className = '' }: MiniCartProps) {
  const { items, total, itemCount, removeItem } = useCart();

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="mini-cart-backdrop" onClick={onClose} />
      
      {/* Mini Cart */}
      <div className={`mini-cart ${className}`}>
        <div className="mini-cart-header">
          <h3>Cart ({itemCount} items)</h3>
          <button 
            onClick={onClose}
            className="mini-cart-close"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        
        <div className="mini-cart-content">
          {items.length === 0 ? (
            <div className="mini-cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="mini-cart-items">
                {items.map((item) => (
                  <MiniCartItem
                    key={item.wine.id}
                    item={item}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              
              <div className="mini-cart-footer">
                <div className="mini-cart-total">
                  <strong>Total: KSh {total.toLocaleString()}</strong>
                </div>
                
                <div className="mini-cart-actions">
                  {onViewCart && (
                    <button 
                      onClick={onViewCart}
                      className="view-cart-btn"
                    >
                      View Cart
                    </button>
                  )}
                  <button className="mini-checkout-btn">
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .mini-cart-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.2s ease-out;
        }
        
        .mini-cart {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .mini-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }
        
        .mini-cart-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }
        
        .mini-cart-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        
        .mini-cart-close:hover {
          background: #e9ecef;
          color: #333;
        }
        
        .mini-cart-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .mini-cart-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-style: italic;
        }
        
        .mini-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
        }
        
        .mini-cart-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }
        
        .mini-cart-item:hover {
          background: #f8f9fa;
        }
        
        .mini-item-image img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .mini-item-details {
          flex: 1;
          min-width: 0;
        }
        
        .mini-item-name {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .mini-item-info {
          margin: 0 0 2px 0;
          font-size: 12px;
          color: #666;
        }
        
        .mini-item-total {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #8B0000;
        }
        
        .mini-remove-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }
        
        .mini-remove-btn:hover {
          background: #c82333;
        }
        
        .mini-cart-footer {
          border-top: 1px solid #eee;
          padding: 20px;
          background: #f8f9fa;
        }
        
        .mini-cart-total {
          text-align: center;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
        
        .mini-cart-actions {
          display: flex;
          gap: 10px;
        }
        
        .view-cart-btn {
          flex: 1;
          padding: 10px;
          border: 2px solid #8B0000;
          background: white;
          color: #8B0000;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .view-cart-btn:hover {
          background: #8B0000;
          color: white;
        }
        
        .mini-checkout-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: #8B0000;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        
        .mini-checkout-btn:hover {
          background: #660000;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .mini-cart {
            width: 100vw;
            right: 0;
          }
          
          .mini-cart-header {
            padding: 16px;
          }
          
          .mini-cart-header h3 {
            font-size: 16px;
          }
          
          .mini-cart-item {
            padding: 12px 16px;
          }
          
          .mini-item-image img {
            width: 45px;
            height: 45px;
          }
          
          .mini-cart-footer {
            padding: 16px;
          }
          
          .mini-cart-actions {
            flex-direction: column;
            gap: 8px;
          }
          
          .view-cart-btn,
          .mini-checkout-btn {
            padding: 12px;
            font-size: 16px;
            font-weight: 600;
          }
        }
        
        @media (max-width: 480px) {
          .mini-cart-header {
            padding: 12px;
          }
          
          .mini-cart-item {
            padding: 10px 12px;
          }
          
          .mini-cart-footer {
            padding: 12px;
          }
        }
        
        /* Scrollbar styling */
        .mini-cart-items::-webkit-scrollbar {
          width: 6px;
        }
        
        .mini-cart-items::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .mini-cart-items::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .mini-cart-items::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}