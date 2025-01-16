const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/signup", userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.use(authMiddleware.isAuthenticated);

router.get("/profile", userController.getProfile);

// Routes for password reset functionality
router.post("/forgot-password", userController.forgotPassword); // Route to request a password reset
router.post("/verify-code", userController.verifyCode); // Route to verify the code
router.patch("/reset-password", userController.resetPassword); // Route to reset the password

module.exports = router;
