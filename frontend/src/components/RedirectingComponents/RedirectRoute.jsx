import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../redux/actions/authAction";

function RedirectRoute({ children }) {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuthStatus(isAuth);
    };
    checkAuth();
  }, []);

  if (authStatus === null) {
    return <div>Loading...</div>; // Show loading state while verifying
  }

  return authStatus ? <Navigate to="/" /> : children;
}

export default RedirectRoute;
