import { Navigate, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, allowedRules }) {
  const location = useLocation();
  const userToken = localStorage.getItem("userToken");

  if (!userToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(userToken);
    const userRule = decoded.rule.toLowerCase(); // Normalize to lowercase

    // Admin has access to everything
    if (userRule === 'admin') return children;
    
    // If no specific rules required, allow access
    if (!allowedRules || allowedRules.length === 0) return children;
    
    // Check if user's rule is allowed (case insensitive)
    const normalizedAllowedRules = allowedRules.map(rule => rule.toLowerCase());
    if (normalizedAllowedRules.includes(userRule)) return children;

    // Redirect to unauthorized page if not allowed
    return <Navigate to="/" state={{ from: location }} replace />;
  } catch (error) {
    console.error("Token error:", error);
    localStorage.removeItem("userToken");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRules: PropTypes.arrayOf(PropTypes.string)
};

ProtectedRoute.defaultProps = {
  allowedRules: []
};