import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function RedirectRoute({ children }) {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? <Navigate to="/" /> : children;
}

export default RedirectRoute;
