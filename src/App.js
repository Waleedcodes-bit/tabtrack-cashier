import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Auth
import RoleSelection from './pages/auth/RoleSelection';
import CashierAuth from './pages/auth/CashierAuth';
import CustomerAuth from './pages/auth/CustomerAuth';

// Cashier Pages
import Dashboard from './pages/dashboard/Dashboard';
import Debtors from './pages/debtors/Debtors';
import DebtorDetail from './pages/debtors/DebtorDetail';
import DebtorHistory from './pages/debtors/DebtorHistory';
import MonthEnd from './pages/debtors/MonthEnd';
import AddDebtor from './pages/debtors/AddDebtor';
import Invite from './pages/misc/Invite';
import Settings from './pages/misc/Settings';
import QRPage from './pages/misc/QRPage';
import TransactionHistory from './pages/misc/TransactionHistory';
import TermsAndConditions from './pages/misc/TermsAndConditions';
import PrivacyPolicy from './pages/misc/PrivacyPolicy';
import Profile from './pages/misc/Profile';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RestaurantView from './pages/customer/RestaurantView';
import Scan from './pages/customer/Scan';
import CustomerHistory from './pages/customer/CustomerHistory';
import CustomerProfile from './pages/customer/CustomerProfile';
import Notifications from './pages/misc/Notifications';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerDispute from './pages/customer/CustomerDispute';
import CustomerSettings from './pages/customer/CustomerSettings';

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) return <SplashScreen onDone={() => setLoading(false)} />;

  return (
    <ThemeProvider>
      <Router>
        <Routes>

          {/* Entry Point */}
          <Route path="/" element={<RoleSelection />} />

          {/* Cashier Auth */}
          <Route path="/cashier/login" element={<CashierAuth />} />
          <Route path="/cashier/register" element={<CashierAuth />} />

          {/* Customer Auth */}
          <Route path="/customer/login" element={<CustomerAuth />} />
          <Route path="/customer/register" element={<CustomerAuth />} />

          {/* Cashier App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debtors" element={<Debtors />} />
          <Route path="/debtor/:id" element={<DebtorDetail />} />
          <Route path="/debtor/:id/history" element={<DebtorHistory />} />
          <Route path="/add-debtor" element={<AddDebtor />} />
          <Route path="/month-end" element={<MonthEnd />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/profile" element={<Profile />} />

          {/* Customer App */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/restaurant/:id" element={<RestaurantView />} />
          <Route path="/customer/scan" element={<Scan />} />
          <Route path="/customer/history" element={<CustomerHistory />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/disputes" element={<CustomerDispute />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;