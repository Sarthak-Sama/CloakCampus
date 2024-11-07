import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, signup } from "../utils/handlingUsers";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Stores each digit of OTP
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(60); // Countdown timer for OTP expiry
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Get the navigation object
  const { email, password } = location.state || {}; // Retrieve email and password from state

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return; // Prevent non-numeric input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus the next input if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP submission
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrorMessage("Please enter the complete OTP.");
      return;
    }

    const response = await verifyOtp(email, otpString);
    if (response.success) {
      setIsVerified(true);
      navigate("/");
    } else {
      response.errorMessage && setErrorMessage(response.errorMessage);
    }
  };

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown === 0) {
      setIsResendDisabled(false);
      return;
    }

    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Handle OTP resend
  const handleResendOtp = async () => {
    setCountdown(30);
    setIsResendDisabled(true);
    setOtp(["", "", "", "", "", ""]);
    setIsVerified(false);
    setErrorMessage("");

    // Resend the otp by signing up the user once again
    await signup(email, password);
  };

  return (
    <div className="h-screen w-screen bg-[rgb(0,0,0,0.4)] absolute flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          OTP Verification
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
              className="w-12 h-12 text-xl text-center border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
