// src/components/Navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <header className="nav-shell">
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo-mark">🌱</div>
          <span className="nav-logo">AgroSense</span>
        </div>
        <div className="nav-right">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          {token && (
            <>
              <Link to="/dashboard" className={isActive("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/scan" className={isActive("/scan")}>
                Scan
              </Link>
              <Link to="/yield" className={isActive("/yield")}>
                Yield
              </Link>
            </>
          )}
          {!token && (
            <>
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>
              <Link to="/register" className={isActive("/register")}>
                Register
              </Link>
            </>
          )}
          {token && (
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
