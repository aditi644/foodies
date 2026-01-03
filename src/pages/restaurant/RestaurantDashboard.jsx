import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import DishForm from './DishForm';
import OrderList from './OrderList';
import { theme } from '../../styles/theme';
import { SkeletonCard } from '../../components/SkeletonLoader';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dishes');
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.user_metadata?.role !== 'restaurant') {
      navigate('/');
      return;
    }
    fetchDishes();
    fetchOrders();
  }, [user, navigate]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, dish:dishes(*))')
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)
        .eq('restaurant_id', user.id);

      if (error) throw error;
      toast.success('Dish deleted successfully');
      fetchDishes();
    } catch (error) {
      toast.error('Failed to delete dish');
    }
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setShowDishForm(true);
  };

  const handleDishFormClose = () => {
    setShowDishForm(false);
    setEditingDish(null);
    fetchDishes();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Restaurant Dashboard</h1>
          <p style={styles.subtitle}>Manage your menu and orders</p>
        </div>
        <button onClick={handleSignOut} style={styles.signOutButton}>
          Sign Out
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'dishes' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('dishes')}
        >
          🍽️ My Dishes
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'orders' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'dishes' && (
        <div style={styles.content}>
          <div style={styles.headerRow}>
            <h2 style={styles.sectionTitle}>Dishes</h2>
            <button
              onClick={() => setShowDishForm(true)}
              style={styles.addButton}
              className="add-button"
            >
              + Add New Dish
            </button>
          </div>

          {loading ? (
            <div style={styles.dishGrid}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : dishes.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🍽️</span>
              <p style={styles.emptyText}>No dishes yet. Add your first dish!</p>
            </div>
          ) : (
            <div style={styles.dishGrid}>
              {dishes.map((dish) => (
                <div key={dish.id} style={styles.dishCard} className="dish-card">
                  {dish.image_url && (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      style={styles.dishImage}
                    />
                  )}
                  <div style={styles.dishInfo}>
                    <h3 style={styles.dishName}>{dish.name}</h3>
                    <p style={styles.dishDescription}>{dish.description}</p>
                    <div style={styles.dishMeta}>
                      <p style={styles.dishPrice}>${dish.price.toFixed(2)}</p>
                      {dish.variants && dish.variants.length > 0 && (
                        <span style={styles.variantsBadge}>
                          {dish.variants.length} variant{dish.variants.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={styles.dishActions}>
                      <button
                        onClick={() => handleEditDish(dish)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Orders</h2>
          <OrderList orders={orders} onUpdate={fetchOrders} />
        </div>
      )}

      {showDishForm && (
        <DishForm
          dish={editingDish}
          onClose={handleDishFormClose}
          restaurantId={user.id}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.card,
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.heading,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  signOutButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.semiBold,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
  },
  tabs: {
    display: 'flex',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    backgroundColor: theme.colors.surface,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textSecondary,
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.heading,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    boxShadow: theme.shadows.md,
  },
  content: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.card,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  addButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.extraBold,
    fontSize: theme.fontSizes.base,
    transition: theme.transitions.bounce,
    fontFamily: theme.fonts.heading,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing['3xl'],
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: theme.spacing.md,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  dishGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing.lg,
  },
  dishCard: {
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    transition: theme.transitions.normal,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadows.sm,
  },
  dishImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  dishInfo: {
    padding: theme.spacing.lg,
  },
  dishName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.heading,
  },
  dishDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.primary,
    lineHeight: 1.5,
  },
  dishMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dishPrice: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  variantsBadge: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    backgroundColor: theme.colors.surfaceSecondary,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontFamily: theme.fonts.primary,
  },
  dishActions: {
    display: 'flex',
    gap: theme.spacing.sm,
  },
  editButton: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.info,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.semiBold,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.primary,
  },
  deleteButton: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.semiBold,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.primary,
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .dish-card:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
  }
  
  .dish-card:hover img {
    transform: scale(1.1);
  }
  
  .add-button:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }
`;
if (!document.getElementById('restaurant-dashboard-styles')) {
  styleSheet.id = 'restaurant-dashboard-styles';
  document.head.appendChild(styleSheet);
}

export default RestaurantDashboard;
