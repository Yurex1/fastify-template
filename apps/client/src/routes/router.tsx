import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import type { JSX } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
// import Dashboard from "@/pages/Dashboard";
import Home from '../pages/Home';
import { ROUTES } from '../utils/consts/routes';

interface ProtectedRoute {
  children: JSX.Element;
}
const ProtectedRoute = ({ children }: ProtectedRoute) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.REGISTER,
    element: <Register />,
  },
  // {
  //   path: "/dashboard",
  //   element: (
  //     <ProtectedRoute>
  //       <Dashboard />
  //     </ProtectedRoute>
  //   ),
  // },

  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);
