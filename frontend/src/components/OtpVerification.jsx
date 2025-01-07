import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtp, signup, forgotPassword } from "../redux/actions/authAction";
import axios from "../utils/axios";

const OTPVerification = ({ isPasswordResetFlow = false }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const password = location.state?.password;

  if (location.hash.slice(1) === "password") isPasswordResetFlow = true;

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrorMessage("Please enter the complete OTP.");
      return;
    }

    try {
      if (isPasswordResetFlow) {
        const response = await axios.post("/user/verify-code", {
          email,
          code: otpString,
        });
        if (response.status === 200) {
          setIsVerified(true);
          navigate("/reset-password", { state: { email, isVerified: true } });
          console.log("/reset-password");
        } else {
          setErrorMessage(response.data.message || "OTP verification failed.");
        }
      } else {
        const response = await verifyOtp(email, otpString, dispatch);
        if (response.success) {
          setIsVerified(true);
          navigate("/");
        } else {
          setErrorMessage(response.errorMessage || "OTP verification failed.");
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setIsResendDisabled(false);
      return;
    }
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle OTP resend
  const handleResendOtp = async () => {
    setCountdown(30);
    setIsResendDisabled(true);
    setOtp(["", "", "", "", "", ""]);
    setIsVerified(false);
    setErrorMessage("");

    try {
      if (isPasswordResetFlow) {
        await forgotPassword(email);
      } else {
        await signup(email, password);
      }
    } catch {
      setErrorMessage("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen bg-[rgb(0,0,0,0.4)] absolute flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isPasswordResetFlow
            ? "Reset Password OTP"
            : "Signup OTP Verification"}
        </h2>

        <div className="flex justify-between space-x-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e, index)}
              className="w-12 h-12 text-xl text-center border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#EA516F]"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm text-center mb-4">
            {errorMessage}
          </div>
        )}

        {!isVerified ? (
          <button
            onClick={handleVerifyOtp}
            className="w-full py-2 bg-[#EA516F] text-white font-semibold rounded-md hover:bg-[#EA516F] focus:outline-none focus:ring-2 focus:ring-[#EA516F]"
          >
            Verify OTP
          </button>
        ) : (
          <div className="text-green-500 text-center mt-4">
            OTP Verified Successfully!
          </div>
        )}

        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <span className="text-gray-500">Resend OTP in {countdown}s</span>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isResendDisabled}
              className={`py-2 px-4 mt-2 text-sm rounded-md focus:outline-none ${
                isResendDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#EA516F] text-white hover:bg-[#EA516F]"
              }`}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
