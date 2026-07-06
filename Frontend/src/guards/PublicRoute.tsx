import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen';

export function PublicRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
