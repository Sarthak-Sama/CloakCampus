const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const domainModel = require("../models/domain.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require("axios");
const blackListModel = require("../models/blacklist.model");
const { redisClient } = require("../config/redisClient.config");

const fetchRandomUsername = async () => {
  // Try to get a cached username from Redis
  const cachedUsername = await redisClient.sPop("randomUsernames");

  if (cachedUsername) {
    return cachedUsername; // Return the cached username if available
  }

  // If no cached username, fetch a new one from the API
  try {
    const response = await axios.get(
      "https://usernameapiv1.vercel.app/api/random-usernames"
    );
    const newUsername = response.data.usernames[0]; // Get the first username from the response
    return newUsername; // Return the newly fetched username
  } catch (error) {
    console.error("Error fetching random username:", error);
    return nulll; // Return null if an error occurs
  }
};

const fetchRandomPfps = async () => {
  // Try cached first
  const cachedPfp = await redisClient.sPop("randomPfps");
  if (cachedPfp) return cachedPfp;

  try {
    const response = await axios.get(
      `https://api.nekosapi.com/v4/images/random?rating=safe&limit=1`
    );
    return response.data[0].url;
  } catch (error) {
    console.error("Failed to fetch random img", error.message);
    return null;
  }
};

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    // Configure your email service
    service: "Gmail", // Example: Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP for email verification is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

// Function to send verification code email
const sendVerificationCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Verification Code",
    text: `Your verification code is: ${code}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing fields: ${missingFields.join(", ")}`,
      });
    }

    // Extract domain from email
    const emailDomain = email.substring(email.lastIndexOf("@"));

    // Validate email domain against the database
    const isValidDomain = await domainModel.findOne({ domain: emailDomain });
    if (!isValidDomain) {
      return res.status(403).json({
        message: "Email domain not allowed. Please use a valid email.",
      });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    const otp = crypto.randomInt(100000, 999999).toString();

    if (existingUser) {
      if (existingUser.isVerified) {
        // User already exists and is verified
        return res.status(409).json({
          message: "User already exists and is verified.",
        });
      } else {
        // User exists but is not verified
        // Update password and OTP
        existingUser.password = await bcrypt.hash(password, 10); // Hash the new password
        existingUser.otp = otp; // Update OTP
        await existingUser.save();

        // Resend OTP email
        await sendOtpEmail(email, otp);
        return res.status(200).json({
          message:
            "OTP sent to your email. Please verify your account with the new OTP.",
        });
      }
    }

    // If the user doesn't exist, create a new one
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultUsername = `User${Math.floor(100 + Math.random() * 900)}`; // Default username fallback

    // Fetch random username
    let username = (await fetchRandomUsername()) || defaultUsername;

    // Fetch profile image
    const defaultProfileImage =
      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
    let profilePictureSrc = defaultProfileImage;
    try {
      const imageID = Math.floor(Math.random() * 10000);
      const response = await axios.get(
        `https://api.nekosapi.com/v3/images/${imageID}`,
        { timeout: 5000 }
      );
      if (response.status === 200) {
        profilePictureSrc = response.data.image_url || defaultProfileImage;
      }
    } catch (error) {
      console.error("Failed to fetch profile image:", error.message);
    }

    // Create a new user record
    await userModel.create({
      email,
      password: hashedPassword,
      username,
      profilePictureSrc,
      university: isValidDomain,
      otp, // Store the OTP temporarily
    });

    isValidDomain.universityStudentCount += 1;
    await isValidDomain.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.status(201).json({
      message: "User created successfully. Please check your email for OTP.",
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
    next(error);
  }
};

// Endpoint for verifying OTP
module.exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  // Store user data in Redis with proper key and serialization
  await redisClient.set(
    `user:email:${user.email}`,
    JSON.stringify(user.toJSON())
  );

  // Create JWT token with expiration
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }); // Token valid for 7 days

  // Set the token in a cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "Lax", // Helps prevent CSRF
  });

  // Log the user in by creating a JWT token
  res.status(200).json({
    message: "Email verified successfully. You are now logged in.",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePictureSrc: user.profilePictureSrc,
      university: user.university,
      isAdmin: user.isAdmin,
      isBlacklisted: user.isBlacklisted,
    },
    token,
  });
};

// Endpoint to login via cookie
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Extract domain from the email
    const emailDomain = email.split("@")[1];
    // Check if the domain is in the allowed domains set in Redis
    const isAllowedDomain = await redisClient.sIsMember(
      "allowed_domains",
      emailDomain
    );
    if (!isAllowedDomain) {
      return res.status(400).json({
        message: "Your university is not yet avaiable on CloakCampus.",
      });
    }

    // First check Redis cache using email
    let userData = await redisClient.get(`user:email:${email}`);
    let user;

    if (userData) {
      // User found in cache
      user = JSON.parse(userData);
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      // Not in cache, check database
      user = await userModel.findOne({ email }).populate("university");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store in Redis with both ID and email keys
      userData = JSON.stringify(user.toJSON());
      await Promise.all([redisClient.set(`user:email:${email}`, userData)]);
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    // Fetching a Random Username
    const newUsername = await fetchRandomUsername();

    //Fetching a Random Profile Picture
    let attempts = 0;
    const maxAttempts = 5;
    let newPfp;
    let pfpExists;
    do {
      newPfp = await fetchRandomPfps();
      attempts++;
      // Check if pfp already exists
      pfpExists = await userModel.findOne({ profilePictureSrc: newPfp });
    } while (!!pfpExists || attempts < maxAttempts);

    // Updating the new Username and Profile Picture
    user.username = newUsername && newUsername;
    user.profilePictureSrc = newPfp && newPfp;
    if (user instanceof mongoose.Document) {
      await user.save();
    } else {
      await userModel.findByIdAndUpdate(user._id, {
        username: newUsername,
        profilePictureSrc: newPfp,
      });
    }

    // Create JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Handle remember me functionality
    const { toRemember } = req.body;
    if (toRemember) {
      res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "Lax", // Helps prevent CSRF
      });
    }

    return res.status(200).json({
      message: "User signed in successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePictureSrc: user.profilePictureSrc,
        university: user.university,
        isAdmin: user.isAdmin,
        isBlacklisted: user.isBlacklisted,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "No token provided",
      });
    }

    // Add token to blacklist (token-based invalidation)
    await blackListModel.create({ token });

    res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user._id;

    // Try to get user data from Redis cache
    const cachedUser = await redisClient.get(`user:${userId}`);

    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      delete user.password; // Remove password field
      return res.status(200).json({
        message: "Profile data (from cache)",
        user,
      });
    }

    // If somehow not in cache (fallback), fetch from database
    const userData = await userModel
      .findById(userId)
      .populate("university")
      .select("-password");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile data",
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// New function for forgot password
module.exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate a random verification code
  const verificationCode = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  user.verificationCode = verificationCode;
  user.codeExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
  await user.save();

  // Send the verification code via email
  await sendVerificationCode(email, verificationCode);

  res.status(200).json({ message: "Verification code sent to your email." });
};

// New function for verifying the code
module.exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;
  const user = await userModel.findOne({ email });

  if (
    !user ||
    user.verificationCode !== code ||
    Date.now() > user.codeExpiration
  ) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification code" });
  }

  // Code is valid, allow user to reset password
  res.status(200).json({
    message: "Verification code is valid. You can now reset your password.",
  });
};

// New function for resetting the password
module.exports.resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.verificationCode = undefined; // Clear the verification code
  user.codeExpiration = undefined; // Clear the expiration time
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully." });
};
