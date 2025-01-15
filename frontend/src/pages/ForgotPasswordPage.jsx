import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../redux/actions/authAction"; // Assuming this action exists
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RiCloseLine, RiCrossLine } from "@remixicon/react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setMessage(""); // Clear previous messages
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setMessage("A password reset link has been sent to your email.");
        setEmail("");
      } else {
        setError(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      console.error(err);
    } finally {
      navigate(`${location.pathname}/verify-otp#password`, {
        state: { email },
      });
      setLoading(false);
    }
  };

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
          Forgot Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Enter your email address to receive the verification code.
        </p>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
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
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default ForgotPasswordPage;
