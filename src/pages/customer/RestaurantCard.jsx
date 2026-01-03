import React from 'react';
import { theme } from '../../styles/theme';

const RestaurantCard = ({ restaurant, onClick }) => {
  return (
    <div 
      style={styles.card} 
      onClick={onClick}
      className="restaurant-card"
    >
      <div style={styles.imageContainer}>
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.restaurant_name}
            style={styles.image}
          />
        ) : (
          <div style={styles.placeholderImage}>
            <span style={styles.placeholderIcon}>🍽️</span>
          </div>
        )}
        {restaurant.cuisine_type && (
          <div style={styles.cuisineBadge}>
            {restaurant.cuisine_type}
          </div>
        )}
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{restaurant.restaurant_name || 'Restaurant'}</h3>
        <div style={styles.details}>
          <p style={styles.address}>
            📍 {restaurant.address || restaurant.city || 'Location not available'}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    boxShadow: theme.shadows.card,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  imageContainer: {
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceTertiary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTertiary,
  },
  placeholderIcon: {
    fontSize: '64px',
    opacity: 0.3,
  },
  cuisineBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.textInverse,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semiBold,
    fontFamily: theme.fonts.secondary,
    boxShadow: theme.shadows.md,
  },
  info: {
    padding: theme.spacing.lg,
  },
  name: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.heading,
    lineHeight: 1.3,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  address: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    margin: 0,
    fontFamily: theme.fonts.primary,
    lineHeight: 1.5,
  },
};

// Add hover effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .restaurant-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(226, 55, 68, 0.15);
  }
  
  .restaurant-card:hover img {
    transform: scale(1.1);
  }
  
  .restaurant-card:active {
    transform: translateY(-4px);
  }
`;
if (!document.getElementById('restaurant-card-styles')) {
  styleSheet.id = 'restaurant-card-styles';
  document.head.appendChild(styleSheet);
}

export default RestaurantCard;
