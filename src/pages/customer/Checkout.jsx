import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { theme } from '../../styles/theme';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, restaurantId, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/customer/dashboard');
    }
  }, [items, navigate]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('address')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setDeliveryAddress(data.address || '');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    if (user) {
      fetchAddress();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_id: user.id,
        restaurant_id: restaurantId,
        delivery_address: deliveryAddress,
        total_amount: getTotal(),
        status: 'ready',
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        dish_id: item.dishId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Order placed successfully! (Free for testing)', {
        icon: '✅',
        style: {
          borderRadius: theme.borderRadius.lg,
          background: theme.colors.secondary,
          color: theme.colors.textInverse,
        },
      });
      clearCart();
      navigate(`/customer/order/${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/customer/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Checkout</h1>
      </div>

      <div style={styles.testModeBanner}>
        🧪 <strong>TEST MODE:</strong> Orders are FREE for testing purposes
      </div>

      <div style={styles.content}>
        <div style={styles.orderSummary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} style={styles.summaryItem}>
                <div style={styles.itemDetails}>
                  <span style={styles.itemName}>
                    {item.quantity}x {item.dishName}
                    {item.variant && ` (${item.variant})`}
                  </span>
                </div>
                <span style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={styles.summaryTotal}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalAmount}>${getTotal().toFixed(2)}</span>
            <p style={styles.freeNotice}>FREE for testing</p>
          </div>
        </div>

        <div style={styles.paymentSection}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Delivery Address *</h3>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                rows="4"
                style={styles.input}
                placeholder="Enter your delivery address"
              />
            </div>

            <div style={styles.totalSection}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalValue}>${getTotal().toFixed(2)}</span>
              </div>
              <p style={styles.freeNotice}>No payment required (Test Mode)</p>
            </div>

            <button
              type="submit"
              disabled={loading || !deliveryAddress.trim()}
              style={styles.submitButton}
              className="checkout-submit"
            >
              {loading ? 'Placing Order...' : `Place Order (FREE)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    margin: 0,
    fontFamily: theme.fonts.heading,
  },
  testModeBanner: {
    backgroundColor: '#FFF3CD',
    border: `2px solid ${theme.colors.warning}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: '#856404',
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.medium,
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: theme.spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  orderSummary: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    height: 'fit-content',
    boxShadow: theme.shadows.card,
    position: 'sticky',
    top: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.heading,
  },
  itemsList: {
    marginBottom: theme.spacing.lg,
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${theme.spacing.sm} 0`,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  itemDetails: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.fontWeights.medium,
  },
  itemPrice: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    whiteSpace: 'nowrap',
  },
  summaryTotal: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTop: `2px solid ${theme.colors.border}`,
  },
  totalLabel: {
    fontSize: theme.fontSizes.lg,
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
  freeNotice: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeights.bold,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.secondary,
  },
  paymentSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.card,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.heading,
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.border}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.primary,
    boxSizing: 'border-box',
    marginTop: theme.spacing.sm,
    resize: 'vertical',
    transition: theme.transitions.normal,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
  },
  totalSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.lg,
    textAlign: 'right',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  totalValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },
  submitButton: {
    width: '100%',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    fontFamily: theme.fonts.heading,
    transition: theme.transitions.bounce,
    boxShadow: theme.shadows.md,
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .checkout-submit:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 15px 40px rgba(39, 174, 96, 0.4);
  }
  
  .checkout-submit:active:not(:disabled) {
    transform: translateY(-2px) scale(1);
  }
  
  textarea:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(226, 55, 68, 0.1);
  }
`;
if (!document.getElementById('checkout-styles')) {
  styleSheet.id = 'checkout-styles';
  document.head.appendChild(styleSheet);
}

export default Checkout;
