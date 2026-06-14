import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LangProvider } from "./i18n/LangContext";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import RoleSelectPage from "./pages/auth/RoleSelectPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProviderDirectory from "./pages/public/ProviderDirectory";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import ProviderProfilePage from "./pages/public/ProviderProfilePage";

const router = createBrowserRouter([
  { path: "/",               element: <HomePage /> },
  { path: "/login",          element: <LoginPage /> },
  { path: "/signup",         element: <SignupPage /> },
  { path: "/role-select",    element: <RoleSelectPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/provider/dashboard", element: <ProviderDashboard /> },
  { path: "/customer/dashboard", element: <CustomerDashboard /> },
  { path: "/providers", element: <ProviderDirectory /> },
  { path: "/about",   element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/providers/:id", element: <ProviderProfilePage /> },
  
  
]);

export default function App() {
  return (
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  );
}