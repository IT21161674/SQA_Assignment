import React, { useState, useEffect } from 'react';
import './Admin.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Books'];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append('image', image);
      }

      if (editingId) {
        // Update existing product
        await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create new product
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          body: formDataToSend,
        });
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category
    });
    setImage(null);
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: ''
    });
    setImage(null);
    setEditingId(null);
  };

  return (
    <div className="admin-container">
      <h1>Product Management</h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="category-select"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Product Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required={!editingId}
          />
        </div>

        <div className="form-buttons">
          <button type="submit">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="products-list">
        <h2>Current Products</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img 
                src={`http://localhost:5000/api/products/${product._id}/image`}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <div className="product-actions">
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin; 