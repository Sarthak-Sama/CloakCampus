import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/handlingUsers";

function PrivateRoute({ children }) {
  const [authStatus, setAuthStatus] = useState(null); // null means loading

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

  return authStatus ? children : <Navigate to="/auth" />;
}

export default PrivateRoute;
