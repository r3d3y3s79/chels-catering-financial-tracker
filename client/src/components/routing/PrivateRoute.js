import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ component: Component }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, loadUser } = authContext;

  useEffect(() => {
    // Load user data if not already loaded
    if (localStorage.token && !isAuthenticated && loading) {
      loadUser();
    }
  }, [isAuthenticated, loading, loadUser]);

  if (loading) {
    // You could return a spinner/loader here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

export default PrivateRoute;
