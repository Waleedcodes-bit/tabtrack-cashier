import React, { useState, useEffect, lazy, Suspense } from 'react';
import SplashScreen from './components/SplashScreen';
import PageWrapper from './components/PageWrapper';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabase';
import { subscribeToPush } from './utils/pushNotifications';

// Auth (small, keep eager)
import RoleSelection from './pages/auth/RoleSelection';
import CashierAuth from './pages/auth/CashierAuth';
import CustomerAuth from './pages/auth/CustomerAuth';
import Welcome from './pages/misc/Welcome';

// Admin (lazy)
const AdminAuth       = lazy(() => import('./pages/admin/AdminAuth'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const PaymentsPage    = lazy(() => import('./pages/admin/PaymentsPage'));
const FeedbackPage    = lazy(() => import('./pages/admin/FeedbackPage'));
const AccountsPage    = lazy(() => import('./pages/admin/AccountsPage'));
const AdminLayout     = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage   = lazy(() => import('./pages/admin/DashboardPage'));
const CustomersPage   = lazy(() => import('./pages/admin/CustomersPage'));
const ReportsPage     = lazy(() => import('./pages/admin/ReportsPage'));
const ActivityPage    = lazy(() => import('./pages/admin/ActivityPage'));

// Cashier (lazy)
const Dashboard           = lazy(() => import('./pages/dashboard/Dashboard'));
const Debtors             = lazy(() => import('./pages/debtors/Debtors'));
const DebtorDetail        = lazy(() => import('./pages/debtors/DebtorDetail'));
const DebtorHistory       = lazy(() => import('./pages/debtors/DebtorHistory'));
const MonthEnd            = lazy(() => import('./pages/debtors/MonthEnd'));
const AddDebtor           = lazy(() => import('./pages/debtors/AddDebtor'));
const Invite              = lazy(() => import('./pages/misc/Invite'));
const Settings            = lazy(() => import('./pages/misc/Settings'));
const QRPage              = lazy(() => import('./pages/misc/QRPage'));
const TransactionHistory  = lazy(() => import('./pages/misc/TransactionHistory'));
const TermsAndConditions  = lazy(() => import('./pages/misc/TermsAndConditions'));
const PrivacyPolicy       = lazy(() => import('./pages/misc/PrivacyPolicy'));
const Profile             = lazy(() => import('./pages/misc/Profile'));
const Notifications       = lazy(() => import('./pages/misc/Notifications'));

// Customer (lazy)
const CustomerDashboard     = lazy(() => import('./pages/customer/CustomerDashboard'));
const RestaurantView        = lazy(() => import('./pages/customer/RestaurantView'));
const Scan                  = lazy(() => import('./pages/customer/Scan'));
const CustomerHistory       = lazy(() => import('./pages/customer/CustomerHistory'));
const CustomerProfile       = lazy(() => import('./pages/customer/CustomerProfile'));
const CustomerDispute       = lazy(() => import('./pages/customer/CustomerDispute'));
const CustomerSettings      = lazy(() => import('./pages/customer/CustomerSettings'));
const CustomerNotifications = lazy(() => import('./pages/customer/CustomerNotifications'));
const CustomerInvite        = lazy(() => import('./pages/customer/CustomerInvite'));

// Spinner — matches app bg so no colour flash
const PageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center" style={{ background: '#0a1628' }}>
    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

// --- Route Guards ---
function OwnerRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/cashier/login" replace />;
  if (profile && profile.role !== 'owner') return <Navigate to="/" replace />;
  return <PageWrapper>{children}</PageWrapper>;
}

function CustomerRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/customer/login" replace />;
  if (profile && profile.role !== 'customer') return <Navigate to="/" replace />;
  return <PageWrapper>{children}</PageWrapper>;
}

function AdminRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/admin/login" replace />;
  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />;
  return <PageWrapper>{children}</PageWrapper>;
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
      localStorage.setItem('navoq_role', data.role);
      subscribeToPush(userId);
    }
  };

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;
  if (loading) return <PageSpinner />;

  const HomeRoute = () => {
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (session && profile) {
      if (profile.role === 'owner')    return <Navigate to="/dashboard" replace />;
      if (profile.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
      if (profile.role === 'admin')    return <Navigate to="/admin/dashboard" replace />;
    }

    if (isInstalled) return <RoleSelection />;
    return <Navigate to="/welcome" replace />;
  };

  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<PageSpinner />}>
          <Routes>

            {/* Entry Point */}
            <Route path="/" element={<HomeRoute />} />

            {/* Auth */}
            <Route path="/cashier/login"    element={<PageWrapper><CashierAuth /></PageWrapper>} />
            <Route path="/cashier/register" element={<PageWrapper><CashierAuth /></PageWrapper>} />
            <Route path="/customer/login"    element={<PageWrapper><CustomerAuth /></PageWrapper>} />
            <Route path="/customer/register" element={<PageWrapper><CustomerAuth /></PageWrapper>} />
            <Route path="/admin/login"       element={<PageWrapper><AdminAuth /></PageWrapper>} />
            <Route path="/welcome"           element={<PageWrapper><Welcome /></PageWrapper>} />
            <Route path="/terms"             element={<PageWrapper><TermsAndConditions /></PageWrapper>} />
            <Route path="/privacy"           element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path="/notifications"     element={<PageWrapper><Notifications /></PageWrapper>} />

            {/* Cashier */}
            <Route path="/dashboard"          element={<OwnerRoute session={session} profile={profile}><Dashboard /></OwnerRoute>} />
            <Route path="/debtors"            element={<OwnerRoute session={session} profile={profile}><Debtors /></OwnerRoute>} />
            <Route path="/debtor/:id"         element={<OwnerRoute session={session} profile={profile}><DebtorDetail /></OwnerRoute>} />
            <Route path="/debtor/:id/history" element={<OwnerRoute session={session} profile={profile}><DebtorHistory /></OwnerRoute>} />
            <Route path="/add-debtor"         element={<OwnerRoute session={session} profile={profile}><AddDebtor /></OwnerRoute>} />
            <Route path="/month-end"          element={<OwnerRoute session={session} profile={profile}><MonthEnd /></OwnerRoute>} />
            <Route path="/history"            element={<OwnerRoute session={session} profile={profile}><TransactionHistory /></OwnerRoute>} />
            <Route path="/invite"             element={<OwnerRoute session={session} profile={profile}><Invite /></OwnerRoute>} />
            <Route path="/settings"           element={<OwnerRoute session={session} profile={profile}><Settings /></OwnerRoute>} />
            <Route path="/qr"                 element={<OwnerRoute session={session} profile={profile}><QRPage /></OwnerRoute>} />
            <Route path="/profile"            element={<OwnerRoute session={session} profile={profile}><Profile /></OwnerRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminRoute session={session} profile={profile}><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/payments"  element={<AdminRoute session={session} profile={profile}><PaymentsPage /></AdminRoute>} />
            <Route path="/admin/feedback"  element={<AdminRoute session={session} profile={profile}><FeedbackPage /></AdminRoute>} />
            <Route path="/admin/accounts"  element={<AdminRoute session={session} profile={profile}><AccountsPage /></AdminRoute>} />
            <Route path="/admin/overview"  element={<AdminRoute session={session} profile={profile}><DashboardPage /></AdminRoute>} />
            <Route path="/admin/layout"    element={<AdminRoute session={session} profile={profile}><AdminLayout /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute session={session} profile={profile}><CustomersPage /></AdminRoute>} />
            <Route path="/admin/reports"   element={<AdminRoute session={session} profile={profile}><ReportsPage /></AdminRoute>} />
            <Route path="/admin/activity"  element={<AdminRoute session={session} profile={profile}><ActivityPage /></AdminRoute>} />

            {/* Customer */}
            <Route path="/customer/dashboard"       element={<CustomerRoute session={session} profile={profile}><CustomerDashboard /></CustomerRoute>} />
            <Route path="/customer/restaurant/:id"  element={<CustomerRoute session={session} profile={profile}><RestaurantView /></CustomerRoute>} />
            <Route path="/customer/scan"            element={<CustomerRoute session={session} profile={profile}><Scan /></CustomerRoute>} />
            <Route path="/customer/history"         element={<CustomerRoute session={session} profile={profile}><CustomerHistory /></CustomerRoute>} />
            <Route path="/customer/profile"         element={<CustomerRoute session={session} profile={profile}><CustomerProfile /></CustomerRoute>} />
            <Route path="/customer/disputes"        element={<CustomerRoute session={session} profile={profile}><CustomerDispute /></CustomerRoute>} />
            <Route path="/customer/settings"        element={<CustomerRoute session={session} profile={profile}><CustomerSettings /></CustomerRoute>} />
            <Route path="/customer/notifications"   element={<CustomerRoute session={session} profile={profile}><CustomerNotifications /></CustomerRoute>} />
            <Route path="/customer/invite"          element={<CustomerRoute session={session} profile={profile}><CustomerInvite /></CustomerRoute>} />

          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
