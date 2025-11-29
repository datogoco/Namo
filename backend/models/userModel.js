const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const slugify = require("slugify");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    unique: true,
    trim: true,
    maxlength: [30, "A user name must be less or equal than 30 characters"],
    minlength: [4, "A user name must be more or equal than 4 characters"],
  },
  slug: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
    required: [true, "Please provide your email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
});

// Middleware to hash password before saving and create slug
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // If the name was modified, generate a slug
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }

  next();
});

// Instance method to compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
