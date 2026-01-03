import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/useCartStore';
import RestaurantCard from './RestaurantCard';
import Cart from './Cart';
import FloatingActionButton from '../../components/FloatingActionButton';
import { SkeletonRestaurantCard } from '../../components/SkeletonLoader';
import { theme } from '../../styles/theme';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [restaurants, setRestaurants] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { id: 'late-night', label: '🌙 Late Night', icon: '🌙' },
    { id: 'healthy', label: '🥗 Healthy Lunch', icon: '🥗' },
    { id: 'comfort', label: '🍕 Comfort Food', icon: '🍕' },
    { id: 'quick', label: '⚡ Quick Bite', icon: '⚡' },
    { id: 'dessert', label: '🍰 Sweet Treat', icon: '🍰' },
  ];

  useEffect(() => {
    if (!user || user.user_metadata?.role !== 'customer') {
      navigate('/');
      return;
    }
    fetchRestaurants();
  }, [user, navigate]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, restaurant_name, cuisine_type, address, city, image_url, latitude, longitude')
        .eq('role', 'restaurant')
        .not('restaurant_name', 'is', null);

      if (error) {
        console.error('Supabase error:', error);
        if (error.message?.includes('policy') || error.code === 'PGRST301') {
          toast.error('Permission denied. Please check Supabase RLS policies.');
        }
        throw error;
      }
      
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error(error.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mood-based filtering (simplified - in production, add mood tags to restaurants)
    if (selectedMood) {
      // This is a placeholder - you'd add mood tags to restaurant data
      return matchesSearch;
    }
    
    return matchesSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>FoodHub</h1>
          <p style={styles.subtitle}>Discover amazing food near you</p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate('/customer/orders')}
            style={styles.headerButton}
          >
            📦 Orders
          </button>
          <button onClick={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search restaurants or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.moodFilters}>
          <p style={styles.moodLabel}>Mood:</p>
          <div style={styles.moodButtons}>
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                style={{
                  ...styles.moodButton,
                  ...(selectedMood === mood.id ? styles.moodButtonActive : {}),
                }}
              >
                {mood.icon} {mood.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.restaurantsGrid}>
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <SkeletonRestaurantCard key={i} />
            ))}
          </>
        ) : filteredRestaurants.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No restaurants found</p>
            <p style={styles.emptySubtext}>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.user_id}
              restaurant={restaurant}
              onClick={() => navigate(`/customer/restaurant/${restaurant.user_id}`)}
            />
          ))
        )}
      </div>

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
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    padding: theme.spacing.xl,
    color: theme.colors.textInverse,
    boxShadow: theme.shadows.lg,
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.heading,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: theme.fonts.secondary,
  },
  headerActions: {
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  headerButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.semiBold,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
    backdropFilter: 'blur(10px)',
  },
  signOutButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.semiBold,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
    backdropFilter: 'blur(10px)',
  },
  searchSection: {
    padding: `0 ${theme.spacing.lg}`,
    marginBottom: theme.spacing.xl,
  },
  searchBar: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  searchIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 48px`,
    borderRadius: theme.borderRadius.full,
    border: `2px solid ${theme.colors.border}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.primary,
    backgroundColor: theme.colors.surface,
    transition: theme.transitions.normal,
  },
  moodFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  moodLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.secondary,
  },
  moodButtons: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  moodButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.fontSizes.sm,
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.secondary,
  },
  moodButtonActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    borderColor: theme.colors.primary,
    transform: 'scale(1.05)',
  },
  restaurantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: theme.spacing.lg,
    padding: `0 ${theme.spacing.lg}`,
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: theme.spacing['3xl'],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.md,
  },
  emptyText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
};

export default CustomerDashboard;
