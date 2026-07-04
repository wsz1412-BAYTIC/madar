import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SubscriptionProvider } from "@/lib/SubscriptionContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PropertySearch from "./pages/PropertySearch";
import PropertyDetail from "./pages/PropertyDetail";
import MarketInsights from "./pages/MarketInsights";
import UserDashboard from "./pages/UserDashboard";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Accessibility from "./pages/Accessibility";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PricingRecommendations from "./pages/PricingRecommendations";
import CommitHistory from "./pages/CommitHistory";
import Settings from "./pages/Settings";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, authError } = useAuth();
  if (loading) return <LoadingScreen />;
  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function MadarRoutes() {
  const { loading, authError } = useAuth();

  if (loading) return <LoadingScreen />;

  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Home />} />

      <Route element={<Layout />}>
        <Route path="/properties" element={<ProtectedRoute><PropertySearch /></ProtectedRoute>} />
        <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
        <Route path="/analytics/:propertyId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><MarketInsights /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
        <Route path="/pricing-recommendations" element={<ProtectedRoute><PricingRecommendations /></ProtectedRoute>} />
        <Route path="/commits" element={<ProtectedRoute><CommitHistory /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SubscriptionProvider>
          <ThemeProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <MadarRoutes />
            </Router>
            <Toaster />
          </QueryClientProvider>
          </ThemeProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;