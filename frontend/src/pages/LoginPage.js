import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.profiles?.length ? "/" : "/profiles");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo">NETFLUX</div>
        <h1 className="auth-title">Sign In</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input className="form-input" type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <input className="form-input" type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-red" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="auth-link">New to Netflux? <Link to="/register">Sign up now</Link></p>
      </div>
    </div>
  );
}
