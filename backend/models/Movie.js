const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  genre:       [{ type: String }],
  type:        { type: String, enum: ["movie", "series"], default: "movie" },
  year:        { type: Number },
  rating:      { type: String, enum: ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A"], default: "U/A 13+" },
  imdbRating:  { type: Number, min: 0, max: 10 },
  duration:    { type: String },
  posterUrl:   { type: String },
  backdropUrl: { type: String },
  trailerUrl:  { type: String },
  videoUrl:    { type: String },
  tmdbId:      { type: Number },
  language:    { type: String, default: "English" },
  cast:        [{ type: String }],
  director:    { type: String },
  featured:    { type: Boolean, default: false },
  trending:    { type: Boolean, default: false },
  newRelease:  { type: Boolean, default: false },
  seasons: [{
    number:   Number,
    episodes: [{
      number:   Number,
      title:    String,
      duration: String,
      videoUrl: String
    }]
  }],
  views:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

movieSchema.index({ title: "text", description: "text", genre: "text" });

module.exports = mongoose.model("Movie", movieSchema);
