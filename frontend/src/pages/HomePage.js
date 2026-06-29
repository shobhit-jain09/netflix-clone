import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";

const API = process.env.REACT_APP_API_URL || "";

export default function HomePage() {
  const [featured, setFeatured]   = useState(null);
  const [trending, setTrending]   = useState([]);
  const [newRel, setNewRel]       = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/movies/featured`),
      axios.get(`${API}/api/movies/trending`),
      axios.get(`${API}/api/movies/new`),
      axios.get(`${API}/api/movies?limit=40`),
    ]).then(([f, t, n, a]) => {
      setFeatured(f.data);
      setTrending(t.data);
      setNewRel(n.data);
      setAllMovies(a.data.movies || []);
    }).catch(console.error);
  }, []);

  return (
    <div>
      <Navbar />
      {featured && (
        <div className="hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${featured.backdropUrl || featured.posterUrl})` }} />
          <div className="hero-content">
            <h1 className="hero-title">{featured.title}</h1>
            <p className="hero-desc">{featured.description}</p>
            <div className="hero-btns">
              <button className="btn btn-white" onClick={() => navigate(`/watch/${featured._id}`)}>▶ Play</button>
              <button className="btn btn-gray"  onClick={() => navigate(`/watch/${featured._id}`)}>ℹ More Info</button>
            </div>
          </div>
        </div>
      )}
      <MovieRow title="🔥 Trending Now"    movies={trending} />
      <MovieRow title="🆕 New Releases"    movies={newRel} />
      <MovieRow title="All Titles"          movies={allMovies} />
      <MovieRow title="Action & Adventure"  movies={allMovies.filter(m => m.genre?.includes("Action"))} />
      <MovieRow title="Sci-Fi"              movies={allMovies.filter(m => m.genre?.includes("Sci-Fi"))} />
      <MovieRow title="TV Series"           movies={allMovies.filter(m => m.type === "series")} />
    </div>
  );
}
