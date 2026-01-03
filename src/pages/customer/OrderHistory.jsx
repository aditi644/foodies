import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:profiles!orders_restaurant_id_fkey(restaurant_name),
          order_items(*, dish:dishes(*))
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#007bff',
      ready: '#28a745',
      assigned: '#6c757d',
      out_for_delivery: '#ff9800',
      completed: '#28a745',
      rejected: '#dc3545',
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/customer/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>My Orders</h1>
      </div>

      <div style={styles.ordersList}>
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No orders yet</p>
            <button
              onClick={() => navigate('/customer/dashboard')}
              style={styles.browseButton}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h3>Order #{order.id.slice(0, 8)}</h3>
                  <p style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p style={styles.restaurantName}>
                    {order.restaurant?.restaurant_name || 'Restaurant'}
                  </p>
                </div>
                <div style={styles.orderStatus}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div style={styles.orderItems}>
                {order.order_items?.slice(0, 3).map((item, idx) => (
                  <span key={idx} style={styles.itemTag}>
                    {item.quantity}x {item.dish?.name || 'Item'}
                  </span>
                ))}
                {order.order_items?.length > 3 && (
                  <span style={styles.itemTag}>+{order.order_items.length - 3} more</span>
                )}
              </div>

              <div style={styles.orderFooter}>
                <div style={styles.total}>
                  <strong>${order.total_amount?.toFixed(2)}</strong>
                </div>
                <div style={styles.actions}>
                  <button
                    onClick={() => navigate(`/customer/order/${order.id}`)}
                    style={styles.trackButton}
                  >
                    Track Order
                  </button>
                  {order.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/customer/rate-order/${order.id}`)}
                      style={styles.rateButton}
                    >
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
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
  ordersList: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  orderDate: {
    color: '#666',
    fontSize: '14px',
    margin: '5px 0',
  },
  restaurantName: {
    color: '#ff4757',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  orderStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  statusBadge: {
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '15px',
  },
  itemTag: {
    backgroundColor: '#f0f0f0',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    color: '#666',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0',
  },
  total: {
    fontSize: '18px',
    color: '#ff4757',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  trackButton: {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  rateButton: {
    padding: '8px 15px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
  },
  browseButton: {
    marginTop: '20px',
    padding: '12px 30px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default OrderHistory;

