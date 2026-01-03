import React, { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';

const DishForm = ({ dish, onClose, restaurantId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_available: true,
  });
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price_modifier: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || '',
        description: dish.description || '',
        price: dish.price || '',
        image_url: dish.image_url || '',
        category: dish.category || '',
        is_available: dish.is_available !== false,
      });
      setVariants(dish.variants || []);
    }
  }, [dish]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddVariant = () => {
    if (!newVariant.name.trim()) {
      toast.error('Variant name is required');
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ name: '', price_modifier: 0 });
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dishData = {
        ...formData,
        price: parseFloat(formData.price),
        restaurant_id: restaurantId,
        variants: variants,
      };

      if (dish) {
        // Update existing dish
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
          .eq('id', dish.id);

        if (error) throw error;
        toast.success('Dish updated successfully!');
      } else {
        // Create new dish
        const { error } = await supabase
          .from('dishes')
          .insert([dishData]);

        if (error) throw error;
        toast.success('Dish created successfully!');
      }

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save dish');
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>{dish ? 'Edit Dish' : 'Add New Dish'}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Dish Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Pizza Margherita"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              style={styles.input}
              placeholder="Delicious pizza with..."
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price ($) *</label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              style={styles.input}
              placeholder="12.99"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.input}
              placeholder="Pizza, Pasta, etc."
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                style={styles.checkbox}
              />
              Available
            </label>
          </div>

          <div style={styles.variantsSection}>
            <h3 style={styles.sectionTitle}>Variants</h3>
            {variants.map((variant, index) => (
              <div key={index} style={styles.variantItem}>
                <span>{variant.name} (+${variant.price_modifier})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <div style={styles.addVariant}>
              <input
                type="text"
                placeholder="Variant name (e.g., Large, Extra Cheese)"
                value={newVariant.name}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, name: e.target.value })
                }
                style={styles.variantInput}
              />
              <input
                type="number"
                placeholder="Price modifier"
                step="0.01"
                value={newVariant.price_modifier}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    price_modifier: parseFloat(e.target.value) || 0,
                  })
                }
                style={styles.variantInput}
              />
              <button
                type="button"
                onClick={handleAddVariant}
                style={styles.addVariantButton}
              >
                Add Variant
              </button>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : dish ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
  variantsSection: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
  },
  variantItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  addVariant: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  variantInput: {
    flex: 1,
    minWidth: '150px',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ced4da',
  },
  addVariantButton: {
    padding: '8px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default DishForm;

