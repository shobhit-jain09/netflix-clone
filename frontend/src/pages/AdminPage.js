import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = process.env.REACT_APP_API_URL || "";

export default function AdminPage() {
  const [tab, setTab]         = useState("stats");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [movies, setMovies]   = useState([]);
  const [form, setForm]       = useState({ title: "", description: "", type: "movie", genre: "", year: "", imdbRating: "", duration: "", posterUrl: "", backdropUrl: "", trailerUrl: "", videoUrl: "", featured: false, trending: false, newRelease: false });
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    axios.get(`${API}/api/admin/stats`).then(r => setStats(r.data));
    axios.get(`${API}/api/admin/users`).then(r => setUsers(r.data.users || []));
    axios.get(`${API}/api/movies?limit=100`).then(r => setMovies(r.data.movies || []));
  }, []);

  const submitMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, genre: form.genre.split(",").map(g => g.trim()).filter(Boolean), year: Number(form.year), imdbRating: Number(form.imdbRating) };
      await axios.post(`${API}/api/movies`, payload);
      setMsg("Movie added successfully!");
      setForm({ title: "", description: "", type: "movie", genre: "", year: "", imdbRating: "", duration: "", posterUrl: "", backdropUrl: "", trailerUrl: "", videoUrl: "", featured: false, trending: false, newRelease: false });
      const r = await axios.get(`${API}/api/movies?limit=100`);
      setMovies(r.data.movies || []);
    } catch (err) { setMsg(err.response?.data?.message || "Error adding movie"); }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    await axios.delete(`${API}/api/movies/${id}`);
    setMovies(movies.filter(m => m._id !== id));
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`${API}/api/admin/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  const seedMovies = async () => {
    await axios.post(`${API}/api/admin/seed`);
    const r = await axios.get(`${API}/api/movies?limit=100`);
    setMovies(r.data.movies || []);
    setMsg("Sample movies seeded!");
  };

  return (
    <div className="admin-page">
      <Navbar />
      <h1 className="admin-title">⚙️ Admin Panel</h1>
      <div className="admin-tabs">
        {["stats", "movies", "addMovie", "users"].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {{ stats: "📊 Stats", movies: "🎬 Movies", addMovie: "➕ Add Movie", users: "👥 Users" }[t]}
          </button>
        ))}
      </div>

      {msg && <div style={{ background: "rgba(29,158,117,.15)", border: "1px solid #1D9E75", borderRadius: 6, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#1D9E75" }}>{msg}</div>}

      {tab === "stats" && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalMovies}</div><div className="stat-label">Movies</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalSeries}</div><div className="stat-label">Series</div></div>
          </div>
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>Most Watched</h2>
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Views</th></tr></thead>
            <tbody>{stats.topMovies?.map(m => <tr key={m._id}><td>{m.title}</td><td>{m.views}</td></tr>)}</tbody>
          </table>
          <button className="btn btn-gray" style={{ marginTop: 24 }} onClick={seedMovies}>🌱 Seed Sample Movies</button>
        </>
      )}

      {tab === "movies" && (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Type</th><th>Year</th><th>Views</th><th>Actions</th></tr></thead>
          <tbody>
            {movies.map(m => (
              <tr key={m._id}>
                <td>{m.title}</td>
                <td><span style={{ padding: "2px 8px", background: "rgba(255,255,255,.08)", borderRadius: 4, fontSize: 11 }}>{m.type}</span></td>
                <td>{m.year}</td>
                <td>{m.views}</td>
                <td><button style={{ background: "#e50914", border: "none", color: "#fff", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 }} onClick={() => deleteMovie(m._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "addMovie" && (
        <form className="admin-add-form" onSubmit={submitMovie}>
          <div className="form-grid">
            {[["title","Title *"],["description","Description *"],["genre","Genres (comma separated)"],["year","Year"],["imdbRating","IMDb Rating"],["duration","Duration (e.g. 2h 30m)"],["posterUrl","Poster URL"],["backdropUrl","Backdrop URL"],["trailerUrl","Trailer URL (YouTube)"],["videoUrl","Video URL (MP4)"]].map(([key, label]) => (
              <div className="form-group" key={key} style={key === "description" ? { gridColumn: "1/-1" } : {}}>
                <label>{label}</label>
                {key === "description"
                  ? <textarea className="form-input" rows={3} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  : <input className="form-input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                }
              </div>
            ))}
            <div className="form-group">
              <label>Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", gridColumn: "1/-1" }}>
              {["featured","trending","newRelease"].map(flag => (
                <label key={flag} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={form[flag]} onChange={e => setForm({ ...form, [flag]: e.target.checked })} />
                  {flag.charAt(0).toUpperCase() + flag.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-red" type="submit" style={{ marginTop: 16 }}>Add Movie</button>
        </form>
      )}

      {tab === "users" && (
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Plan</th><th>Profiles</th><th>Admin</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td><span className={`badge-plan plan-${u.plan}`}>{u.plan}</span></td>
                <td>{u.profiles?.length}</td>
                <td>{u.isAdmin ? "✓" : "—"}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><button style={{ background: "#333", border: "none", color: "#ccc", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 }} onClick={() => deleteUser(u._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
