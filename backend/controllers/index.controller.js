module.exports.authVerify = async (req, res, next) => {
  try {
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ message: "Valid Auth Token" });
  } catch (error) {
    console.error("Auth verification error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
