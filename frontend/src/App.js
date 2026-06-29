import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import ProfileSelect from "./pages/ProfileSelect";
import HomePage      from "./pages/HomePage";
import BrowsePage    from "./pages/BrowsePage";
import WatchPage     from "./pages/WatchPage";
import SearchPage    from "./pages/SearchPage";
import AdminPage     from "./pages/AdminPage";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"/></div>;
  return user?.isAdmin ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profiles" element={<PrivateRoute><ProfileSelect /></PrivateRoute>} />
          <Route path="/"         element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/browse"   element={<PrivateRoute><BrowsePage /></PrivateRoute>} />
          <Route path="/watch/:id" element={<PrivateRoute><WatchPage /></PrivateRoute>} />
          <Route path="/search"   element={<PrivateRoute><SearchPage /></PrivateRoute>} />
          <Route path="/admin"    element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
