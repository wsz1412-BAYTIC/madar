import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MadarAuthProvider } from '@/contexts/AuthContext';
import { CookieProvider } from '@/contexts/CookieContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppLayout from '@/components/madar/AppLayout';
import CookieConsentBanner from '@/components/madar/CookieConsentBanner';
import CommunicationWidgets from '@/components/widgets/CommunicationWidgets';

import Landing from '@/pages/Landing';
import MadarLogin from '@/pages/MadarLogin';
import MadarSignup from '@/pages/MadarSignup';
import MadarForgotPassword from '@/pages/MadarForgotPassword';
import Dashboard from '@/pages/Dashboard';
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
import PriceRecommendations from '@/pages/PriceRecommendations';
import PageNotFound from './lib/PageNotFound';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<MadarLogin />} />
      <Route path="/signup" element={<MadarSignup />} />
      <Route path="/forgot-password" element={<MadarForgotPassword />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/ai-disclaimer" element={<AIDisclaimer />} />
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
      
      {/* App routes with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/pricing-recommendations" element={<PriceRecommendations />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/market" element={<Market />} />
        <Route path="/calendar" element={<BookingCalendar />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<MadarSettings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Admin routes - separate from app layout */}
      <Route path="/admin/users" element={<Admin />} />
      <Route path="/admin/properties" element={<Admin />} />
      <Route path="/admin/subscriptions" element={<Admin />} />
      <Route path="/admin/data" element={<Admin />} />
      <Route path="/admin/content" element={<Admin />} />
      <Route path="/admin/support" element={<Admin />} />
      <Route path="/admin/logs" element={<Admin />} />
      <Route path="/admin/settings" element={<Admin />} />

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
            <MadarAuthProvider>
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
            </MadarAuthProvider>
          </CookieProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App