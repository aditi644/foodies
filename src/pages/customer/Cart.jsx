import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { theme } from '../../styles/theme';

const Cart = ({ onClose }) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/customer/checkout');
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.cart} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Shopping Cart</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.items}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🛒</span>
              <p style={styles.emptyText}>Your cart is empty</p>
              <p style={styles.emptySubtext}>Add delicious dishes to get started!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={styles.item} className="cart-item">
                {item.image && (
                  <img src={item.image} alt={item.dishName} style={styles.itemImage} />
                )}
                <div style={styles.itemInfo}>
                  <h4 style={styles.itemName}>{item.dishName}</h4>
                  {item.variant && (
                    <p style={styles.variant}>Variant: {item.variant}</p>
                  )}
                  <p style={styles.itemPrice}>${item.price.toFixed(2)} each</p>
                </div>
                <div style={styles.itemControls}>
                  <div style={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={styles.quantityButton}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={styles.quantityButton}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
                <div style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.total}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalAmount}>${getTotal().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} style={styles.checkoutButton}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 28, 28, 0.7)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 2000,
    backdropFilter: 'blur(5px)',
  },
  cart: {
    width: '420px',
    maxWidth: '90vw',
    height: '100%',
    backgroundColor: theme.colors.surface,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows.xl,
    animation: 'slideIn 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottom: `2px solid ${theme.colors.borderLight}`,
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: theme.fontSizes['3xl'],
    cursor: 'pointer',
    color: theme.colors.textInverse,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    transition: theme.transitions.normal,
  },
  items: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing.lg,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['3xl'],
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: theme.spacing.md,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.heading,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  item: {
    display: 'flex',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    transition: theme.transitions.normal,
  },
  itemImage: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.md,
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.heading,
  },
  variant: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.primary,
  },
  itemPrice: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    margin: 0,
    fontFamily: theme.fonts.primary,
  },
  itemControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    borderRadius: theme.borderRadius.full,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    cursor: 'pointer',
    transition: theme.transitions.normal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.textPrimary,
  },
  quantity: {
    minWidth: '30px',
    textAlign: 'center',
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
  },
  removeButton: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: theme.colors.error,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semiBold,
    transition: theme.transitions.normal,
  },
  itemTotal: {
    textAlign: 'right',
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.heading,
    minWidth: '60px',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTop: `2px solid ${theme.colors.borderLight}`,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  totalLabel: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
  },
  totalAmount: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },
  checkoutButton: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    fontFamily: theme.fonts.heading,
    transition: theme.transitions.bounce,
    boxShadow: theme.shadows.md,
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .cart-item:hover {
    background-color: ${theme.colors.surfaceSecondary};
  }
  
  .quantity-btn:hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.textInverse};
    border-color: ${theme.colors.primary};
    transform: scale(1.1);
  }
  
  .checkout-button:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 35px rgba(226, 55, 68, 0.4);
  }
`;
if (!document.getElementById('cart-styles')) {
  styleSheet.id = 'cart-styles';
  document.head.appendChild(styleSheet);
}

export default Cart;
