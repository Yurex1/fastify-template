import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import type { JSX } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
// import Dashboard from "@/pages/Dashboard";
import Home from "../pages/Home";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
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

  // {
  //   path: "*",
  //   element: <Navigate to="/login" replace />,
  // },
]);
