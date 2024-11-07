const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

module.exports.authVerify = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Valid Auth Token" });
  } catch (error) {
    console.error("Auth verification error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
