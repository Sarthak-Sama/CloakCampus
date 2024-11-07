import axios from "axios";

const signup = async (email, password) => {
  try {
    await axios.post("https://anonymousforumapp.onrender.com/user/signup", {
      email,
      password,
    });
    return { success: true }; // Return success and data on success
  } catch (error) {
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    }; // Return failure and error message
  }
};

const login = async (email, password, toRemember) => {
  console.log("login func running");
  try {
    await axios.post("https://anonymousforumapp.onrender.com/user/login", {
      email,
      password,
      toRemember,
    });
    if (toRemember) {
      console.log("remeber is true");
    } else {
      console.log("rem is false");
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      errorMessage: error.response?.data.message || "Something went wrong",
    };
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://anonymousforumapp.onrender.com/user/verify-otp",
      {
        email,
        otp,
      }
    );
    return { success: true };
  } catch (error) {
    console.log(error);
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
