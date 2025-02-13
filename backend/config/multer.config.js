const multer = require("multer");
const path = require("path");

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Append timestamp to filename to ensure uniqueness
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Video uploads not allowed."), false);
  }
};

// Configure Multer with storage, limits, and fileFilter
const upload = multer({
  storage,
  limits: {
    fileSize: 12 * 1024 * 1024, // Maximum file size: 12 MB
    files: 10, // Maximum number of files
  },
  fileFilter,
}).fields([{ name: "image" }]); // Only accept the "image" field

// Error handling middleware for Multer errors
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File is too large. Maximum size is 16MB." });
    }
  }
  // If fileFilter produced an error (like "Video uploads not allowed")
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, multerErrorHandler };
