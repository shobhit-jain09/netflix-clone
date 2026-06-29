import React from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK = "https://via.placeholder.com/220x330/181818/666666?text=No+Image";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  return (
    <div className="movie-card" onClick={() => navigate(`/watch/${movie._id}`)}>
      <img
        src={movie.posterUrl || FALLBACK}
        alt={movie.title}
        loading="lazy"
        onError={e => { e.target.src = FALLBACK; }}
      />
      <div className="movie-card-info">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          {movie.imdbRating && <span className="imdb">⭐ {movie.imdbRating}</span>}
          {movie.year && <span>{movie.year}</span>}
          {movie.type === "series" ? <span>Series</span> : movie.duration && <span>{movie.duration}</span>}
        </div>
      </div>
    </div>
  );
}
