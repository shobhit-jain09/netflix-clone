const router = require("express").Router();
const Movie  = require("../models/Movie");

// GET /api/search?q=batman
router.get("/", async (req, res) => {
  try {
    const { q, genre, type } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const filter = { $text: { $search: q } };
    if (genre) filter.genre = genre;
    if (type)  filter.type  = type;
    const movies = await Movie.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(20);
    res.json(movies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
