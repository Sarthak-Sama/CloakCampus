import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import TermsModal from "../components/TermsAndConditions";
import { signup, login } from "../utils/handlingUsers";
import { useDispatch } from "react-redux";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1024);
  const [showTerms, setShowTerms] = useState(false); // State for showing terms modal
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [termsChecked, setTermsChecked] = useState(false); // State for terms checkbox
  const [signupErrorMessage, setSignupErrorMessage] = useState(""); // State for signup error message
  const [loginErrorMessage, setLoginErrorMessage] = useState(""); // State for login error message
  const [isLoading, setisLoading] = useState(false); // State for loading status
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms); // Toggle modal visibility
  };

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

  // Handle password input change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPassword(password);
    checkPasswordStrength(password);
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Update the button in the signup form
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setisLoading(true); // Set loading to true

    let isValid = true; // Local variable to track form validity

    // Validate form inputs
    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      setSignupErrorMessage("Set a stronger password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setSignupErrorMessage("Passwords do not match.");
      isValid = false;
    } else if (!termsChecked) {
      setSignupErrorMessage("You must agree to the terms and conditions.");
      isValid = false;
    } else {
      setSignupErrorMessage(""); // Clear error message if all validations pass
    }

    if (isValid) {
      // Proceed with sign-up only if form is valid
      const email = e.target.email.value;
      const response = await signup(email, password);
      setisLoading(false); // Reset loading to false after response

      if (response.success) {
        // Handle successful signup (e.g., redirect to login page or show success message)
        navigate(`${location.pathname}/verify-otp`, {
          state: { email, password },
        });
      } else {
        // Handle error (e.g., display error message)
        response.errorMessage && setSignupErrorMessage(response.errorMessage); // Display error message from the signup function
      }
    } else {
      setisLoading(false); // Reset loading if validation fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setisLoading(true); // Set loading to true
    const email = e.target.email.value; // Get email from the form
    const password = e.target.password.value; // Get password from the form
    const toRemember = e.target.querySelector('input[type="checkbox"]').checked; // Get the state of the "Remember Me" checkbox

    const response = await login(email, password, toRemember, dispatch);
    setisLoading(false); // Reset loading to false after response

    if (response.success) {
      navigate("/");
    } else {
      setLoginErrorMessage(response.errorMessage || "Wrong"); // Use the new state for login error message
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] flex overflow-hidden relative">
      {/* -------- Login Form----- */}
      <motion.div
        id="login-form"
        className={`relative z-9 w-[80] lg:w-[33%] mx-[10vw] my-[12vh] lg:my-[25vh] text-center`}
        initial={{ x: "0%", opacity: 1 }}
        animate={{ x: isLogin ? "0%" : "10%", opacity: isLogin ? 1 : 0 }}
        exit={{ x: "10%", opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Log in to Your Account
        </h2>
        <p className="text-gray-600 mb-8">Welcome Back to CloakCampus!</p>
        <form className="space-y-4" onSubmit={handleLogin} method="POST">
          <div>
            <label className="block text-gray-600 text-sm text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm text-left">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                name="password"
                className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute right-2 top-2 text-gray-600"
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
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span className="ml-2 text-gray-600 text-sm">Remember Me</span>
            </label>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
            {isLoading ? (
              <div className="flex items-center justify-center scale-[0.5]">
                <svg
                  className="loader-container"
                  viewBox="0 0 40 40"
                  height="40"
                  width="40"
                >
                  <circle
                    className="loader-track"
                    cx="20"
                    cy="20"
                    r="17.5"
                    pathLength="100"
                    strokeWidth="5"
                    fill="none"
                  />
                  <circle
                    className="loader-car"
                    cx="20"
                    cy="20"
                    r="17.5"
                    pathLength="100"
                    strokeWidth="5"
                    fill="none"
                  />
                </svg>

                <style jsx>{`
                  .loader-container {
                    --uib-size: 40px;
                    --uib-color: black;
                    --uib-speed: 2s;
                    --uib-bg-opacity: 0;
                    height: var(--uib-size);
                    width: var(--uib-size);
                    transform-origin: center;
                    animation: rotate var(--uib-speed) linear infinite;
                    overflow: visible;
                  }

                  .loader-car {
                    fill: none;
                    stroke: var(--uib-color);
                    stroke-dasharray: 1, 200;
                    stroke-dashoffset: 0;
                    stroke-linecap: round;
                    animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out
                      infinite;
                    will-change: stroke-dasharray, stroke-dashoffset;
                    transition: stroke 0.5s ease;
                  }

                  .loader-track {
                    fill: none;
                    stroke: var(--uib-color);
                    opacity: var(--uib-bg-opacity);
                    transition: stroke 0.5s ease;
                  }

                  @keyframes rotate {
                    100% {
                      transform: rotate(360deg);
                    }
                  }

                  @keyframes stretch {
                    0% {
                      stroke-dasharray: 0, 150;
                      stroke-dashoffset: 0;
                    }
                    50% {
                      stroke-dasharray: 75, 150;
                      stroke-dashoffset: -25;
                    }
                    100% {
                      stroke-dashoffset: -100;
                    }
                  }
                `}</style>
              </div>
            ) : (
              "Log in"
            )}
          </button>
        </form>
        {/* Display error message for login */}
        {loginErrorMessage && (
          <div className="text-red-500 text-sm mt-2">{loginErrorMessage}</div>
        )}
      </motion.div>

      {/* ------Signup Form----- */}
      <motion.div
        id="signup-form"
        className={`relative z-9 w-[80] lg:w-[33%] mx-[10vw] my-[8vh] lg:my-[20vh] text-center`}
        initial={{ x: "0%", opacity: 0 }}
        animate={{ x: !isLogin ? "0%" : "-10%", opacity: !isLogin ? 1 : 0 }}
        exit={{ x: "-10%", opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Create Your Account
        </h2>
        <p className="text-gray-600 mb-8">
          Ready to dive in? Join CloakCampus and start your anonymous journey!
        </p>
        <form className="space-y-4" onSubmit={handleSignUp} method="POST">
          <div>
            <label className="block text-gray-600 text-sm text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm text-left">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute right-2 top-2 text-gray-600"
              >
                {showPassword ? (
                  <RiEyeOffLine className="mt-1" />
                ) : (
                  <RiEyeLine className="mt-1" />
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 text-sm">
                <span
                  className={`${
                    passwordStrength === "Strong"
                      ? "text-green-500"
                      : passwordStrength === "Medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {passwordStrength
                    ? `Your password is ${passwordStrength}`
                    : `Password should be alteast 6 characters long.`}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-600 text-sm text-left">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange} // Update confirm password state
              className="w-full px-4 py-2 mt-1 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
              required
            />
            {/* Show error message if passwords do not match */}
            {password && confirmPassword && password !== confirmPassword && (
              <span className="text-red-500 text-sm">
                Passwords do not match.
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-blue-500"
                onChange={(e) => setTermsChecked(e.target.checked)} // Update termsChecked state
              />
              <span className="ml-2 text-gray-600 text-sm">
                Agree to{" "}
                <button
                  type="button"
                  onClick={toggleTerms}
                  className="text-blue-500 hover:underline"
                >
                  terms and conditions
                </button>
              </span>
            </label>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
            {isLoading ? (
              <div className="flex items-center justify-center scale-[0.5]">
                <svg
                  className="loader-container"
                  viewBox="0 0 40 40"
                  height="40"
                  width="40"
                >
                  <circle
                    className="loader-track"
                    cx="20"
                    cy="20"
                    r="17.5"
                    pathLength="100"
                    strokeWidth="5"
                    fill="none"
                  />
                  <circle
                    className="loader-car"
                    cx="20"
                    cy="20"
                    r="17.5"
                    pathLength="100"
                    strokeWidth="5"
                    fill="none"
                  />
                </svg>

                <style jsx>{`
                  .loader-container {
                    --uib-size: 40px;
                    --uib-color: black;
                    --uib-speed: 2s;
                    --uib-bg-opacity: 0;
                    height: var(--uib-size);
                    width: var(--uib-size);
                    transform-origin: center;
                    animation: rotate var(--uib-speed) linear infinite;
                    overflow: visible;
                  }

                  .loader-car {
                    fill: none;
                    stroke: var(--uib-color);
                    stroke-dasharray: 1, 200;
                    stroke-dashoffset: 0;
                    stroke-linecap: round;
                    animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out
                      infinite;
                    will-change: stroke-dasharray, stroke-dashoffset;
                    transition: stroke 0.5s ease;
                  }

                  .loader-track {
                    fill: none;
                    stroke: var(--uib-color);
                    opacity: var(--uib-bg-opacity);
                    transition: stroke 0.5s ease;
                  }

                  @keyframes rotate {
                    100% {
                      transform: rotate(360deg);
                    }
                  }

                  @keyframes stretch {
                    0% {
                      stroke-dasharray: 0, 150;
                      stroke-dashoffset: 0;
                    }
                    50% {
                      stroke-dasharray: 75, 150;
                      stroke-dashoffset: -25;
                    }
                    100% {
                      stroke-dashoffset: -100;
                    }
                  }
                `}</style>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
          {/* Display error message for signup */}
          {signupErrorMessage && (
            <div className="text-red-500 text-sm mt-2">
              {signupErrorMessage}
            </div>
          )}
        </form>
      </motion.div>

      {/* -------Slider------ */}
      <motion.div
        id="slider"
        className={`w-[50vw] absolute z-9999 bottom-0 right-0 flex ${
          isLogin ? "justify-end" : "justify-start"
        }`}
        initial={{ x: "0%" }}
        animate={{ x: isLogin ? "0%" : "-100%" }} // Toggle between 0% (left) and 100% (right)
        exit={{ x: "0%", opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div
          className="bg-[rgb(53,86,220)] w-[full] lg:w-[38rem] lg:h-[100vh] py-10 pr-2 flex flex-col items-center justify-center"
          style={{
            clipPath: isLogin
              ? isWideScreen
                ? "polygon(0% 0%,100% 0%, 100% 100%, 15% 100%)"
                : undefined
              : isWideScreen
              ? "polygon(0% 0%, 0% 100%, 100% 100%, 85% 0%)"
              : undefined,
          }}
        >
          <h2 className="font-[800] text-2xl text-white ml-10">
            {isLogin
              ? "Don't have an Account Yet ?"
              : "Already Have an Account ?"}
          </h2>
          <p className="text-center w-[26rem] text-white mt-6 leading-[1.25rem] ml-10">
            {isLogin
              ? `Ready to dive in? Sign up now and unleash your inner commentator,
            confessor, and secret-keeper, all without anyone knowing it’s you!`
              : `Welcome back! Log in to spill the latest tea, stir up some drama,
            and see what secrets are brewing—no one will ever know it’s you!`}
          </p>
          <button
            onClick={toggleAuthMode}
            className="text-white hover:text-[rgb(53,86,220)] hover:bg-white uppercase border-[1.5px] border-white px-12 py-4 rounded-full transition-all duration-[0.3s] ease-in-out mt-10 ml-10"
          >
            Sign Up
          </button>
        </div>
      </motion.div>

      {/* Terms and Conditions Modal */}
      {showTerms && <TermsModal toggleTerms={toggleTerms} />}

      <br />
      <Outlet />
    </div>
  );
}

export default Auth;
