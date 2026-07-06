import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CookieProvider } from '@/contexts/CookieContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppLayout from '@/components/madar/AppLayout';
import CookieConsentBanner from '@/components/madar/CookieConsentBanner';
import CommunicationWidgets from '@/components/widgets/CommunicationWidgets';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import PlansAndUpgrade from '@/pages/PlansAndUpgrade';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import Properties from '@/pages/Properties';
import Analytics from '@/pages/Analytics';
import Revenue from '@/pages/Revenue';
import Alerts from '@/pages/Alerts';
import Market from '@/pages/Market';
import BookingCalendar from '@/pages/BookingCalendar';
import MadarSettings from '@/pages/MadarSettings';
import Billing from '@/pages/Billing';
import Calculator from '@/pages/Calculator';
import Connect from '@/pages/Connect';
import Referral from '@/pages/Referral';
import Admin from '@/pages/Admin';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import AIDisclaimer from '@/pages/AIDisclaimer';
import DataAiPolicy from '@/pages/DataAiPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import SubscriptionPolicy from '@/pages/SubscriptionPolicy';
import AcceptableUsePolicy from '@/pages/AcceptableUsePolicy';
import IPTrademark from '@/pages/IPTrademark';
import ThirdPartyDisclaimer from '@/pages/ThirdPartyDisclaimer';
import HowToUseMadar from '@/pages/HowToUseMadar';
import HelpCenter from '@/pages/HelpCenter';
import Reports from '@/pages/Reports';
import PricingPage from '@/pages/PricingPage';
import PropertyAnalysis from '@/pages/PropertyAnalysis';
import Opportunities from '@/pages/Opportunities';
import AdminOpportunities from '@/pages/AdminOpportunities';
import AdminOpportunityForm from '@/pages/AdminOpportunityForm';
import AdminOpportunityRequests from '@/pages/AdminOpportunityRequests';
import PriceRecommendations from '@/pages/PriceRecommendations';
import InvestmentConsultant from '@/pages/InvestmentConsultant';
import PageNotFound from './lib/PageNotFound';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/ai-disclaimer" element={<AIDisclaimer />} />
      <Route path="/data-ai-policy" element={<DataAiPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/subscription" element={<SubscriptionPolicy />} />
      <Route path="/aup" element={<AcceptableUsePolicy />} />
      <Route path="/ip-trademark" element={<IPTrademark />} />
      <Route path="/third-party" element={<ThirdPartyDisclaimer />} />
      <Route path="/how-to-use" element={<HowToUseMadar />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/market-insights" element={<Market />} />
      <Route path="/property-analysis" element={<PropertyAnalysis />} />
      <Route path="/opportunities" element={<Opportunities />} />
      
      {/* Authenticated routes — gated by ProtectedRoute (redirects to /login) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/pricing-recommendations" element={<PriceRecommendations />} />
          <Route path="/investment-consultant" element={<InvestmentConsultant />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/market" element={<Market />} />
          <Route path="/calendar" element={<BookingCalendar />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<MadarSettings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/referral" element={<Referral />} />
          {/* Admin dashboard — gated on user.role === "admin" */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Admin routes - separate from app layout, also admin-gated */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<Admin />} />
          <Route path="/admin/properties" element={<Admin />} />
          <Route path="/admin/subscriptions" element={<Admin />} />
          <Route path="/admin/data" element={<Admin />} />
          <Route path="/admin/content" element={<Admin />} />
          <Route path="/admin/support" element={<Admin />} />
          <Route path="/admin/logs" element={<Admin />} />
          <Route path="/admin/settings" element={<Admin />} />
          <Route path="/admin/opportunities" element={<AdminOpportunities />} />
          <Route path="/admin/opportunities/new" element={<AdminOpportunityForm />} />
          <Route path="/admin/opportunities/:id" element={<AdminOpportunityForm />} />
          <Route path="/admin/opportunity-requests" element={<AdminOpportunityRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <CookieProvider>
            <SubscriptionProvider>
              <QueryClientProvider client={queryClientInstance}>
                <Router>
                  <AuthenticatedApp />
                  <CookieConsentBanner />
                  <CommunicationWidgets />
                </Router>
                <Toaster />
              </QueryClientProvider>
            </SubscriptionProvider>
          </CookieProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App