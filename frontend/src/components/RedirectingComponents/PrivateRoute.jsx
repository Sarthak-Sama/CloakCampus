import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ children }) {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" />;
}

export default PrivateRoute;
