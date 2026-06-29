// BrowsePage.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

const API = process.env.REACT_APP_API_URL || "";

export function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies]   = useState([]);
  const [genres, setGenres]   = useState([]);
  const [activeGenre, setActive] = useState("");
  const type = searchParams.get("type");

  useEffect(() => {
    axios.get(`${API}/api/movies/genres`).then(r => setGenres(r.data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (type)        params.set("type", type);
    if (activeGenre) params.set("genre", activeGenre);
    params.set("limit", 60);
    axios.get(`${API}/api/movies?${params}`).then(r => setMovies(r.data.movies || []));
  }, [type, activeGenre]);

  return (
    <div className="browse-page">
      <Navbar />
      <div className="browse-filters">
        <button className={`filter-btn ${!activeGenre ? "active" : ""}`} onClick={() => setActive("")}>All</button>
        {genres.map(g => (
          <button key={g} className={`filter-btn ${activeGenre === g ? "active" : ""}`} onClick={() => setActive(g)}>{g}</button>
        ))}
      </div>
      <div className="movies-grid">
        {movies.map(m => <MovieCard key={m._id} movie={m} />)}
      </div>
      {!movies.length && <p style={{ color: "#888", textAlign: "center", marginTop: 60 }}>No titles found</p>}
    </div>
  );
}

// WatchPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";

export function WatchPage() {
  const { id } = useParams();
  const [movie, setMovie]     = useState(null);
  const [related, setRelated] = useState([]);
  const [inList, setInList]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/movies/${id}`).then(r => {
      setMovie(r.data);
      const genre = r.data.genre?.[0];
      if (genre) axios.get(`${API}/api/movies?genre=${genre}&limit=12`).then(rr => setRelated(rr.data.movies?.filter(m => m._id !== id) || []));
    });
    axios.get(`${API}/api/users/watchlist`).then(r => setInList(r.data.some(m => m._id === id))).catch(() => {});
  }, [id]);

  const toggleWatchlist = () => {
    axios.post(`${API}/api/users/watchlist/${id}`).then(() => setInList(!inList));
  };

  if (!movie) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="watch-page">
      <Navbar />
      <div className="video-container">
        {movie.videoUrl
          ? <video controls autoPlay src={movie.videoUrl} />
          : <div className="video-placeholder">
              <span style={{ fontSize: 48 }}>🎬</span>
              <span>Video not available — add a videoUrl in admin panel</span>
            </div>
        }
      </div>
      <div className="watch-info">
        <h1 className="watch-title">{movie.title}</h1>
        <div className="watch-meta">
          {movie.year && <span>{movie.year}</span>}
          {movie.duration && <span>{movie.duration}</span>}
          {movie.rating && <span style={{ border: "1px solid #888", padding: "0 6px", borderRadius: 2 }}>{movie.rating}</span>}
          {movie.imdbRating && <span className="imdb">⭐ IMDb {movie.imdbRating}</span>}
          {movie.language && <span>{movie.language}</span>}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button className="btn btn-gray" onClick={toggleWatchlist}>{inList ? "✓ In My List" : "+ My List"}</button>
          {movie.trailerUrl && <a className="btn btn-gray" href={movie.trailerUrl} target="_blank" rel="noreferrer">▶ Trailer</a>}
        </div>
        <p className="watch-desc">{movie.description}</p>
        {movie.director && <p style={{ marginTop: 16, fontSize: 14, color: "#aaa" }}><b style={{ color: "#fff" }}>Director:</b> {movie.director}</p>}
        {movie.cast?.length > 0 && <p style={{ marginTop: 8, fontSize: 14, color: "#aaa" }}><b style={{ color: "#fff" }}>Cast:</b> {movie.cast.join(", ")}</p>}
      </div>
      <MovieRow title="More Like This" movies={related} />
    </div>
  );
}

// SearchPage.js
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

export function SearchPage() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (q.length < 2) return setResults([]);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="browse-page">
      <Navbar />
      <div style={{ position: "relative", marginBottom: 32 }}>
        <input className="form-input" style={{ fontSize: 18, padding: "16px 20px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 4 }}
          placeholder="🔍  Search titles, genres, people..." value={query} autoFocus onChange={e => setQuery(e.target.value)} />
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

// ProfileSelect.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AVATARS = ["🦁", "🐯", "🦊", "🐺", "🦄", "🐲", "🤖", "👻"];

export function ProfileSelect() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/users/profiles`).then(r => setProfiles(r.data));
  }, []);

  const selectProfile = (idx) => {
    axios.put(`${API}/api/users/active-profile`, { index: idx }).then(() => navigate("/"));
  };

  const addProfile = () => {
    if (!newName.trim()) return;
    axios.post(`${API}/api/users/profiles`, { name: newName, avatar: AVATARS[profiles.length % AVATARS.length] })
      .then(r => { setProfiles(r.data); setAdding(false); setNewName(""); });
  };

  return (
    <div className="profiles-page">
      <h1>Who's watching?</h1>
      <div className="profiles-grid">
        {profiles.map((p, i) => (
          <div className="profile-item" key={p._id} onClick={() => selectProfile(i)}>
            <div className="profile-avatar" style={{ background: `hsl(${i * 60},60%,30%)`, fontSize: 48 }}>{p.avatar || "👤"}</div>
            <span className="profile-name">{p.name}</span>
          </div>
        ))}
        {profiles.length < 5 && (
          <div className="profile-item" onClick={() => setAdding(true)}>
            <div className="profile-avatar" style={{ background: "#333", border: "2px dashed #666" }}>+</div>
            <span className="profile-name">Add Profile</span>
          </div>
        )}
      </div>
      {adding && (
        <div style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center" }}>
          <input className="form-input" style={{ width: 220 }} placeholder="Profile name" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addProfile()} autoFocus />
          <button className="btn btn-red" onClick={addProfile}>Save</button>
          <button className="btn btn-gray" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default BrowsePage;
