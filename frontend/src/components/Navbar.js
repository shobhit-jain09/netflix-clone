import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const profile  = user?.profiles?.[user?.activeProfile ?? 0];
  const initial  = profile?.name?.[0]?.toUpperCase() || "U";

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">NETFLUX</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/browse?type=series">TV Shows</Link>
        <Link to="/browse?type=movie">Movies</Link>
        <Link to="/browse?new=true">New &amp; Popular</Link>
      </div>
      <div className="navbar-right">
        <span className="search-icon" onClick={() => navigate("/search")} title="Search">🔍</span>

        <div className="dropdown" ref={dropdownRef}>
          <div
            className="avatar"
            onClick={() => setMenuOpen(prev => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {initial}
          </div>

          {menuOpen && (
            <div className="dropdown-menu" style={{ display: "block" }}>
              <div style={{ padding: "8px 16px 4px", fontSize: 12, color: "#777", borderBottom: "1px solid #333", marginBottom: 4 }}>
                {user?.email}
              </div>
              <Link to="/profiles" onClick={() => setMenuOpen(false)}>Switch Profile</Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: "#E50914", fontWeight: 600 }}
                >
                  ⚙️ Admin Panel
                </Link>
              )}
              <button onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
