import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../Spinner/Spinner';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <Spinner />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'student' ? '/student-dashboard' : 
                         user.role === 'teacher' ? '/teacher-dashboard' : '/admin-dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};
export default ProtectedRoute;