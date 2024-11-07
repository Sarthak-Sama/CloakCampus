import axios from "axios";
import Cookies from "js-cookie";

const isAuthenticated = async () => {
  // Get the token from sessionStorage or cookies
  const token = sessionStorage.getItem("token") || Cookies.get("token");

  if (!token) return false; // No token, so not authenticated

  try {
    // Send the token to the backend for verification
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/auth/verify",
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
    await axios.post("https://anonymousforumapp.onrender.com/user/signup", {
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
const login = async (email, password, toRemember) => {
  try {
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/user/login",
      {
        email,
        password,
        toRemember,
      }
    );
    const token = response.data.token; // assuming the token is in response.data.token
    sessionStorage.setItem("token", token); // Store the token in session storage
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    };
  }
};

// OTP Verification function
const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/user/verify-otp",
      {
        email,
        otp,
      }
    );
    const token = response.data.token; // assuming the token is in response.data.token
    sessionStorage.setItem("token", token); // Store the token in session storage
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
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/forgotPassword",
      {
        email,
      }
    );
    console.log(response.data); // The response will indicate that the verification code has been sent
  } catch (error) {
    console.error("Password reset failed:", error.response.data);
  }
};

// // To store the JWT in cookies (already done by the backend automatically)
// document.cookie = `token=${response.data.token}`;

const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/resetPassword",
      {
        email,
        newPassword,
      }
    );
    console.log(response.data); // Success message after password reset
  } catch (error) {
    console.error("Password reset failed:", error.response.data);
  }
};

// To send the JWT in the headers when making a protected request
const getProfile = async () => {
  const token = document.cookie.split("=")[1]; // Extract token from cookie

  try {
    const response = await axios.get(
      "https://anonymousforumapp.onrender.com/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token as a Bearer token in the Authorization header
        },
      }
    );
    console.log(response.data); // The profile data returned from the backend
  } catch (error) {
    console.error("Failed to get profile:", error.response.data);
  }
};

export { signup, login, verifyOtp, forgotPassword, resetPassword, getProfile };
