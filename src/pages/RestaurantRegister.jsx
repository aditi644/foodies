import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantRegister = () => {
  const navigate = useNavigate();
  
  // State to manage form data
  const [formData, setFormData] = useState({
    restaurantName: '',
    description: '',
    email: '',      // New
    password: '',
    address: '',
    landmark: '',
    // rating: '5', // Default rating
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Handle text changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file)); // Creates a temporary URL for preview
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Restaurant Registered Successfully!");
    // After submission, you might want to redirect to a dashboard
    // navigate('/restaurant-dashboard');
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Register Your Restaurant</h2>

        {/* Restaurant Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Restaurant Name *</label>
          <input 
            type="text" name="restaurantName" required 
            style={styles.input} placeholder="Enter restaurant name"
            onChange={handleChange} 
          />
        </div>

        {/* Description (Optional) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Description (Optional)</label>
          <textarea 
            name="description" rows="3" 
            style={styles.input} placeholder="Tell us about your kitchen..."
            onChange={handleChange} 
          />
        </div>

        {/* Image Upload */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Restaurant Image *</label>
          <input 
            type="オリンピック" type="file" accept="image/*" required
            onChange={handleImageChange}
            style={styles.fileInput}
          />
          {imagePreview && <img src={imagePreview} alt="Preview" style={styles.preview} />}
        </div>

        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email *</label>
          <input type="email" name="email" required style={styles.input} onChange={handleChange} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password *</label>
          <input type="password" name="password" required style={styles.input} onChange={handleChange} />
        </div>

        {/* Address */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Address *</label>
          <input 
            type="text" name="address" required 
            style={styles.input} placeholder="Street, Area, City"
            onChange={handleChange} 
          />
        </div>

        {/* Landmark (Optional) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Landmark (Optional)</label>
          <input 
            type="text" name="landmark" 
            style={styles.input} placeholder="e.g. Near City Mall"
            onChange={handleChange} 
          />
        </div>

        {/* Ratings - Using a Select for simple UI
        <div style={styles.inputGroup}>
          <label style={styles.label}>Initial Rating (1-5)</label>
          <select name="rating" style={styles.input} onChange={handleChange}>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div> */}

        <button type="submit" style={styles.submitBtn}>Register Restaurant</button>
        <button type="button" onClick={() => navigate('/')} style={styles.backBtn}>Back</button>
      </form>
    </div>
  );
};

// Styling
const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f9f9f9' },
  form: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  heading: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  fileInput: { fontSize: '14px' },
  preview: { width: '100%', height: '150px', objectFit: 'cover', marginTop: '10px', borderRadius: '5px' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  backBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }
};

export default RestaurantRegister;