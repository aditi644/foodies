import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import Cart from './Cart';
import DishRating from '../../components/DishRating';
import FloatingActionButton from '../../components/FloatingActionButton';
import { SkeletonDishCard } from '../../components/SkeletonLoader';
import { theme } from '../../styles/theme';

const RestaurantDetail = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem, restaurantId: cartRestaurantId, getItemCount } = useCartStore();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRestaurant();
    fetchDishes();
  }, [restaurantId, user, navigate]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', restaurantId)
        .eq('role', 'restaurant')
        .single();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      toast.error('Failed to load restaurant');
      navigate('/customer/dashboard');
    }
  };

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      toast.error('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedDish) return;

    addItem(selectedDish, selectedVariant, quantity);
    toast.success('Added to cart!', {
      icon: '✅',
      style: {
        borderRadius: theme.borderRadius.lg,
        background: theme.colors.secondary,
        color: theme.colors.textInverse,
      },
    });
    setSelectedDish(null);
    setSelectedVariant(null);
    setQuantity(1);
  };

  const openDishModal = (dish) => {
    setSelectedDish(dish);
    setSelectedVariant(null);
    setQuantity(1);
  };

  // Group dishes by category
  const dishesByCategory = dishes.reduce((acc, dish) => {
    const category = dish.category || 'All Dishes';
    if (!acc[category]) acc[category] = [];
    acc[category].push(dish);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/customer/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <button onClick={() => setShowCart(true)} style={styles.cartButton}>
          🛒 Cart ({getItemCount()})
        </button>
      </div>

      {restaurant && (
        <div style={styles.restaurantInfo}>
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.restaurant_name}
              style={styles.restaurantImage}
            />
          )}
          <div style={styles.restaurantContent}>
            <h1 style={styles.restaurantName}>{restaurant.restaurant_name}</h1>
            <div style={styles.restaurantMeta}>
              <span style={styles.cuisineBadge}>{restaurant.cuisine_type}</span>
              <span style={styles.address}>📍 {restaurant.address}</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.dishesSection}>
        {loading ? (
          <div style={styles.dishesGrid}>
            {[...Array(6)].map((_, i) => (
              <SkeletonDishCard key={i} />
            ))}
          </div>
        ) : Object.keys(dishesByCategory).length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No dishes available</p>
          </div>
        ) : (
          Object.entries(dishesByCategory).map(([category, categoryDishes]) => (
            <div key={category} style={styles.categorySection}>
              <div
                style={styles.categoryHeader}
                onClick={() => toggleCategory(category)}
              >
                <h2 style={styles.categoryTitle}>{category}</h2>
                <span style={styles.expandIcon}>
                  {expandedCategories[category] ? '▼' : '▶'}
                </span>
              </div>
              {expandedCategories[category] !== false && (
                <div style={styles.dishesGrid}>
                  {categoryDishes.map((dish) => (
                    <div
                      key={dish.id}
                      style={styles.dishCard}
                      onClick={() => openDishModal(dish)}
                      className="dish-card"
                    >
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
                        <DishRating dishId={dish.id} />
                        <div style={styles.dishFooter}>
                          <p style={styles.dishPrice}>${dish.price.toFixed(2)}</p>
                          {dish.variants && dish.variants.length > 0 && (
                            <span style={styles.variantsBadge}>
                              {dish.variants.length} variants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedDish && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDish(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedDish.name}</h2>
              <button
                onClick={() => setSelectedDish(null)}
                style={styles.modalClose}
              >
                ×
              </button>
            </div>
            <p style={styles.modalDescription}>{selectedDish.description}</p>

            {selectedDish.variants && selectedDish.variants.length > 0 && (
              <div style={styles.variantsSection}>
                <h3 style={styles.variantsTitle}>Select Variant:</h3>
                {selectedDish.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.variantOption,
                      ...(selectedVariant?.name === variant.name ? styles.variantSelected : {}),
                    }}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <span>{variant.name}</span>
                    <span style={styles.variantPrice}>
                      +${variant.price_modifier || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.quantitySection}>
              <label style={styles.quantityLabel}>Quantity:</label>
              <div style={styles.quantityControls}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityButton}
                >
                  −
                </button>
                <span style={styles.quantityValue}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={styles.quantityButton}
                >
                  +
                </button>
              </div>
            </div>

            <div style={styles.modalActions}>
              <p style={styles.totalPrice}>
                Total: $
                {(
                  (selectedDish.price + (selectedVariant?.price_modifier || 0)) *
                  quantity
                ).toFixed(2)}
              </p>
              <button onClick={handleAddToCart} style={styles.addButton}>
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedDish(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCart && <Cart onClose={() => setShowCart(false)} />}
      
      <FloatingActionButton
        icon="🛒"
        label="Cart"
        onClick={() => setShowCart(true)}
        count={getItemCount()}
        color={theme.colors.primary}
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.surfaceSecondary,
    paddingBottom: '100px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadows.sm,
  },
  backButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
  },
  cartButton: {
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
  restaurantInfo: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    boxShadow: theme.shadows.card,
  },
  restaurantImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },
  restaurantContent: {
    padding: theme.spacing.xl,
  },
  restaurantName: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.heading,
  },
  restaurantMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  cuisineBadge: {
    display: 'inline-block',
    backgroundColor: theme.colors.secondary,
    color: theme.colors.textInverse,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semiBold,
    fontFamily: theme.fonts.secondary,
    width: 'fit-content',
  },
  address: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  dishesSection: {
    padding: `0 ${theme.spacing.lg}`,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    cursor: 'pointer',
    transition: theme.transitions.normal,
  },
  categoryTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  expandIcon: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  dishesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing.lg,
  },
  dishCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  dishImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  dishInfo: {
    padding: theme.spacing.lg,
  },
  dishName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.heading,
  },
  dishDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.primary,
    lineHeight: 1.5,
  },
  dishFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  dishPrice: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    margin: 0,
    fontFamily: theme.fonts.heading,
  },
  variantsBadge: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    backgroundColor: theme.colors.surfaceSecondary,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing['3xl'],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
  emptyText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 28, 28, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(5px)',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: theme.shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: theme.fontSizes['3xl'],
    cursor: 'pointer',
    color: theme.colors.textSecondary,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    transition: theme.transitions.normal,
  },
  modalDescription: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.primary,
  },
  variantsSection: {
    marginTop: theme.spacing.lg,
  },
  variantsTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.heading,
  },
  variantOption: {
    padding: theme.spacing.md,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.primary,
  },
  variantSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  variantPrice: {
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.primary,
  },
  quantitySection: {
    marginTop: theme.spacing.lg,
  },
  quantityLabel: {
    display: 'block',
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
    justifyContent: 'center',
  },
  quantityButton: {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.full,
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    cursor: 'pointer',
    transition: theme.transitions.normal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    minWidth: '40px',
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  modalActions: {
    marginTop: theme.spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  totalPrice: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
    margin: 0,
  },
  addButton: {
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
  },
  cancelButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
    fontFamily: theme.fonts.primary,
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .dish-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(226, 55, 68, 0.2);
  }
  
  .dish-card:hover img {
    transform: scale(1.1);
  }
  
  .quantity-button:hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.textInverse};
    border-color: ${theme.colors.primary};
    transform: scale(1.1);
  }
  
  .add-button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(226, 55, 68, 0.3);
  }
`;
if (!document.getElementById('dish-card-styles')) {
  styleSheet.id = 'dish-card-styles';
  document.head.appendChild(styleSheet);
}

export default RestaurantDetail;
