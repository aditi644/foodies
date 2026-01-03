import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const RoleRegistration = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });

  const [formData, setFormData] = useState({
    // Common fields
    phone: '',
    address: '',
    city: '',
    pincode: '',
    // Restaurant specific
    restaurantName: '',
    cuisineType: '',
    // Delivery specific
    vehicleType: '',
    licenseNumber: '',
    // Customer specific
    landmark: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude, address: '' });

        // Reverse geocode to get address (using a free service)
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_KEY`
          );
          // For now, we'll just store coordinates
          // In production, use a proper geocoding service
          setLocation(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          toast.dismiss();
          toast.success('Location captured!');
        } catch (error) {
          setLocation(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          toast.dismiss();
          toast.success('Location captured!');
        }
      },
      (error) => {
        toast.dismiss();
        toast.error('Failed to get location. Please enter manually.');
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save profile to Supabase
      const profileData = {
        user_id: user.id,
        role: role,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        latitude: location.lat,
        longitude: location.lng,
        ...(role === 'restaurant' && {
          restaurant_name: formData.restaurantName,
          cuisine_type: formData.cuisineType,
        }),
        ...(role === 'delivery' && {
          vehicle_type: formData.vehicleType,
          license_number: formData.licenseNumber,
        }),
        ...(role === 'customer' && {
          landmark: formData.landmark,
        }),
      };

      // Update user metadata with role
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: role, ...profileData }
      });

      if (updateError) throw updateError;

      // Insert into profiles table (you'll need to create this in Supabase)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (profileError) {
        // If table doesn't exist, just update metadata
        console.warn('Profiles table not found, using metadata only:', profileError);
      }

      toast.success('Profile created successfully!');
      
      // Navigate to role-specific dashboard
      if (role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (role === 'delivery') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save profile');
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (role === 'restaurant') {
      return (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Restaurant Name *</label>
            <input
              type="text"
              name="restaurantName"
              required
              value={formData.restaurantName}
              onChange={handleChange}
              style={styles.input}
              placeholder="My Restaurant"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Cuisine Type *</label>
            <input
              type="text"
              name="cuisineType"
              required
              value={formData.cuisineType}
              onChange={handleChange}
              style={styles.input}
              placeholder="Italian, Indian, Chinese, etc."
            />
          </div>
        </>
      );
    }

    if (role === 'delivery') {
      return (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehicle Type *</label>
            <select
              name="vehicleType"
              required
              value={formData.vehicleType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select vehicle</option>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>License Number *</label>
            <input
              type="text"
              name="licenseNumber"
              required
              value={formData.licenseNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="DL-1234567890"
            />
          </div>
        </>
      );
    }

    if (role === 'customer') {
      return (
        <div style={styles.inputGroup}>
          <label style={styles.label}>Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            style={styles.input}
            placeholder="Near park, building name, etc."
          />
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {role === 'restaurant' && 'Restaurant Registration'}
          {role === 'delivery' && 'Delivery Partner Registration'}
          {role === 'customer' && 'Customer Registration'}
        </h2>
        <p style={styles.subtitle}>Complete your profile to get started</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Common fields */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+1234567890"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Address *</label>
            <textarea
              name="address"
              required
              rows="3"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
              placeholder="Street address, building number"
            />
          </div>

          <div style={styles.locationSection}>
            <button
              type="button"
              onClick={getLocation}
              style={styles.locationButton}
            >
              📍 Get My Location
            </button>
            {location.lat && (
              <p style={styles.locationText}>
                Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>City *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              style={styles.input}
              placeholder="City name"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Pincode/ZIP Code *</label>
            <input
              type="text"
              name="pincode"
              required
              value={formData.pincode}
              onChange={handleChange}
              style={styles.input}
              placeholder="123456"
            />
          </div>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading || !location.lat}
          >
            {loading ? 'Saving...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#fff5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(255, 71, 87, 0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    textAlign: 'center',
    color: '#ff4757',
    marginBottom: '5px',
    fontSize: '2rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    fontSize: '14px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2f3542',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  locationSection: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  locationButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  locationText: {
    fontSize: '12px',
    color: '#4CAF50',
    margin: '5px 0',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
};

export default RoleRegistration;

