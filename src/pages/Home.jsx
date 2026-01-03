import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has a role
    const userRole = user.user_metadata?.role;
    
    if (!userRole) {
      // Redirect to role selection
      navigate('/role-selection');
    } else {
      // Redirect to role-specific dashboard
      if (userRole === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (userRole === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (userRole === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/role-selection');
      }
    }
  }, [user, navigate]);

  return null; // Will redirect
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
    textAlign: 'center',
  },
  title: {
    color: '#ff4757',
    marginBottom: '10px',
    fontSize: '2rem',
  },
  subtitle: {
    color: '#777',
    marginBottom: '30px',
    fontSize: '1rem',
  },
  info: {
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  signOutButton: {
    padding: '12px 30px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

export default Home;

