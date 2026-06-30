// src/App.jsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LangProvider } from "./i18n/LangContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import RoleSelectPage from "./pages/auth/RoleSelectPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import CheckEmailPage from "./pages/auth/CheckEmailPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProviderDirectory from "./pages/public/ProviderDirectory";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import ProviderProfilePage from "./pages/public/ProviderProfilePage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/role-select", element: <RoleSelectPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/check-email",    element: <CheckEmailPage /> },
  { path: "/auth/callback",  element: <AuthCallbackPage /> },

  {
    path: "/provider/dashboard",
    element: (
      <ProtectedRoute role="provider">
        <ProviderDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/customer/dashboard",
    element: (
      <ProtectedRoute role="customer">
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },

  { path: "/providers", element: <ProviderDirectory /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/providers/:id", element: <ProviderProfilePage /> },
]);

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LangProvider>
  );
}
