const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const blackListModel = require("../models/blacklist.model");
const cookieParser = require("cookie-parser");

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Check if token is blacklisted
    let isBlackListed = await blackListModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by decoded ID
    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is blacklisted
    if (user.isBlacklisted) {
      return res.status(403).json({ message: "User is blacklisted" });
    }

    // Attach user to request object
    req.user = user;

    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or malformed token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }

    // General error handling
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized, admin access required" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
