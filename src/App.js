import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth
import RoleSelection from './pages/auth/RoleSelection';
import CashierAuth from './pages/auth/CashierAuth';
import CustomerAuth from './pages/auth/CustomerAuth';

// Cashier Pages
import Dashboard from './pages/dashboard/Dashboard';
import Debtors from './pages/debtors/Debtors';
import DebtorDetail from './pages/debtors/DebtorDetail';
import DebtorHistory from './pages/debtors/DebtorHistory';
import RaiseDispute from './pages/debtors/RaiseDispute';
import MonthEnd from './pages/debtors/MonthEnd';
import AddDebtor from './pages/debtors/AddDebtor';
import Invite from './pages/misc/Invite';
import Profile from './pages/misc/Profile';
import QRPage from './pages/misc/QRPage';
import TransactionHistory from './pages/misc/TransactionHistory';
import CurrentDisputes from './pages/debtors/CurrentDisputes';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RestaurantView from './pages/customer/RestaurantView';
import Scan from './pages/customer/Scan';
import CustomerHistory from './pages/customer/CustomerHistory';
import CustomerDisputes from './pages/customer/CustomerDisputes';
import CustomerProfile from './pages/customer/CustomerProfile';
import Notifications from './pages/misc/Notifications';
import CustomerNotifications from './pages/customer/CustomerNotifications';

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) return <SplashScreen onDone={() => setLoading(false)} />;
  return (
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
        <Route path="/debtor/:id/raise-dispute" element={<RaiseDispute />} />
        <Route path="/add-debtor" element={<AddDebtor />} />
        <Route path="/disputes" element={<CurrentDisputes />} />
        <Route path="/month-end" element={<MonthEnd />} />
        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/qr" element={<QRPage />} />

        {/* Customer App */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/restaurant/:id" element={<RestaurantView />} />
        <Route path="/customer/scan" element={<Scan />} />
        <Route path="/customer/history" element={<CustomerHistory />} />
        <Route path="/customer/disputes" element={<CustomerDisputes />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/customer/notifications" element={<CustomerNotifications />} />

      </Routes>
    </Router>
  );
}

export default App;