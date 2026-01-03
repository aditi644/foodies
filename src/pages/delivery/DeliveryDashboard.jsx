import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import GoogleMapWrapper from '../../components/GoogleMapWrapper';
import OrderDetails from './OrderDetails';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxDistance] = useState(10); // Maximum distance in km (10km radius)

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = currentLocation || { lat: 0, lng: 0 };

  useEffect(() => {
    if (!user || user.user_metadata?.role !== 'delivery') {
      navigate('/');
      return;
    }
    getCurrentLocation();
    
    // Update location every 30 seconds
    const locationInterval = setInterval(() => {
      updateDeliveryLocation();
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [user, navigate]);

  useEffect(() => {
    if (currentLocation) {
      fetchAvailableOrders();
      fetchMyOrders();
    }
  }, [currentLocation, user]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          updateDeliveryLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get your location. Please enable location access.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const updateDeliveryLocation = async (location = currentLocation) => {
    if (!location || !user) return;

    try {
      const { error } = await supabase
        .from('delivery_locations')
        .upsert({
          delivery_id: user.id,
          latitude: location.lat,
          longitude: location.lng,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'delivery_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchAvailableOrders = async () => {
    if (!currentLocation) return;

    try {
      // Fetch orders that are ready for delivery
      // Include 'ready', 'confirmed', and 'preparing' statuses for flexibility
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, dish:dishes(*))
        `)
        .in('status', ['ready', 'confirmed', 'preparing'])
        .is('delivery_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch restaurant locations for each order
      const ordersWithDistance = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            const { data: restaurantProfile } = await supabase
              .from('profiles')
              .select('latitude, longitude, restaurant_name, address')
              .eq('user_id', order.restaurant_id)
              .eq('role', 'restaurant')
              .single();

            if (restaurantProfile?.latitude && restaurantProfile?.longitude) {
              const distance = calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                restaurantProfile.latitude,
                restaurantProfile.longitude
              );

              return {
                ...order,
                restaurant: restaurantProfile,
                distance: distance,
              };
            }
            return null;
          } catch (err) {
            console.error('Error fetching restaurant location:', err);
            return null;
          }
        })
      );

      // Filter out nulls and orders within max distance
      const filtered = ordersWithDistance
        .filter(order => order !== null && order.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

      setNearbyOrders(filtered);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const acceptOrder = async (orderId) => {
    setLoading(true);
    try {
      // Calculate estimated delivery time (30 minutes from now)
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'assigned',
          delivery_id: user.id,
          estimated_delivery_time: estimatedTime.toISOString(),
        })
        .eq('id', orderId)
        .eq('status', 'ready');

      if (error) throw error;
      
      toast.success('Order accepted! You can now see the locations.');
      
      // Refresh orders
      await fetchAvailableOrders();
      await fetchMyOrders();
      
      // Fetch the accepted order with full details
      const { data: acceptedOrder } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, dish:dishes(*))
        `)
        .eq('id', orderId)
        .single();

      if (acceptedOrder) {
        // Fetch restaurant profile
        const { data: restaurantProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', acceptedOrder.restaurant_id)
          .single();

        setSelectedOrder({
          ...acceptedOrder,
          restaurant: restaurantProfile,
        });
      }
    } catch (error) {
      toast.error('Failed to accept order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startDelivery = async (orderId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'out_for_delivery' })
        .eq('id', orderId)
        .eq('delivery_id', user.id);

      if (error) throw error;
      toast.success('Delivery started! Customer can now track your location.');
      fetchAvailableOrders();
      fetchMyOrders();
    } catch (error) {
      toast.error('Failed to start delivery');
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .eq('delivery_id', user.id);

      if (error) throw error;
      toast.success('Order completed!');
      fetchAvailableOrders();
      fetchMyOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to complete order');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fetchMyOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, dish:dishes(*))
        `)
        .eq('delivery_id', user.id)
        .in('status', ['assigned', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOrders(data || []);
    } catch (error) {
      console.error('Error fetching my orders:', error);
    }
  };

  const handleViewOrder = async (order) => {
    // Only show locations for accepted orders
    if (order.delivery_id === user.id) {
      // Fetch full order details with restaurant info
      try {
        const { data: restaurantProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', order.restaurant_id)
          .single();

        setSelectedOrder({
          ...order,
          restaurant: restaurantProfile,
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        setSelectedOrder(order);
      }
    } else {
      // For unaccepted orders, just show basic info without locations
      setSelectedOrder(order);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Delivery Dashboard</h1>
        <div style={styles.headerInfo}>
          {currentLocation && (
            <span style={styles.locationInfo}>
              📍 Your Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          )}
          <button onClick={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.sidebar}>
          <h2>Nearby Orders (within {maxDistance}km)</h2>
          {!currentLocation ? (
            <p style={styles.emptyText}>Getting your location...</p>
          ) : nearbyOrders.length === 0 ? (
            <p style={styles.emptyText}>No nearby orders available</p>
          ) : (
            <div style={styles.orderList}>
              {nearbyOrders.map((order) => (
                <div
                  key={order.id}
                  style={styles.orderCard}
                  onClick={() => handleViewOrder(order)}
                >
                  <div style={styles.orderCardHeader}>
                    <h3>Order #{order.id.slice(0, 8)}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: order.status === 'ready' ? '#28a745' : 
                                      order.status === 'preparing' ? '#007bff' : '#17a2b8'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <p><strong>Restaurant:</strong> {order.restaurant?.restaurant_name || 'N/A'}</p>
                  <p><strong>Distance:</strong> {order.distance?.toFixed(2)} km</p>
                  <p><strong>Total:</strong> ${order.total_amount?.toFixed(2)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptOrder(order.id);
                    }}
                    style={styles.acceptButton}
                    disabled={loading}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: '30px' }}>My Active Orders</h2>
          {myOrders.length === 0 ? (
            <p style={styles.emptyText}>No active orders</p>
          ) : (
            <div style={styles.orderList}>
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  style={styles.orderCard}
                  onClick={() => handleViewOrder(order)}
                >
                  <h3>Order #{order.id.slice(0, 8)}</h3>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ${order.total_amount?.toFixed(2)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeOrder(order.id);
                    }}
                    style={styles.completeButton}
                    disabled={loading || order.status === 'completed'}
                  >
                    Mark Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.mainContent}>
          {selectedOrder ? (
            <OrderDetails
              order={selectedOrder}
              currentLocation={currentLocation}
              showLocations={selectedOrder.delivery_id === user.id}
              onClose={() => setSelectedOrder(null)}
            />
          ) : (
            <div style={styles.mapContainer}>
              <h2>Your Location</h2>
              {currentLocation ? (
                <GoogleMapWrapper
                  center={center}
                  zoom={15}
                  markers={[
                    {
                      position: currentLocation,
                      label: 'You',
                      title: 'Your Current Location',
                    },
                  ]}
                  mapContainerStyle={mapContainerStyle}
                />
              ) : (
                <p>Loading your location...</p>
              )}
            </div>
          )}
        </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    color: '#ff4757',
    margin: 0,
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  locationInfo: {
    fontSize: '14px',
    color: '#666',
  },
  signOutButton: {
    padding: '10px 20px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '20px',
  },
  sidebar: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 150px)',
    overflowY: 'auto',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  orderCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#f8f9fa',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
  },
  acceptButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  startDeliveryButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  completeButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  mainContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  mapContainer: {
    width: '100%',
  },
};

export default DeliveryDashboard;
