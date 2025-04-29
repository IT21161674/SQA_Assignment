import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const products = await response.json();
      // Take only the first 3 products for featured section
      setFeaturedProducts(products.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const categories = [
    {
      id: "Electronics",
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: "Clothing",
      name: "Clothing",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: "Books",
      name: "Books",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
  ];

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log("Added to cart:", product);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Welcome to Our Store</h1>
        <p>Discover amazing products at great prices</p>
        <Link to="/products" className="cta-button">
          Shop Now
        </Link>
      </section>

      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="category-card"
            >
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
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
        )}
      </section>
    </div>
  );
};

export default Home;
