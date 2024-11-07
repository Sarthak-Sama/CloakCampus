const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const indexRoutes = require("./routes/index.routes");
const adminRoutes = require("./routes/admin.routes");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("./config/passport.config");

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
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
app.use("/post", postRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
