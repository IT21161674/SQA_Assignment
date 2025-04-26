import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const products = await response.json();
      // Take only the first 3 products for featured section
      setFeaturedProducts(products.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'Electronics',
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 'Clothing',
      name: "Clothing",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 'Books',
      name: "Books",
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log('Added to cart:', product);
  };

  return (
    <div className="home">
      {/* Header with Cart Icon */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">ShopEase</h1>
          <div className="header-buttons">
            <Link to="/" className="header-button">Home</Link>
            <Link to="/admin" className="header-button">Admin Panel</Link>
            <Link to="/cart" className="cart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-count">0</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ShopEase</h1>
          <p>Discover Amazing Products at Great Prices</p>
          <Link to="/products" className="cta-button">Shop Now</Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product._id} className="product-card">
                <img 
                  src={`http://localhost:5000/api/products/${product._id}/image`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
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
                  <Link to={`/product/${product._id}`} className="view-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link key={category.id} to={`/category/${category.id}`} className="category-card">
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
              <span className="explore-button">Explore</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 