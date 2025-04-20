import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import authService from "../services/authService";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Your App Name
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/category/1" className="nav-item">
            Categories
          </Link>
          {isAuthenticated && (
            <Link to="/admin" className="nav-item">
              Admin
            </Link>
          )}
          <div className="auth-buttons">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="nav-item logout-btn">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-item login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="nav-item register-btn">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
