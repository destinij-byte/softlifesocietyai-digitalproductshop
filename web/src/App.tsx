import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Spinner } from "./components/Spinner";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ShopPage } from "./pages/ShopPage";
import { MyLibraryPage } from "./pages/MyLibraryPage";
import { MonthlyDropsPage } from "./pages/MonthlyDropsPage";
import { BundlesPage } from "./pages/BundlesPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CheckoutSuccessPage } from "./pages/CheckoutSuccessPage";
import { CheckoutCancelledPage } from "./pages/CheckoutCancelledPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPolicyPage } from "./pages/legal/PrivacyPolicyPage";
import { TermsPage } from "./pages/legal/TermsPage";
import { RefundPolicyPage } from "./pages/legal/RefundPolicyPage";
import { CookiePolicyPage } from "./pages/legal/CookiePolicyPage";

// "/" is the public marketing homepage - the storefront/brand home.
// Logged-in members land on their dashboard instead.
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/dashboard" replace /> : <HomePage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
      <Route path="/checkout/cancelled" element={<CheckoutCancelledPage />} />

      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* The Vault and Upgrade are the public storefront - browsable without
          an account; checkout itself still requires login. */}
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/upgrade" element={<BundlesPage />} />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <MyLibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drops"
        element={
          <ProtectedRoute>
            <MonthlyDropsPage />
          </ProtectedRoute>
        }
      />
      {/* My AI is now a My Library filter, not its own page */}
      <Route path="/ai-resources" element={<Navigate to="/library?area=ai" replace />} />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <AppRoutes />
      <Footer />
    </AuthProvider>
  );
}
