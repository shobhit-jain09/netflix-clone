import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo">NETFLUX</div>
        <h1 className="auth-title">Sign Up</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {["name", "email", "password"].map(field => (
            <div className="form-group" key={field}>
              <input className="form-input" type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required />
            </div>
          ))}
          <button className="btn btn-red" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Get Started"}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
