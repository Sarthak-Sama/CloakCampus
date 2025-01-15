import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, resetPassword } from "../redux/actions/authAction"; // Assuming this action exists
import { RiCloseLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useDispatch } from "react-redux";

const PasswordResetPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [passwordStrength, setPasswordStrength] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state.email;
  const isVerified = location.state.isVerified;

  // Password strength check
  const checkPasswordStrength = (password) => {
    const strength = {
      veryWeak: /^(?=.*[a-z]).{6,}$/, // Must contain at least one lowercase letter and be 6+ characters
      weak: /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/, // Must contain both lowercase and uppercase letters
      strong:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/-]).{8,}$/, // Must contain lowercase, uppercase, digits, special characters, and be 8+ characters
      veryStrong:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/-]).{12,}$/, // Must contain at least 12 characters, lowercase, uppercase, digits, and special characters
    };

    if (strength.strong.test(password)) {
      setPasswordStrength("Strong");
    } else if (strength.weak.test(password)) {
      setPasswordStrength("Weak");
    } else if (strength.veryWeak.test(password)) {
      setPasswordStrength("Very Weak");
    } else if (strength.veryStrong.test(password)) {
      setPasswordStrength("Very Strong");
    } else {
      setPasswordStrength("");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "newPassword") {
      setNewPassword(value);
      checkPasswordStrength(value);
    }
    if (id === "confirmPassword") setConfirmPassword(value);
    setMessage(""); // Clear previous messages
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(email, newPassword);

      if (response.success) {
        setMessage("Your password has been reset successfully.");
        setTimeout(() => logout(dispatch, navigate), 3000); // Redirect to login after success
      } else {
        setError(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isVerified) {
      navigate("/forgot-password");
    }
  }, [isVerified]);

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-[#EDEDED] dark:bg-black">
      <RiCloseLine
        size={50}
        color="#EDEDED"
        className="absolute opacity-50 hover:opacity-100 left-5 top-5"
        onClick={() => {
          navigate("/profile");
        }}
      />
      <div className="h-screen sm:h-fit flex flex-col justify-center bg-white dark:bg-[#161616] p-8 shadow-lg rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-center">
          Reset Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Enter your new password below.
        </p>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ea516f] focus:border-[#ea516f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute right-2 top-1 text-gray-600"
              >
                {showPassword ? (
                  <RiEyeOffLine className="mt-1" />
                ) : (
                  <RiEyeLine className="mt-1" />
                )}
                {/* Show/Hide Password */}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ea516f] focus:border-[#ea516f]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg shadow transition duration-300 ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#ea516f] text-white dark:text-[#161616] hover:bg-[#dd4964]"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
