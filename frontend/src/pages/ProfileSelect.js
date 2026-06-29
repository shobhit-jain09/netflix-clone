import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";
const AVATARS = ["🦁", "🐯", "🦊", "🐺", "🦄", "🐲", "🤖", "👻"];

export default function ProfileSelect() {
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
    axios.post(`${API}/api/users/profiles`, {
      name: newName,
      avatar: AVATARS[profiles.length % AVATARS.length]
    }).then(r => {
      setProfiles(r.data);
      setAdding(false);
      setNewName("");
    });
  };

  return (
    <div className="profiles-page">
      <h1>Who's watching?</h1>
      <div className="profiles-grid">
        {profiles.map((p, i) => (
          <div className="profile-item" key={p._id} onClick={() => selectProfile(i)}>
            <div className="profile-avatar" style={{ background: `hsl(${i * 60},60%,30%)`, fontSize: 48 }}>
              {p.avatar || "👤"}
            </div>
            <span className="profile-name">{p.name}</span>
          </div>
        ))}
        {profiles.length < 5 && (
          <div className="profile-item" onClick={() => setAdding(true)}>
            <div className="profile-avatar" style={{ background: "#333", border: "2px dashed #666", fontSize: 32 }}>+</div>
            <span className="profile-name">Add Profile</span>
          </div>
        )}
      </div>
      {adding && (
        <div style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center" }}>
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="Profile name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addProfile()}
            autoFocus
          />
          <button className="btn btn-red" onClick={addProfile}>Save</button>
          <button className="btn btn-gray" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
