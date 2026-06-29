const router = require("express").Router();
const User   = require("../models/User");
const { protect } = require("../middleware/auth");

// GET /api/users/profiles
router.get("/profiles", protect, (req, res) => res.json(req.user.profiles));

// POST /api/users/profiles
router.post("/profiles", protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (req.user.profiles.length >= 5) return res.status(400).json({ message: "Max 5 profiles allowed" });
    req.user.profiles.push({ name, avatar: avatar || "default" });
    await req.user.save();
    res.status(201).json(req.user.profiles);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/profiles/:profileId
router.delete("/profiles/:profileId", protect, async (req, res) => {
  try {
    req.user.profiles = req.user.profiles.filter(p => p._id.toString() !== req.params.profileId);
    await req.user.save();
    res.json(req.user.profiles);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/watchlist
router.get("/watchlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("profiles.watchlist");
    const profile = user.profiles[user.activeProfile] || user.profiles[0];
    res.json(profile?.watchlist || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/users/watchlist/:movieId
router.post("/watchlist/:movieId", protect, async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const prof  = user.profiles[user.activeProfile] || user.profiles[0];
    const mid   = req.params.movieId;
    if (prof.watchlist.map(String).includes(mid)) {
      prof.watchlist = prof.watchlist.filter(id => id.toString() !== mid);
    } else {
      prof.watchlist.push(mid);
    }
    await user.save();
    res.json({ watchlist: prof.watchlist });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/continue/:movieId
router.put("/continue/:movieId", protect, async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findById(req.user._id);
    const prof = user.profiles[user.activeProfile] || user.profiles[0];
    const idx  = prof.continueWatching.findIndex(c => c.movie.toString() === req.params.movieId);
    if (idx >= 0) {
      prof.continueWatching[idx].progress  = progress;
      prof.continueWatching[idx].updatedAt = new Date();
    } else {
      prof.continueWatching.push({ movie: req.params.movieId, progress });
    }
    await user.save();
    res.json({ message: "Progress saved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/active-profile
router.put("/active-profile", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { activeProfile: req.body.index });
    res.json({ message: "Profile switched" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
