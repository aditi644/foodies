import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Customer Registered:", formData);
    alert("Welcome aboard! Your account has been created.");
    // navigate('/home'); // Redirect to main marketplace
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Create Customer Account</h2>
        <p style={styles.subHeading}>Join us and start ordering delicious food!</p>

        {/* Full Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input 
            type="text" name="fullName" required 
            style={styles.input} placeholder="John Doe"
            onChange={handleChange} 
          />
        </div>

        {/* Email */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            type="email" name="email" required 
            style={styles.input} placeholder="john@example.com"
            onChange={handleChange} 
          />
        </div>

        {/* Phone */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input 
            type="tel" name="phone" required 
            style={styles.input} placeholder="+1 234 567 890"
            onChange={handleChange} 
          />
        </div>


        {/* Password */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input 
            type="password" name="password" required 
            style={styles.input} placeholder="Min. 8 characters"
            onChange={handleChange} 
          />
        </div>

        {/* Address */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Primary Delivery Address</label>
          <textarea 
            name="address" rows="2" required
            style={styles.input} placeholder="House No, Building, Street, City"
            onChange={handleChange} 
          />
        </div>

        <button type="submit" style={styles.submitBtn}>Sign Up</button>
        
        <p style={styles.loginText}>
          Already have an account? <span style={styles.link} onClick={() => navigate('/')}>Login</span>
        </p>
      </form>
    </div>
  );
};

// Styling
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', backgroundColor: '#fff5f5', minHeight: '100vh' },
  form: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(255, 71, 87, 0.1)', width: '100%', maxWidth: '400px' },
  heading: { textAlign: 'center', color: '#ff4757', marginBottom: '5px' },
  subHeading: { textAlign: 'center', color: '#777', fontSize: '14px', marginBottom: '20px' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2f3542', fontSize: '14px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
  loginText: { textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#57606f' },
  link: { color: '#ff4757', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }
};

export default CustomerRegister;