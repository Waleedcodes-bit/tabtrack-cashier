import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabase';
import { subscribeToPush } from './utils/pushNotifications';


// Auth
import RoleSelection from './pages/auth/RoleSelection';
import CashierAuth from './pages/auth/CashierAuth';
import CustomerAuth from './pages/auth/CustomerAuth';

// Admin
import AdminAuth from './pages/admin/AdminAuth';
import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentsPage from './pages/admin/PaymentsPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import AccountsPage from './pages/admin/AccountsPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import CustomersPage from './pages/admin/CustomersPage';
import ReportsPage from './pages/admin/ReportsPage';
import ActivityPage from './pages/admin/ActivityPage';

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
import Welcome from './pages/misc/Welcome';

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
import CustomerInvite from './pages/customer/CustomerInvite';

// --- Route Guards ---
function OwnerRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/cashier/login" replace />;
  if (profile && profile.role !== 'owner') return <Navigate to="/" replace />;
  return children;
}

function CustomerRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/customer/login" replace />;
  if (profile && profile.role !== 'customer') return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/admin/login" replace />;
  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [splash, setSplash]   = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setProfile(data);
    setLoading(false);

    if (data) {
      // Save role to localStorage so returning users skip RoleSelection
      localStorage.setItem('navoq_role', data.role);
      // Subscribe to push notifications
      subscribeToPush(userId);
    }
  };

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;
  if (loading) return null;

  // Check saved role for logged-out returning users
  const savedRole = localStorage.getItem('navoq_role');

  const HomeRoute = () => {
    // Logged in — go straight to dashboard
    if (session && profile) {
      if (profile.role === 'owner')    return <Navigate to="/dashboard" replace />;
      if (profile.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
      if (profile.role === 'admin')    return <Navigate to="/admin/dashboard" replace />;
    }
    // Not logged in but has a saved role — skip RoleSelection, go to their login
    if (savedRole === 'owner')    return <Navigate to="/cashier/login" replace />;
    if (savedRole === 'customer') return <Navigate to="/customer/login" replace />;
    if (savedRole === 'admin')    return <Navigate to="/admin/login" replace />;
    // Brand new user — show RoleSelection
    return <Navigate to="/welcome" replace />;
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>

          {/* Entry Point */}
          <Route path="/" element={<HomeRoute />} />

          {/* Cashier Auth */}
          <Route path="/cashier/login" element={<CashierAuth />} />
          <Route path="/cashier/register" element={<CashierAuth />} />

          {/* Customer Auth */}
          <Route path="/customer/login" element={<CustomerAuth />} />
          <Route path="/customer/register" element={<CustomerAuth />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminAuth />} />

          {/* Cashier App */}
          <Route path="/dashboard" element={<OwnerRoute session={session} profile={profile}><Dashboard /></OwnerRoute>} />
          <Route path="/debtors" element={<OwnerRoute session={session} profile={profile}><Debtors /></OwnerRoute>} />
          <Route path="/debtor/:id" element={<OwnerRoute session={session} profile={profile}><DebtorDetail /></OwnerRoute>} />
          <Route path="/debtor/:id/history" element={<OwnerRoute session={session} profile={profile}><DebtorHistory /></OwnerRoute>} />
          <Route path="/add-debtor" element={<OwnerRoute session={session} profile={profile}><AddDebtor /></OwnerRoute>} />
          <Route path="/month-end" element={<OwnerRoute session={session} profile={profile}><MonthEnd /></OwnerRoute>} />
          <Route path="/history" element={<OwnerRoute session={session} profile={profile}><TransactionHistory /></OwnerRoute>} />
          <Route path="/invite" element={<OwnerRoute session={session} profile={profile}><Invite /></OwnerRoute>} />
          <Route path="/settings" element={<OwnerRoute session={session} profile={profile}><Settings /></OwnerRoute>} />
          <Route path="/qr" element={<OwnerRoute session={session} profile={profile}><QRPage /></OwnerRoute>} />
          <Route path="/profile" element={<OwnerRoute session={session} profile={profile}><Profile /></OwnerRoute>} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* Admin App */}
          <Route path="/admin/dashboard" element={<AdminRoute session={session} profile={profile}><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute session={session} profile={profile}><PaymentsPage /></AdminRoute>} />
          <Route path="/admin/feedback" element={<AdminRoute session={session} profile={profile}><FeedbackPage /></AdminRoute>} />
          <Route path="/admin/accounts" element={<AdminRoute session={session} profile={profile}><AccountsPage /></AdminRoute>} />
          <Route path="/admin/overview" element={<AdminRoute session={session} profile={profile}><DashboardPage /></AdminRoute>} />
          <Route path="/admin/layout" element={<AdminRoute session={session} profile={profile}><AdminLayout /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute session={session} profile={profile}><CustomersPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute session={session} profile={profile}><ReportsPage /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute session={session} profile={profile}><ActivityPage /></AdminRoute>} />

          {/* Customer App */}
          <Route path="/customer/dashboard" element={<CustomerRoute session={session} profile={profile}><CustomerDashboard /></CustomerRoute>} />
          <Route path="/customer/restaurant/:id" element={<CustomerRoute session={session} profile={profile}><RestaurantView /></CustomerRoute>} />
          <Route path="/customer/scan" element={<CustomerRoute session={session} profile={profile}><Scan /></CustomerRoute>} />
          <Route path="/customer/history" element={<CustomerRoute session={session} profile={profile}><CustomerHistory /></CustomerRoute>} />
          <Route path="/customer/profile" element={<CustomerRoute session={session} profile={profile}><CustomerProfile /></CustomerRoute>} />
          <Route path="/customer/disputes" element={<CustomerRoute session={session} profile={profile}><CustomerDispute /></CustomerRoute>} />
          <Route path="/customer/settings" element={<CustomerRoute session={session} profile={profile}><CustomerSettings /></CustomerRoute>} />
          <Route path="/customer/notifications" element={<CustomerRoute session={session} profile={profile}><CustomerNotifications /></CustomerRoute>} />
          <Route path="/customer/invite" element={<CustomerRoute session={session} profile={profile}><CustomerInvite /></CustomerRoute>} />
          <Route path="/notifications" element={<Notifications />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;