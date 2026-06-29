const router = require("express").Router();
const Movie  = require("../models/Movie");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/movies  — paginated list with filters
router.get("/", async (req, res) => {
  try {
    const { genre, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (type)  filter.type  = type;
    const movies = await Movie.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Movie.countDocuments(filter);
    res.json({ movies, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/movies/featured
router.get("/featured", async (req, res) => {
  try {
    const movie = await Movie.findOne({ featured: true }).sort({ createdAt: -1 });
    res.json(movie);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/movies/trending
router.get("/trending", async (req, res) => {
  try {
    const movies = await Movie.find({ trending: true }).limit(20);
    res.json(movies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/movies/new
router.get("/new", async (req, res) => {
  try {
    const movies = await Movie.find({ newRelease: true }).sort({ createdAt: -1 }).limit(20);
    res.json(movies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/movies/genres
router.get("/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genre");
    res.json(genres);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/movies/:id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    await Movie.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(movie);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/movies  — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/movies/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/movies/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Movie deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
