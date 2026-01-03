import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    vehicleType: 'scooter',
    workZone: '',
    isActive: true // Default to active upon registration
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox separately from text/select
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Delivery Partner Data:", formData);
    alert("Registration submitted! We will verify your details soon.");
    // navigate('/delivery-dashboard');
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Delivery Partner Sign-up</h2>

        {/* Full Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name *</label>
          <input 
            type="text" name="fullName" required 
            style={styles.input} placeholder="Enter your full name"
            onChange={handleChange} 
          />
        </div>

        {/* Phone Number */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number *</label>
          <input 
            type="tel" name="phoneNumber" required 
            style={styles.input} placeholder="e.g. +1 234 567 890"
            onChange={handleChange} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email *</label>
          <input type="email" name="email" required style={styles.input} onChange={handleChange} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password *</label>
          <input type="password" name="password" required style={styles.input} onChange={handleChange} />
        </div>

        {/* Vehicle Type (Added Advice) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Vehicle Type</label>
          <select name="vehicleType" style={styles.input} onChange={handleChange}>
            <option value="bicycle">Bicycle</option>
            <option value="scooter">Scooter/Motorcycle</option>
            <option value="car">Car</option>
          </select>
        </div>

        {/* Work Zone (Added Advice) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Preferred Delivery Area</label>
          <input 
            type="text" name="workZone" 
            style={styles.input} placeholder="e.g. Downtown, North Side"
            onChange={handleChange} 
          />
        </div>

        {/* Is Active Status */}
        <div style={styles.checkboxGroup}>
          <input 
            type="checkbox" 
            name="isActive" 
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            style={styles.checkbox}
          />
          <label htmlFor="isActive" style={styles.checkboxLabel}>
            Available to start delivering immediately
          </label>
        </div>

        <button type="submit" style={styles.submitBtn}>Join the Fleet</button>
        <button type="button" onClick={() => navigate('/')} style={styles.backBtn}>Back</button>
      </form>
    </div>
  );
};

// Styling
const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#eef2f3', minHeight: '80vh' },
  form: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' },
  heading: { textAlign: 'center', color: '#1a2a6c', marginBottom: '25px' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#444' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  checkboxGroup: { display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '14px', color: '#555', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  backBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }
};

export default DeliveryRegister;