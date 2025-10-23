import { useAuth } from '../../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader fullScreen text="Verificando autenticação..." />
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;