import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

const API = process.env.REACT_APP_API_URL || "";

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies]      = useState([]);
  const [genres, setGenres]      = useState([]);
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
