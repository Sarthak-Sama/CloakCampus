const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
  },
  profilePictureSrc: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    // for password resetting
    type: String,
    required: false,
  },
  codeExpiration: {
    // for password resetting
    type: Date,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
