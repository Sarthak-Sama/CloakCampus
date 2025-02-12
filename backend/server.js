const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const indexRoutes = require("./routes/index.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://o8psy3-ip-202-41-10-109.tunnelmole.net",
      "https://w5r1vrkq-3000.inc1.devtunnels.ms",
      "https://cloak-campus.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // Allow cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
const connectDB = require("./config/mongodb.config");
connectDB();

// Connect to Redis
const {
  redisClient,
  loadAllowedDomainsToCache,
  loadRandomUsernamesToCache,
  loadRandomPfpsToCache,
} = require("./config/redisClient.config");
redisClient.connect();

// loadAllowedDomainsToCache();
// loadRandomUsernamesToCache();
// loadRandomPfpsToCache();

setInterval(() => {
  loadRandomUsernamesToCache();
  loadRandomPfpsToCache();
}, 1000 * 60 * 60 * 12); // Update cache every 12 hours

// Routes
app.use("/", indexRoutes);
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
