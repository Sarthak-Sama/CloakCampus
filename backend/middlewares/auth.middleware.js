const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const blackListModel = require("../models/blacklist.model");
const cookieParser = require("cookie-parser");

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.token;
    let isBlackListed = await blackListModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Set the user on the request object
    req.user = user;

    // Call next() to pass control to the next middleware
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    const isAdmin = req.user.isAdmin;
    if (isAdmin) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }
  } catch (error) {
    next(error);
  }
};
