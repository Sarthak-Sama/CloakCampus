const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Domain = require("../models/domain.model");
const axios = require("axios");
const blackListModel = require("../models/blacklist.model");

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
    const isValidDomain = await Domain.findOne({ domain: emailDomain });
    if (!isValidDomain) {
      return res.status(403).json({
        message: "Email domain not allowed. Please use a valid email.",
      });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

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
    let username = defaultUsername;
    try {
      const response = await axios.get(
        "https://usernameapiv1.vercel.app/api/random-usernames",
        { timeout: 5000 }
      );
      const usernames = response.data.usernames;
      username =
        usernames.find(async (name) => {
          const existingUser = await userModel.findOne({ username: name });
          return !existingUser;
        }) || defaultUsername;
    } catch (error) {
      console.error("Failed to fetch username:", error.message);
    }

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
    const user = await userModel.create({
      email,
      password: hashedPassword,
      username,
      profilePictureSrc,
      university: isValidDomain,
      otp, // Store the OTP temporarily
    });

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

  user.isVerified = true; // Mark the email as verified
  user.otp = undefined; // Clear the OTP
  await user.save();

  // Create JWT token with expiration
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }); // Token valid for 7 days

  // Set the token in a cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript access
    // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "Strict", // Helps prevent CSRF
  });

  // Log the user in by creating a JWT token
  res.status(200).json({
    message: "Email verified successfully. You are now logged in.",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
};

module.exports.login = async (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err); // Ensure that no further code is executed after the error is handled
      }
      if (!user) {
        return res.status(401).json({ message: info.message }); // Return after sending response
      }
      if (!user.isVerified) {
        return res.status(403).json({ message: "Email not verified" }); // Return after sending response
      }

      // let usernameUpdated = false;
      // let profilePictureUpdated = false;

      // try {
      //   // Generate a random username
      //   const usernamesResponse = await axios.get(
      //     "https://usernameapiv1.vercel.app/api/random-usernames"
      //   );
      //   const usernames = usernamesResponse.data.usernames;
      //   let usernameIndex = 0;

      //   while (usernameIndex < usernames.length) {
      //     const username = usernames[usernameIndex];
      //     const existingUser = await userModel.findOne({ username });

      //     if (!existingUser) {
      //       user.username = username; // Update the username
      //       usernameUpdated = true;
      //       break;
      //     }
      //     usernameIndex++;
      //   }

      //   // Generate a random profile picture
      //   const max = 10000;
      //   const maxRetries = 20;
      //   let profileImageResponse;
      //   let retries = 0;

      //   while (retries < maxRetries) {
      //     try {
      //       let imageID = Math.floor(Math.random() * max);
      //       profileImageResponse = await axios.get(
      //         `https://api.nekosapi.com/v3/images/${imageID}`
      //       );

      //       if (
      //         profileImageResponse.status === 200 &&
      //         profileImageResponse.data?.url
      //       ) {
      //         const existingUser = await userModel.findOne({
      //           profilePictureSrc: profileImageResponse.data.image_url,
      //         });

      //         if (!existingUser) {
      //           user.profilePictureSrc = profileImageResponse.data.image_url; // Update the profile picture
      //           profilePictureUpdated = true;
      //           break;
      //         }
      //       }
      //     } catch (error) {
      //       if (error.response && error.response.status === 404) {
      //         retries++;
      //       } else {
      //         return next(error); // Return after handling error
      //       }
      //     }
      //   }

      //   // Save the user if any updates were made
      //   if (usernameUpdated || profilePictureUpdated) {
      //     await user.save();
      //   }
      // } catch (error) {
      //   return next(error); // Return after handling error
      // }

      // Create JWT token with expiration
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }); // Token valid for 7 days

      // Check if toRemember is true and set the token in a cookie accordingly
      const { toRemember } = req.body; // Extract toRemember from request body
      if (toRemember) {
        res.cookie("token", token, {
          httpOnly: true, // Prevents JavaScript access
          secure: false, // You can enable this in production by setting secure to true
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "Strict", // Helps prevent CSRF
        });
      }

      // Final response after all operations
      return res.status(200).json({
        message: "User signed in successfully",
        user: {
          _id: user._id,
          username: user.username, // Existing or newly set username
          email: user.email,
          profilePictureSrc: user.profilePictureSrc, // Existing or newly set profile picture
        },
        token,
      });
    }
  )(req, res, next);
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
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Populate the 'university' field using async/await
      const userData = await userModel
        .findById(user._id)
        .populate("university");

      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile data",
        user: userData, // Respond with the populated user data
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

// New function for forgot password
module.exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate a random verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString(); // 6-digit code
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
