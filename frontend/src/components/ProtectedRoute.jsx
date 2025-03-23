import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }
  return children;
};
export default ProtectedRoute;