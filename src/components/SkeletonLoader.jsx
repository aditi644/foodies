import React from 'react';

export const SkeletonCard = () => {
  return (
    <div style={styles.card}>
      <div style={styles.image} className="skeleton" />
      <div style={styles.content}>
        <div style={styles.title} className="skeleton" />
        <div style={styles.subtitle} className="skeleton" />
        <div style={styles.price} className="skeleton" />
      </div>
    </div>
  );
};

export const SkeletonRestaurantCard = () => {
  return (
    <div style={styles.restaurantCard}>
      <div style={styles.restaurantImage} className="skeleton" />
      <div style={styles.restaurantContent}>
        <div style={styles.restaurantName} className="skeleton" />
        <div style={styles.restaurantCuisine} className="skeleton" />
        <div style={styles.restaurantAddress} className="skeleton" />
      </div>
    </div>
  );
};

export const SkeletonDishCard = () => {
  return (
    <div style={styles.dishCard}>
      <div style={styles.dishImage} className="skeleton" />
      <div style={styles.dishContent}>
        <div style={styles.dishName} className="skeleton" />
        <div style={styles.dishDescription} className="skeleton" />
        <div style={styles.dishPrice} className="skeleton" />
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(226, 55, 68, 0.08)',
  },
  image: {
    width: '100%',
    height: '200px',
  },
  content: {
    padding: '16px',
  },
  title: {
    height: '20px',
    width: '70%',
    marginBottom: '12px',
    borderRadius: '4px',
  },
  subtitle: {
    height: '16px',
    width: '90%',
    marginBottom: '8px',
    borderRadius: '4px',
  },
  price: {
    height: '18px',
    width: '40%',
    borderRadius: '4px',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(226, 55, 68, 0.08)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  restaurantImage: {
    width: '100%',
    height: '200px',
  },
  restaurantContent: {
    padding: '20px',
  },
  restaurantName: {
    height: '24px',
    width: '60%',
    marginBottom: '8px',
    borderRadius: '4px',
  },
  restaurantCuisine: {
    height: '18px',
    width: '40%',
    marginBottom: '8px',
    borderRadius: '4px',
  },
  restaurantAddress: {
    height: '16px',
    width: '80%',
    borderRadius: '4px',
  },
  dishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  },
  dishImage: {
    width: '100%',
    height: '180px',
  },
  dishContent: {
    padding: '16px',
  },
  dishName: {
    height: '20px',
    width: '70%',
    marginBottom: '8px',
    borderRadius: '4px',
  },
  dishDescription: {
    height: '16px',
    width: '100%',
    marginBottom: '8px',
    borderRadius: '4px',
  },
  dishPrice: {
    height: '20px',
    width: '50%',
    borderRadius: '4px',
  },
};

export default SkeletonCard;

