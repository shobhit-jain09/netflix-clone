import React from "react";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies = [] }) {
  if (!movies.length) return null;
  return (
    <div className="row-section">
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {movies.map(m => <MovieCard key={m._id} movie={m} />)}
      </div>
    </div>
  );
}
