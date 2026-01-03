import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';

const RateOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
    fetchExistingRatings();
  }, [orderId, user, navigate]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, dish:dishes(*))
        `)
        .eq('id', orderId)
        .eq('customer_id', user.id)
        .eq('status', 'completed')
        .single();

      if (error) throw error;
      setOrder(data);
      
      // Initialize ratings for each dish
      const initialRatings = {};
      data.order_items?.forEach((item) => {
        initialRatings[item.dish_id] = 5; // Default to 5
      });
      setRatings(initialRatings);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/customer/dashboard');
    }
  };

  const fetchExistingRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('dish_ratings')
        .select('*')
        .eq('order_id', orderId)
        .eq('customer_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const existingRatings = {};
        const existingReviews = {};
        data.forEach((rating) => {
          existingRatings[rating.dish_id] = rating.rating;
          existingReviews[rating.dish_id] = rating.review || '';
        });
        setRatings(existingRatings);
        setReviews(existingReviews);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRatingChange = (dishId, rating) => {
    setRatings({ ...ratings, [dishId]: rating });
  };

  const handleReviewChange = (dishId, review) => {
    setReviews({ ...reviews, [dishId]: review });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const ratingsToInsert = order.order_items.map((item) => ({
        dish_id: item.dish_id,
        order_id: orderId,
        customer_id: user.id,
        rating: ratings[item.dish_id] || 5,
        review: reviews[item.dish_id] || null,
      }));

      // Upsert ratings (update if exists, insert if not)
      const { error } = await supabase
        .from('dish_ratings')
        .upsert(ratingsToInsert, {
          onConflict: 'dish_id,order_id,customer_id',
        });

      if (error) throw error;

      toast.success('Thank you for your ratings and reviews!');
      setSubmitted(true);
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting ratings:', error);
      toast.error('Failed to submit ratings');
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/customer/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Rate Your Order</h1>
      </div>

      {submitted && (
        <div style={styles.successBanner}>
          ✅ You've already submitted your ratings! Thank you for your feedback.
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.orderInfo}>
          <h2>Order #{order.id.slice(0, 8)}</h2>
          <p style={styles.orderDate}>
            Delivered on {new Date(order.updated_at).toLocaleDateString()}
          </p>
        </div>

        <div style={styles.ratingsSection}>
          <h2>Rate Your Dishes</h2>
          <p style={styles.subtitle}>
            Help other customers by rating each dish (1-10 scale)
          </p>

          {order.order_items?.map((item) => (
            <div key={item.id} style={styles.dishRatingCard}>
              <div style={styles.dishHeader}>
                {item.dish?.image_url && (
                  <img
                    src={item.dish.image_url}
                    alt={item.dish.name}
                    style={styles.dishImage}
                  />
                )}
                <div style={styles.dishInfo}>
                  <h3>{item.dish?.name || 'Dish'}</h3>
                  <p style={styles.dishDescription}>{item.dish?.description}</p>
                  <p style={styles.quantity}>Quantity: {item.quantity}</p>
                </div>
              </div>

              <div style={styles.ratingSection}>
                <label style={styles.ratingLabel}>
                  Rating (1-10):
                  <span style={styles.ratingValue}>
                    {ratings[item.dish_id] || 5}/10
                  </span>
                </label>
                <div style={styles.ratingSlider}>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings[item.dish_id] || 5}
                    onChange={(e) => handleRatingChange(item.dish_id, parseInt(e.target.value))}
                    style={styles.slider}
                    disabled={submitted}
                  />
                  <div style={styles.ratingLabels}>
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <div style={styles.reviewSection}>
                <label style={styles.reviewLabel}>Review (Optional):</label>
                <textarea
                  value={reviews[item.dish_id] || ''}
                  onChange={(e) => handleReviewChange(item.dish_id, e.target.value)}
                  placeholder="Share your experience with this dish..."
                  rows="3"
                  style={styles.reviewInput}
                  disabled={submitted}
                />
              </div>
            </div>
          ))}
        </div>

        {!submitted && (
          <div style={styles.actions}>
            <button
              onClick={handleSubmit}
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ratings & Reviews'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  title: {
    color: '#ff4757',
    margin: 0,
  },
  successBanner: {
    backgroundColor: '#d4edda',
    border: '2px solid #28a745',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#155724',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  orderInfo: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  orderDate: {
    color: '#666',
    marginTop: '5px',
  },
  ratingsSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  dishRatingCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#f8f9fa',
  },
  dishHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  dishImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  dishInfo: {
    flex: 1,
  },
  dishDescription: {
    color: '#666',
    fontSize: '14px',
    margin: '5px 0',
  },
  quantity: {
    color: '#999',
    fontSize: '12px',
  },
  ratingSection: {
    marginBottom: '20px',
  },
  ratingLabel: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  ratingValue: {
    marginLeft: '10px',
    color: '#ff4757',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  ratingSlider: {
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '5px',
    outline: 'none',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  ratingLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
    fontSize: '12px',
    color: '#666',
  },
  reviewSection: {
    marginTop: '20px',
  },
  reviewLabel: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  reviewInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  actions: {
    marginTop: '30px',
    textAlign: 'center',
  },
  submitButton: {
    padding: '15px 40px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
  },
};

export default RateOrder;

