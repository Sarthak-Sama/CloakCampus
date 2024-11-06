import React from "react";
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import AuthUI from "./pages/Auth";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/auth" Component={AuthUI} />
        <Route path="/signup" Component={SignupPage} />
        <Route path="/profile" Component={ProfilePage} />
      </Routes>
    </div>
  );
}

export default App;
