import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('');

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role to continue!');
      return;
    }
    navigate(`/register/${selectedRole}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Choose Your Role</h1>
        <p style={styles.subtitle}>Select how you want to use FoodHub</p>

        <div style={styles.roleContainer}>
          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'restaurant' ? styles.roleCardSelected : {}),
            }}
            onClick={() => setSelectedRole('restaurant')}
          >
            <div style={styles.roleIcon}>🍽️</div>
            <h3 style={styles.roleTitle}>Restaurant Owner</h3>
            <p style={styles.roleDescription}>Manage your restaurant and dishes</p>
          </div>

          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'delivery' ? styles.roleCardSelected : {}),
            }}
            onClick={() => setSelectedRole('delivery')}
          >
            <div style={styles.roleIcon}>🚚</div>
            <h3 style={styles.roleTitle}>Delivery Partner</h3>
            <p style={styles.roleDescription}>Deliver orders to customers</p>
          </div>

          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'customer' ? styles.roleCardSelected : {}),
            }}
            onClick={() => setSelectedRole('customer')}
          >
            <div style={styles.roleIcon}>🍕</div>
            <h3 style={styles.roleTitle}>Customer</h3>
            <p style={styles.roleDescription}>Order delicious food</p>
          </div>
        </div>

        <button onClick={handleContinue} style={styles.continueButton}>
          Continue
        </button>
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
    maxWidth: '800px',
    textAlign: 'center',
  },
  title: {
    color: '#ff4757',
    marginBottom: '10px',
    fontSize: '2.5rem',
  },
  subtitle: {
    color: '#777',
    marginBottom: '40px',
    fontSize: '1.1rem',
  },
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  roleCard: {
    padding: '30px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
  },
  roleCardSelected: {
    borderColor: '#ff4757',
    backgroundColor: '#fff5f5',
    transform: 'scale(1.05)',
  },
  roleIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  roleTitle: {
    color: '#2f3542',
    marginBottom: '10px',
    fontSize: '1.3rem',
  },
  roleDescription: {
    color: '#777',
    fontSize: '0.9rem',
  },
  continueButton: {
    width: '100%',
    padding: '14px',
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

export default RoleSelection;

