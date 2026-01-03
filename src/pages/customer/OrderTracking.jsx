import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import GoogleMapWrapper from '../../components/GoogleMapWrapper';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
    fetchStatusHistory();
    
    // Set up real-time subscription for order updates
    const orderSubscription = supabase
      .channel(`order:${orderId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new);
          fetchStatusHistory();
          if (payload.new.delivery_id) {
            fetchDeliveryLocation(payload.new.delivery_id);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for delivery location
    if (order?.delivery_id) {
      const locationSubscription = supabase
        .channel(`delivery_location:${order.delivery_id}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'delivery_locations', filter: `delivery_id=eq.${order.delivery_id}` },
          (payload) => {
            setDeliveryLocation({
              lat: parseFloat(payload.new.latitude),
              lng: parseFloat(payload.new.longitude),
            });
          }
        )
        .subscribe();

      return () => {
        orderSubscription.unsubscribe();
        locationSubscription.unsubscribe();
      };
    }

    return () => {
      orderSubscription.unsubscribe();
    };
  }, [orderId, user, navigate, order?.delivery_id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:profiles!orders_restaurant_id_fkey(*),
          order_items(*, dish:dishes(*))
        `)
        .eq('id', orderId)
        .eq('customer_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data);
      
      if (data.delivery_id) {
        fetchDeliveryLocation(data.delivery_id);
      }
      
      if (data.estimated_delivery_time) {
        setEstimatedTime(new Date(data.estimated_delivery_time));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  const fetchDeliveryLocation = async (deliveryId) => {
    try {
      const { data, error } = await supabase
        .from('delivery_locations')
        .select('latitude, longitude, updated_at')
        .eq('delivery_id', deliveryId)
        .single();

      if (error) throw error;
      
      if (data) {
        setDeliveryLocation({
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
        });
        
        // Poll for location updates every 10 seconds
        const locationInterval = setInterval(async () => {
          const { data: updated } = await supabase
            .from('delivery_locations')
            .select('latitude, longitude')
            .eq('delivery_id', deliveryId)
            .single();
          
          if (updated) {
            setDeliveryLocation({
              lat: parseFloat(updated.latitude),
              lng: parseFloat(updated.longitude),
            });
          }
        }, 10000);

        return () => clearInterval(locationInterval);
      }
    } catch (error) {
      console.error('Error fetching delivery location:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Order Placed', icon: '📝', color: '#ffc107' },
      confirmed: { label: 'Confirmed', icon: '✅', color: '#17a2b8' },
      preparing: { label: 'Preparing', icon: '👨‍🍳', color: '#007bff' },
      ready: { label: 'Ready', icon: '🍽️', color: '#28a745' },
      assigned: { label: 'Assigned to Delivery', icon: '🚚', color: '#6c757d' },
      out_for_delivery: { label: 'Out for Delivery', icon: '🚛', color: '#ff9800' },
      completed: { label: 'Delivered', icon: '🎉', color: '#28a745' },
      rejected: { label: 'Rejected', icon: '❌', color: '#dc3545' },
    };
    return statusMap[status] || { label: status, icon: '📦', color: '#999' };
  };

  const calculateTimeRemaining = () => {
    if (!estimatedTime) return null;
    const now = new Date();
    const diff = estimatedTime - now;
    if (diff <= 0) return 'Delivered';
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStatusInfo = getStatusInfo(order.status);
  const center = deliveryLocation || { lat: 0, lng: 0 };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/customer/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Order Tracking</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.orderInfo}>
          <div style={styles.orderHeader}>
            <h2>Order #{order.id.slice(0, 8)}</h2>
            <div style={{ ...styles.statusBadge, backgroundColor: currentStatusInfo.color }}>
              {currentStatusInfo.icon} {currentStatusInfo.label}
            </div>
          </div>

          {estimatedTime && order.status !== 'completed' && (
            <div style={styles.eta}>
              <strong>Estimated Delivery:</strong> {calculateTimeRemaining()}
              <br />
              <small>{estimatedTime.toLocaleString()}</small>
            </div>
          )}

          <div style={styles.itemsSection}>
            <h3>Order Items</h3>
            {order.order_items?.map((item, idx) => (
              <div key={idx} style={styles.orderItem}>
                <span>{item.quantity}x {item.dish?.name || 'Item'}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={styles.total}>
              <strong>Total: ${order.total_amount?.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div style={styles.timelineSection}>
          <h3>Order Timeline</h3>
          <div style={styles.timeline}>
            {statusHistory.map((history, index) => {
              const statusInfo = getStatusInfo(history.status);
              const isLast = index === statusHistory.length - 1;
              return (
                <div key={history.id} style={styles.timelineItem}>
                  <div style={styles.timelineMarker}>
                    <div style={{ ...styles.markerDot, backgroundColor: statusInfo.color }} />
                    {!isLast && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineStatus}>
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                    <div style={styles.timelineTime}>
                      {new Date(history.created_at).toLocaleString()}
                    </div>
                    {history.notes && (
                      <div style={styles.timelineNotes}>{history.notes}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {deliveryLocation && order.status === 'out_for_delivery' && (
          <div style={styles.mapSection}>
            <h3>Live Delivery Tracking</h3>
            <GoogleMapWrapper
              center={center}
              zoom={15}
              markers={[
                {
                  position: deliveryLocation,
                  label: '🚚',
                  title: 'Delivery Partner',
                },
              ]}
              mapContainerStyle={mapContainerStyle}
            />
            <p style={styles.mapNote}>
              📍 Delivery partner location updates every 10 seconds
            </p>
          </div>
        )}

        {order.status === 'completed' && (
          <div style={styles.completedSection}>
            <h3>🎉 Order Delivered!</h3>
            <button
              onClick={() => navigate(`/customer/rate-order/${orderId}`)}
              style={styles.rateButton}
            >
              Rate & Review Dishes
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
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderInfo: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  statusBadge: {
    padding: '10px 20px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  eta: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '16px',
  },
  itemsSection: {
    marginTop: '20px',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  total: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '2px solid #e0e0e0',
    textAlign: 'right',
    fontSize: '18px',
    color: '#ff4757',
  },
  timelineSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  timeline: {
    marginTop: '20px',
  },
  timelineItem: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  timelineMarker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  markerDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '3px solid white',
    boxShadow: '0 0 0 2px #e0e0e0',
  },
  timelineLine: {
    width: '2px',
    height: '40px',
    backgroundColor: '#e0e0e0',
    marginTop: '5px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  timelineTime: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  timelineNotes: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
  },
  mapSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  mapNote: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  completedSection: {
    backgroundColor: '#d4edda',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  rateButton: {
    marginTop: '15px',
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

export default OrderTracking;

