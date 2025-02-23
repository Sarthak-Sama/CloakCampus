import { loginUser, logoutUser } from "../reducers/authSlice";
import axios from "../../utils/axios";
import { loadUser } from "../reducers/userSlice";
import { fetchUser } from "./userAction";

// Signup function
const signup = async (email, password) => {
  try {
    await axios.post("/user/signup", {
      email,
      password,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    };
  }
};

// Login function
const login = async (email, password, toRemember, dispatch) => {
  try {
    const response = await axios.post("/user/login", {
      email,
      password,
      toRemember,
    });
    const token = response.data.token; // assuming the token is in response.data.token
    sessionStorage.setItem("token", token); // Store the token in session storage
    // Dispatch logoutUser action to update the Redux state
    const userData = {
      _id: response.data.user._id,
      profilePictureSrc: response.data.user.profilePictureSrc,
      username: response.data.user.username,
      email: response.data.user.email,
      university: response.data.user.university.universityName,
      categories: response.data.user.university.universityCategories,
      createdAt: response.data.user.createdAt,
    };
    dispatch(loadUser(userData));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    };
  }
};

// Logout function (Handles token removal and dispatching the logout action)
const logout = async (dispatch, navigate) => {
  try {
    // Send the req to backend to blacklist the JWT
    await axios.post("/user/logout");
  } catch (error) {
    console.log("Error occurred while logging out: " + error);
  }

  // Remove the token from sessionStorage or cookies
  sessionStorage.removeItem("token");

  // Dispatch logoutUser action to update the Redux state
  dispatch(loadUser(null));
  navigate("/auth");
};

// OTP Verification function
const verifyOtp = async (email, otp, dispatch) => {
  try {
    const response = await axios.post("/user/verify-otp", {
      email,
      otp,
    });
    const token = response.data.token; // assuming the token is in response.data.token
    sessionStorage.setItem("token", token); // Store the token in session storage
    const userData = {
      _id: response.data.user._id,
      profilePictureSrc: response.data.user.profilePictureSrc,
      username: response.data.user.username,
      email: response.data.user.email,
      university: response.data.user.university.universityName,
      categories: response.data.user.university.universityCategories,
      createdAt: response.data.user.createdAt,
    };
    dispatch(loadUser(userData));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    };
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post("/user/forgot-password", {
      email,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Password reset failed:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// // To store the JWT in cookies (already done by the backend automatically)
// document.cookie = `token=${response.data.token}`;

const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.patch("/user/reset-password", {
      email,
      newPassword,
    });
    return { success: true, data: response.data }; // Success message after password reset
  } catch (error) {
    console.error("Password reset failed:", error.response.data);
  }
};

export { signup, login, logout, verifyOtp, forgotPassword, resetPassword };
