const multer = require("multer");
const path = require("path"); // Import path module
const sharp = require("sharp"); // Import sharp for image compression
const ffmpeg = require("fluent-ffmpeg"); // Import fluent-ffmpeg for video compression
const fs = require("fs"); // Import fs to handle file system

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

// Add limits to the multer upload
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 16 * 1024 * 1024 } // Set maximum file size to 16MB
}).fields([{ name: 'image' }, { name: 'video' }]); // Allow both image and video uploads

// Middleware to compress images and videos
const compressFiles = async (req, res, next) => {
    if (req.files['image']) {
        await Promise.all(req.files['image'].map(async (file) => {
            const outputPath = file.path.replace(path.extname(file.originalname), '-compressed' + path.extname(file.originalname));
            await sharp(file.path)
                .resize(1000) // Resize to width of 1000px, maintain aspect ratio
                .toFile(outputPath); // Save compressed image
            fs.unlinkSync(file.path); // Remove original file
            file.path = outputPath; // Update file path to compressed file
        }));
    }

    if (req.files['video']) {
        await Promise.all(req.files['video'].map(async (file) => {
            const outputPath = file.path.replace(path.extname(file.originalname), '-compressed.mp4');
            await new Promise((resolve, reject) => {
                ffmpeg(file.path)
                    .outputOptions('-preset fast') // Set preset for faster processing
                    .outputOptions('-crf 28') // Set constant rate factor for quality
                    .toFormat('mp4') // Convert to mp4 format
                    .save(outputPath)
                    .on('end', () => {
                        fs.unlinkSync(file.path); // Remove original file
                        file.path = outputPath; // Update file path to compressed file
                        resolve();
                    })
                    .on('error', (err) => reject(err));
            });
        }));
    }
    next();
};

// Error handling middleware for Multer
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File is too large. Maximum size is 16MB.' });
        }
    }
    next(err); // Pass the error to the next middleware if it's not a Multer error
};

module.exports = { upload, compressFiles, multerErrorHandler }; // Export both upload, compressFiles, and multerErrorHandler