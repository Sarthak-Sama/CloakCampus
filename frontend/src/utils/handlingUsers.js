import axios from "axios";

const signup = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5000/signup", {
      email,
      password,
    });
    console.log(response.data); // This is the response from the server
  } catch (error) {
    console.error("There was an error during signup:", error.response.data);
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5000/login", {
      email,
      password,
    });
    console.log(response.data); // The response will include a success message and JWT token if login is successful
  } catch (error) {
    console.error("Login failed:", error.response.data);
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post("http://localhost:5000/verifyOtp", {
      email,
      otp,
    });
    console.log(response.data); // The response will indicate whether the OTP verification was successful
  } catch (error) {
    console.error("OTP verification failed:", error.response.data);
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post("http://localhost:5000/forgotPassword", {
      email,
    });
    console.log(response.data); // The response will indicate that the verification code has been sent
  } catch (error) {
    console.error("Password reset failed:", error.response.data);
  }
};

// To store the JWT in cookies (already done by the backend automatically)
document.cookie = `token=${response.data.token}`;

const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post("http://localhost:5000/resetPassword", {
      email,
      newPassword,
    });
    console.log(response.data); // Success message after password reset
  } catch (error) {
    console.error("Password reset failed:", error.response.data);
  }
};

// To send the JWT in the headers when making a protected request
const getProfile = async () => {
  const token = document.cookie.split("=")[1]; // Extract token from cookie

  try {
    const response = await axios.get("http://localhost:5000/profile", {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token as a Bearer token in the Authorization header
      },
    });
    console.log(response.data); // The profile data returned from the backend
  } catch (error) {
    console.error("Failed to get profile:", error.response.data);
  }
};

export { signup, login, verifyOtp, forgotPassword, resetPassword, getProfile };
