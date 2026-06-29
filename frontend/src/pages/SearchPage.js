import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

const API = process.env.REACT_APP_API_URL || "";

export default function SearchPage() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (q.length < 2) return setResults([]);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="browse-page">
      <Navbar />
      <div style={{ marginBottom: 32 }}>
        <input
          className="form-input"
          style={{ fontSize: 18, padding: "16px 20px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 4 }}
          placeholder="🔍  Search titles, genres, people..."
          value={query}
          autoFocus
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      {loading && <div style={{ color: "#888", marginBottom: 24 }}>Searching...</div>}
      {results.length > 0 && (
        <div className="movies-grid">
          {results.map(m => <MovieCard key={m._id} movie={m} />)}
        </div>
      )}
      {query.length > 1 && !loading && results.length === 0 && (
        <p style={{ color: "#888", textAlign: "center", marginTop: 60 }}>No results for "{query}"</p>
      )}
    </div>
  );
}
