const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const indexRoutes = require("./routes/index.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("./config/passport.config");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://p652kfhs-3000.inc1.devtunnels.ms",
      "https://your-production-domain.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // Allow cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Connect to MongoDB
const connectDB = require("./config/mongodb.config");
connectDB();

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
