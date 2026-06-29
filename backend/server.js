const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes    = require("./routes/auth");
const movieRoutes   = require("./routes/movies");
const userRoutes    = require("./routes/users");
const adminRoutes   = require("./routes/admin");
const searchRoutes  = require("./routes/search");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Routes
app.use("/api/auth",   authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users",  userRoutes);
app.use("/api/admin",  adminRoutes);
app.use("/api/search", searchRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => { console.error("DB connection error:", err); process.exit(1); });
