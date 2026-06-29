import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";

const API = process.env.REACT_APP_API_URL || "";

export default function WatchPage() {
  const { id } = useParams();
  const [movie, setMovie]     = useState(null);
  const [related, setRelated] = useState([]);
  const [inList, setInList]   = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/movies/${id}`).then(r => {
      setMovie(r.data);
      const genre = r.data.genre?.[0];
      if (genre) {
        axios.get(`${API}/api/movies?genre=${genre}&limit=12`)
          .then(rr => setRelated(rr.data.movies?.filter(m => m._id !== id) || []));
      }
    });
    axios.get(`${API}/api/users/watchlist`)
      .then(r => setInList(r.data.some(m => m._id === id)))
      .catch(() => {});
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
          : (
            <div className="video-placeholder">
              <span style={{ fontSize: 48 }}>🎬</span>
              <span>Video not available — add a videoUrl in admin panel</span>
            </div>
          )
        }
      </div>
      <div className="watch-info">
        <h1 className="watch-title">{movie.title}</h1>
        <div className="watch-meta">
          {movie.year     && <span>{movie.year}</span>}
          {movie.duration && <span>{movie.duration}</span>}
          {movie.rating   && <span style={{ border: "1px solid #888", padding: "0 6px", borderRadius: 2 }}>{movie.rating}</span>}
          {movie.imdbRating && <span className="imdb">⭐ IMDb {movie.imdbRating}</span>}
          {movie.language && <span>{movie.language}</span>}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button className="btn btn-gray" onClick={toggleWatchlist}>
            {inList ? "✓ In My List" : "+ My List"}
          </button>
          {movie.trailerUrl && (
            <a className="btn btn-gray" href={movie.trailerUrl} target="_blank" rel="noreferrer">▶ Trailer</a>
          )}
        </div>
        <p className="watch-desc">{movie.description}</p>
        {movie.director && (
          <p style={{ marginTop: 16, fontSize: 14, color: "#aaa" }}>
            <b style={{ color: "#fff" }}>Director:</b> {movie.director}
          </p>
        )}
        {movie.cast?.length > 0 && (
          <p style={{ marginTop: 8, fontSize: 14, color: "#aaa" }}>
            <b style={{ color: "#fff" }}>Cast:</b> {movie.cast.join(", ")}
          </p>
        )}
      </div>
      <MovieRow title="More Like This" movies={related} />
    </div>
  );
}
