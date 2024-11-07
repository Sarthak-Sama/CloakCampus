module.exports.authVerify = (req, res, next) => {
  try {
    if (req.user) {
      return res.status(200).json({ message: "Valid Auth Token" });
    } else {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth verification error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
