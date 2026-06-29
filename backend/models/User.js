const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const profileSchema = new mongoose.Schema({
  name:   { type: String, required: true, maxlength: 20 },
  avatar: { type: String, default: "default" },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
  continueWatching: [{
    movie:     { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    progress:  { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }]
});

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  plan:     { type: String, enum: ["basic", "standard", "premium"], default: "basic" },
  isAdmin:  { type: Boolean, default: false },
  profiles: { type: [profileSchema], default: [] },
  activeProfile: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
