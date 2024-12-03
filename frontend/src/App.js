import React from "react";
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import OtpVerification from "./components/OtpVerification";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/RedirectingComponents/PrivateRoute";
import RedirectRoute from "./components/RedirectingComponents/RedirectRoute";
import UploadPostPage from "./pages/UploadPostPage";
import LoadingPage from "./pages/LoadingPage";

function App() {
  return (
    <div className="bg-[#161616]">
      <Routes>
        {/* Protected Routes - Redirects to /auth if not logged in */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPostPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Auth Route - Redirects to / if already logged in */}
        <Route
          path="/auth"
          element={
            <RedirectRoute>
              <Auth />
            </RedirectRoute>
          }
        >
          <Route path="verify-otp" element={<OtpVerification />} />
        </Route>
        <Route path="/loading" element={<LoadingPage />} />
      </Routes>
    </div>
  );
}

export default App;
