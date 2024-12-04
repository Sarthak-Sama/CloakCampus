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

    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Fetch a random username from the API
    try {
      // Fetch random usernames from the API once
      const response = await axios.get(
        "https://usernameapiv1.vercel.app/api/random-usernames"
      );
      const usernames = response.data.usernames; // List of random usernames
      let index = 0; // Start from the first index

      while (true) {
        const username = usernames[index]; // Get the username at the current index

        // Check if the username already exists in the database
        const existingUser = await userModel.findOne({ username });

        if (!existingUser) {
          // If the username is unique, break the loop
          break;
        }

        // If username already exists, move to the next index
        index++;

        // If we've exhausted all the usernames in the list, break the loop
        if (index >= usernames.length) {
          throw new Error(
            "Unable to find a unique username after trying all fetched usernames"
          );
        }
      }
    } catch (error) {
      next(error);
    }

    // Get a random image for profile picture
    // Generate a random image ID
    const max = 10000; // Set your max value for image ID
    const maxRetries = 20; // Set max number of retires
    let profileImageResponse;
    let retries = 0;

    // Re-request the image until a valid (200) response is returned
    while (retries < maxRetries) {
      try {
        let imageID = Math.floor(Math.random() * max);
        profileImageResponse = await axios.get(
          `https://api.nekosapi.com/v3/images/${imageID}`
        );
        if (
          profileImageResponse.status === 200 &&
          profileImageResponse.data?.url
        ) {
          const existingUser = await userModel.findOne({
            profilePictureSrc: profileImageResponse.data.url,
          });
          if (!existingUser) {
            break; // Break out of the loop if the response status is 200 and the url is unique
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If the status code is 404, generate a new imageID and try again
          retries++;
        } else {
          // If there's another error, log it and break the loop
          next(err);
          break;
        }
      }
    }

    if (!profileImageResponse) {
      throw new Error("Unable to fetch a unique profile image after retries.");
    }

    const university = isValidDomain.university;

    const user = await userModel.create({
      email,
      password: hashedPassword,
      username, // Use the fetched username
      profilePictureSrc: profileImageResponse,
      university, // isValidDomain stores the University name and domain.
      otp, // Store the OTP temporarily
      isVerified: false, // Track if the email is verified
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    // Respond with a message to check email for OTP
    res.status(201).json({
      message:
        "User created successfully. Please check your email for the OTP.",
      user,
    });
  } catch (error) {
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
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      if (!user.isVerified) {
        // Check if the email is verified
        return res.status(403).json({ message: "Email not verified" });
      }

      try {
        // Generate a random username
        const usernamesResponse = await axios.get(
          "https://usernameapiv1.vercel.app/api/random-usernames"
        );
        const usernames = usernamesResponse.data.usernames;
        let usernameIndex = 0;

        // Loop to get a unique username
        while (true) {
          const username = usernames[usernameIndex];

          // Check if the username is unique
          const existingUser = await userModel.findOne({ username });
          if (!existingUser) {
            user.username = username; // Update the username
            break;
          }

          usernameIndex++;

          // If we've tried all usernames, throw an error
          if (usernameIndex >= usernames.length) {
            throw new Error(
              "Unable to find a unique username after trying all fetched usernames"
            );
          }
        }

        // Generate a random profile picture
        const max = 10000;
        const maxRetries = 20;
        let profileImageResponse;
        let retries = 0;

        // Loop to get a unique profile picture
        while (retries < maxRetries) {
          try {
            let imageID = Math.floor(Math.random() * max);
            profileImageResponse = await axios.get(
              `https://api.nekosapi.com/v3/images/${imageID}`
            );

            if (
              profileImageResponse.status === 200 &&
              profileImageResponse.data?.url
            ) {
              const existingUser = await userModel.findOne({
                profilePictureSrc: profileImageResponse.data.url,
              });

              if (!existingUser) {
                user.profilePictureSrc = profileImageResponse.data.url; // Update the profile picture
                break;
              }
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              retries++;
            } else {
              next(error);
              break;
            }
          }
        }

        if (!profileImageResponse) {
          throw new Error(
            "Unable to fetch a unique profile image after retries."
          );
        }

        // Save the updated user with the new username and profile picture
        await user.save();
      } catch (error) {
        return next(error);
      }

      // Create JWT token with expiration
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }); // Token valid for 7 days

      // Check if toRemember is true and set the token in a cookie accordingly
      const { toRemember } = req.body; // Extract toRemember from request body
      if (toRemember) {
        res.cookie("token", token, {
          httpOnly: true, // Prevents JavaScript access
          // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "Strict", // Helps prevent CSRF
        });
      }

      res.status(200).json({
        message: "User signed in successfully",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      });
    }
  )(req, res, next);
};

module.exports.logout = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      console.log("Headers");
    }
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.token;
    console.log(req.cookies.token);
    console.log(token);
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

module.exports.getProfile = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      message: "Profile data",
      user,
    });
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
