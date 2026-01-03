import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const DishRating = ({ dishId }) => {
  const [averageRating, setAverageRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [dishId]);

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .from('dish_ratings')
        .select('rating')
        .eq('dish_id', dishId);

      if (error) throw error;

      if (data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / data.length;
        setAverageRating(avg);
        setRatingCount(data.length);
      } else {
        setAverageRating(null);
        setRatingCount(0);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span style={styles.loading}>...</span>;
  }

  if (!averageRating) {
    return <span style={styles.noRating}>No ratings yet</span>;
  }

  const stars = Math.round(averageRating);
  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;

  return (
    <div style={styles.container}>
      <div style={styles.rating}>
        <span style={styles.ratingValue}>{averageRating.toFixed(1)}</span>
        <span style={styles.ratingMax}>/10</span>
        <div style={styles.stars}>
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              style={{
                ...styles.star,
                color: i < fullStars ? '#ffc107' : i === fullStars && hasHalfStar ? '#ffc107' : '#e0e0e0',
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <span style={styles.count}>({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  ratingValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ff4757',
  },
  ratingMax: {
    fontSize: '14px',
    color: '#999',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  star: {
    fontSize: '14px',
  },
  count: {
    fontSize: '12px',
    color: '#666',
  },
  loading: {
    fontSize: '12px',
    color: '#999',
  },
  noRating: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default DishRating;

