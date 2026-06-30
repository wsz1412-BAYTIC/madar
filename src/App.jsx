import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MadarAuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/madar/AppLayout';

import Landing from '@/pages/Landing';
import MadarLogin from '@/pages/MadarLogin';
import Dashboard from '@/pages/Dashboard';
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
import PageNotFound from './lib/PageNotFound';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<MadarLogin />} />
      <Route path="/calculator" element={<Calculator />} />
      
      {/* App routes with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/market" element={<Market />} />
        <Route path="/calendar" element={<BookingCalendar />} />
        <Route path="/settings" element={<MadarSettings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MadarAuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </MadarAuthProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App