import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FirstPage = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (role === 'restaurant') {
      navigate('/register-restaurant');
    } else if (role === 'delivery') {
      navigate('/register-delivery');
    } else if (role === 'customer') {
      navigate('/register-customer');
    } else {
      alert("Please select a role to continue!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome!</h1>
        <p style={styles.subtitle}>To provide you the best experience, please tell us:</p>
        
        <label htmlFor="role-select" style={styles.label}>Who are you?</label>
        
        <select 
          id="role-select"
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="" disabled>-- Select your role --</option>
          <option value="restaurant">Restaurant Owner</option>
          <option value="delivery">Delivery Partner</option>
          <option value="customer">Customer</option>
        </select>

        <button onClick={handleNavigation} style={styles.button}>
          Continue
        </button>
      </div>
    </div>
  );
};

// Simple inline styles for a clean UI
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    padding: '40px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '350px'
  },
  title: {
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    marginBottom: '20px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  }
};

export default FirstPage;