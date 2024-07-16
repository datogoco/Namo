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
    maxlength: [15, "A user name must be less or equal than 15 characters"],
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
  passwordHash: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.passwordHash = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
