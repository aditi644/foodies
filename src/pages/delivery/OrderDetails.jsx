import React, { useEffect, useState } from 'react';
import GoogleMapWrapper from '../../components/GoogleMapWrapper';
import supabase from '../../lib/supabase';

const OrderDetails = ({ order, currentLocation, showLocations = false, onClose }) => {
  const [directions, setDirections] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  useEffect(() => {
    if (order && showLocations) {
      // Only fetch locations if order is accepted
      fetchLocations();
    } else {
      setLoading(false);
    }
  }, [order, showLocations]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Get restaurant location from profile
      if (order.restaurant_id) {
        const { data: restaurant } = await supabase
          .from('profiles')
          .select('latitude, longitude, restaurant_name, address')
          .eq('user_id', order.restaurant_id)
          .single();

        if (restaurant?.latitude && restaurant?.longitude) {
          setRestaurantLocation({
            lat: parseFloat(restaurant.latitude),
            lng: parseFloat(restaurant.longitude),
          });
        }
      }

      // Get customer location from profile
      if (order.customer_id) {
        const { data: customer } = await supabase
          .from('profiles')
          .select('latitude, longitude')
          .eq('user_id', order.customer_id)
          .single();

        if (customer?.latitude && customer?.longitude) {
          setCustomerLocation({
            lat: parseFloat(customer.latitude),
            lng: parseFloat(customer.longitude),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = () => {
    if (!window.google || !restaurantLocation || !customerLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: restaurantLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };

  useEffect(() => {
    if (restaurantLocation && customerLocation && showLocations) {
      // Small delay to ensure Google Maps is loaded
      setTimeout(() => {
        calculateRoute();
      }, 500);
    }
  }, [restaurantLocation, customerLocation, showLocations]);

  const center = restaurantLocation || currentLocation || { lat: 0, lng: 0 };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Order Details</h2>
        <button onClick={onClose} style={styles.closeButton}>
          ×
        </button>
      </div>

      {!showLocations && (
        <div style={styles.warningBanner}>
          ⚠️ Accept this order to see restaurant and customer locations
        </div>
      )}

      <div style={styles.orderInfo}>
        <div style={styles.infoSection}>
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> #{order.id.slice(0, 8)}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${order.total_amount?.toFixed(2)}</p>
        </div>

        <div style={styles.infoSection}>
          <h3>Restaurant</h3>
          <p><strong>Name:</strong> {order.restaurant?.restaurant_name || 'N/A'}</p>
          <p><strong>Address:</strong> {order.restaurant?.address || order.delivery_address || 'N/A'}</p>
        </div>

        <div style={styles.infoSection}>
          <h3>Customer</h3>
          <p><strong>Delivery Address:</strong> {order.delivery_address || 'N/A'}</p>
        </div>

        <div style={styles.infoSection}>
          <h3>Items</h3>
          {order.order_items?.map((item, idx) => (
            <p key={idx}>
              {item.quantity}x {item.dish?.name || 'Item'} - ${(item.price * item.quantity).toFixed(2)}
            </p>
          ))}
        </div>
      </div>

      {showLocations && (
        <div style={styles.mapSection}>
          <h3>Route Map</h3>
          {loading ? (
            <p>Loading locations...</p>
          ) : currentLocation && restaurantLocation && customerLocation ? (
            <GoogleMapWrapper
              center={center}
              zoom={12}
              markers={[
                currentLocation && {
                  position: currentLocation,
                  label: 'You',
                  title: 'Your Location',
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  },
                },
                restaurantLocation && {
                  position: restaurantLocation,
                  label: 'Restaurant',
                  title: 'Restaurant Location',
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  },
                },
                customerLocation && {
                  position: customerLocation,
                  label: 'Customer',
                  title: 'Customer Location',
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  },
                },
              ].filter(Boolean)}
              directions={directions}
              mapContainerStyle={mapContainerStyle}
            />
          ) : (
            <p style={styles.errorText}>
              Unable to load locations. Please ensure restaurant and customer have completed registration with location.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '30px',
    cursor: 'pointer',
    color: '#999',
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#856404',
    fontSize: '14px',
  },
  orderInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
  },
  mapSection: {
    marginTop: '20px',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    padding: '20px',
  },
};

export default OrderDetails;
