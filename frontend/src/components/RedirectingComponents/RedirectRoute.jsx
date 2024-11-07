import React from "react";
import { Navigate } from "react-router-dom";

function RedirectRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" /> : children;
}

export default RedirectRoute;
