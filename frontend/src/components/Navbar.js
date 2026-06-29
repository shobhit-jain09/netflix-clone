import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const profile = user?.profiles?.[user?.activeProfile ?? 0];
  const initial = profile?.name?.[0]?.toUpperCase() || "U";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">NETFLUX</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/browse?type=series">TV Shows</Link>
        <Link to="/browse?type=movie">Movies</Link>
        <Link to="/browse?new=true">New & Popular</Link>
      </div>
      <div className="navbar-right">
        <span className="search-icon" onClick={() => navigate("/search")} title="Search">🔍</span>
        <div className="dropdown">
          <div className="avatar">{initial}</div>
          <div className="dropdown-menu">
            <Link to="/profiles">Switch Profile</Link>
            {user?.isAdmin && <Link to="/admin">Admin Panel</Link>}
            <button onClick={() => { logout(); navigate("/login"); }}>Sign Out</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
