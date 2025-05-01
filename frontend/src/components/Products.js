import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Home.css'; // Reusing the same styles as Home

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Get search query from URL
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('search');
    
    if (searchTerm && products.length > 0) {
      // Filter products based on search term
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const products = await response.json();
      setProducts(products);
      setFilteredProducts(products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log('Added to cart:', product);
  };

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('search');

  // No products found content
  const NoProductsFound = () => (
    <div style={{ 
      textAlign: 'center',
      padding: '2.5rem',
      maxWidth: '500px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      margin: '100px auto',
      width: '100%'
    }}>
      <div style={{ 
        margin: '0 auto 1.5rem', 
        color: '#6c757d', 
        display: 'flex', 
        justifyContent: 'center'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No products found</h3>
      <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#6c757d' }}>
        We couldn't find any products matching "{searchTerm}"
      </p>
      <div style={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem auto',
        textAlign: 'left',
        maxWidth: '90%'
      }}>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Check your spelling</li>
          <li style={{ marginBottom: '0.5rem' }}>Try more general keywords</li>
          <li style={{ marginBottom: '0.5rem' }}>Try different keywords</li>
        </ul>
      </div>
      <Link to="/" style={{
        marginTop: '1.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'inline-block',
        fontWeight: 'bold'
      }}>Return to Home</Link>
    </div>
  );

  return (
    <div className="home" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 'calc(100vh - 120px)', 
      paddingTop: '20px',
      width: '100%',
      maxWidth: '100%',
      alignItems: 'center'
    }}>
      <section className="featured-products" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'center'
      }}>
        {searchTerm ? (
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>Search Results for "{searchTerm}"</h2>
        ) : (
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>All Products</h2>
        )}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <img 
                  src={product.imagePath ? `http://localhost:5000${product.imagePath}` : 'http://localhost:5000/default.svg'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'http://localhost:5000/default.svg';
                  }}
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                <div className="product-actions">
                  <button 
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <Link to={`/product/${product.id}`} className="view-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingTop: '50px',
            paddingBottom: '50px'
          }}>
            <div style={{ maxWidth: '500px', width: '100%' }}>
              <NoProductsFound />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Products; 