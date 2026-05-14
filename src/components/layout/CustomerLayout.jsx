import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, QrCode, History, ChevronLeft, Home,
  Bell, ShoppingBag, AlertTriangle, CheckCircle, X, Star
} from 'lucide-react';

const CUSTOMER_NOTIFICATIONS = [
  {
    id: 1, type: 'order', unread: true,
    title: 'New charge added',
    body: 'The Green Bistro — Chicken wrap',
    amount: 'R 85,00',
    time: 'Just now',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 2, type: 'dispute', unread: true,
    title: 'Dispute resolved',
    body: 'The Corner Bistro adjusted your order',
    amount: 'R 45,00',
    time: '1h ago',
    icon: CheckCircle,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 3, type: 'reminder', unread: false,
    title: 'Month end reminder',
    body: 'Your tab at The Green Bistro is due',
    amount: 'R 320,00',
    time: 'Yesterday',
    icon: AlertTriangle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
];

const NAV_ITEMS = [
  { to: '/customer/dashboard', label: 'Home',    icon: Home },
  { to: '/customer/scan',      label: 'Scan',    icon: QrCode },
  { to: '/customer/history',   label: 'History', icon: History },
  { to: '/customer/profile',   label: 'Profile', icon: User },
];

/* ─── Notification Bell ─── */
const NotificationBell = ({ notifications }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter(n => n.unread).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));
  const dismiss = (id) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center active:scale-90 transition-all hover:bg-gray-100"
      >
        <Bell size={17} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 z-50 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm">Notifications</p>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-emerald-600 font-semibold">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              ) : (
                items.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-emerald-50/40' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={15} className={n.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                          <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{n.body}</p>
                        <div className="flex items-center justify-between mt-1">
                          {n.amount && <p className="text-xs font-bold text-gray-900">{n.amount}</p>}
                          <p className="text-[10px] text-gray-400 ml-auto">{n.time}</p>
                        </div>
                      </div>
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                onClick={() => { setOpen(false); navigate('/customer/notifications'); }}
                className="w-full text-center text-xs font-semibold text-emerald-600 py-1 hover:text-emerald-700"
              >
                View all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Customer Sidebar (tablet/desktop only) ─── */
const CustomerSidebar = () => {
  const loc = useLocation();
  return (
    <aside className="hidden md:flex w-56 lg:w-60 flex-shrink-0 flex-col h-full bg-[#0d1321] border-r border-white/5">

      {/* Logo */}
      <div className="px-4 lg:px-5 py-5 lg:py-6 flex items-center gap-3">
        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
            <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
            <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
            <circle cx="36" cy="33" r="9" fill="#ecfdf5" stroke="#34d399" strokeWidth="2"/>
            <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-[14px] lg:text-[15px] leading-none tracking-tight font-['Plus_Jakarta_Sans']">TabTrack</p>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Customer Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold text-sm">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="mx-2 lg:mx-3 mb-4 p-3 rounded-2xl bg-[#141d2e] border border-white/5 flex items-center gap-3">
        <div
          className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
        >
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">John Doe</p>
          <p className="text-xs text-emerald-400">Active Customer</p>
        </div>
      </div>
    </aside>
  );
};

/* ─── CustomerLayout ─── */
const CustomerLayout = ({ children, title, showBack = false, rightAction, hideNav = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#eef2f7] font-['Inter']">

      {/* Sidebar — tablet/desktop only */}
      <CustomerSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 pt-12 md:pt-0 pb-4 md:py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            ) : (
              /* Mobile only: show logo (sidebar already has it on md+) */
              <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
                    <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
                    <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
                    <circle cx="36" cy="33" r="9" fill="#ecfdf5" stroke="#34d399" strokeWidth="2"/>
                    <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-none font-['Plus_Jakarta_Sans']">TabTrack</p>
                  <p className="text-emerald-600 text-[9px] font-bold uppercase tracking-wider mt-0.5">Customer Portal</p>
                </div>
              </div>
            )}

            {showBack && title && (
              <h1 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightAction ? (
              <div>{rightAction}</div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Live</span>
              </div>
            )}
            <NotificationBell notifications={CUSTOMER_NOTIFICATIONS} />
          </div>
        </header>

        {/* Page title bar (non-back pages) */}
        {!showBack && title && (
          <div className="px-4 md:px-6 pt-5 pb-2 bg-white border-b border-gray-50">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight font-['Plus_Jakarta_Sans']">{title}</h2>
          </div>
        )}

        {/* Page content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 md:pt-5 pb-32 md:pb-8"
        >
          {children}
        </main>

        {/* Mobile bottom nav */}
        {!hideNav && (
          <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div
              className="bg-white border border-gray-100 rounded-[2rem] px-2 py-3 flex items-center justify-around"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
            >
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                const isSpecial = to === '/customer/scan';
                if (isSpecial) {
                  return (
                    <Link to={to} key={to} className="relative -mt-8 active:scale-95 transition-all">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Icon size={24} className="text-white" />
                      </div>
                    </Link>
                  );
                }
                return (
                  <Link
                    to={to}
                    key={to}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                      active ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${active ? 'bg-emerald-50' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerLayout;