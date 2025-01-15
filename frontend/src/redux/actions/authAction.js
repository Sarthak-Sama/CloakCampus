import { loginUser, logoutUser } from "../reducers/authSlice";
import axios from "../../utils/axios";
import Cookies from "js-cookie";

const isAuthenticated = async () => {
  // Get the token from sessionStorage or cookies
  const token = sessionStorage.getItem("token") || Cookies.get("token");

  if (!token) return false; // No token, so not authenticated

  try {
    // Send the token to the backend for verification
    const response = await axios.post(
      "/auth/verify",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in Authorization header
        },
      }
    );

    return response.status === 200; // Return true if verified
  } catch (error) {
    console.error("Token verification failed:", error);
    return false; // Token invalid or request failed
  }
};

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
    dispatch(loginUser());
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
  Cookies.remove("token");

  // Dispatch logoutUser action to update the Redux state
  dispatch(logoutUser());
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
    dispatch(loginUser());
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

// To send the JWT in the headers when making a protected request
const getProfile = async () => {
  const token = document.cookie.split("=")[1]; // Extract token from cookie

  try {
    const response = await axios.get("/profile", {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token as a Bearer token in the Authorization header
      },
    });
  } catch (error) {
    console.error("Failed to get profile:", error.response.data);
  }
};

export {
  isAuthenticated,
  signup,
  login,
  logout,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getProfile,
};
