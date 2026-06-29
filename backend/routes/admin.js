const router = require("express").Router();
const User   = require("../models/User");
const Movie  = require("../models/Movie");
const { protect, adminOnly } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalMovies, totalSeries, topMovies] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments({ type: "movie" }),
      Movie.countDocuments({ type: "series" }),
      Movie.find().sort({ views: -1 }).limit(5).select("title views posterUrl")
    ]);
    res.json({ totalUsers, totalMovies, totalSeries, topMovies });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments();
    res.json({ users, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/users/:id  — update plan or admin flag
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/admin/seed  — seed sample movies (dev only)
router.post("/seed", async (req, res) => {
  try {
    const sample = [
      { title: "Inception", description: "A thief who steals corporate secrets through dream-sharing technology.", genre: ["Sci-Fi", "Action", "Thriller"], type: "movie", year: 2010, imdbRating: 8.8, duration: "2h 28m", featured: true, trending: true, posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0", language: "English", director: "Christopher Nolan", cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"] },
      { title: "Stranger Things", description: "A group of kids encounter supernatural forces and secret government exploits.", genre: ["Sci-Fi", "Horror", "Drama"], type: "series", year: 2016, imdbRating: 8.7, trending: true, newRelease: true, posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", language: "English", director: "Duffer Brothers", cast: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"] },
      { title: "The Dark Knight", description: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy.", genre: ["Action", "Crime", "Drama"], type: "movie", year: 2008, imdbRating: 9.0, duration: "2h 32m", trending: true, posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg", language: "English", director: "Christopher Nolan", cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"] },
      { title: "Money Heist", description: "A criminal mastermind who goes by 'The Professor' recruits a band of thieves.", genre: ["Crime", "Drama", "Thriller"], type: "series", year: 2017, imdbRating: 8.2, newRelease: true, posterUrl: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkipeJt2fmdomeo.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/gFk9lIW6mCIssuthpUoMSykMuDI.jpg", language: "Spanish", director: "Álex Pina", cast: ["Álvaro Morte", "Úrsula Corberó", "Itziar Ituño"] },
      { title: "Avengers: Endgame", description: "The Avengers assemble once more to reverse Thanos's actions and restore order.", genre: ["Action", "Sci-Fi", "Adventure"], type: "movie", year: 2019, imdbRating: 8.4, duration: "3h 2m", newRelease: true, posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", language: "English", director: "Anthony Russo", cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"] }
    ];
    await Movie.insertMany(sample);
    res.json({ message: `Seeded ${sample.length} movies` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
