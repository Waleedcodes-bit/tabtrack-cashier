import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Clock, Users, BarChart2,
  FolderOpen, Settings, Bell, Star,
  ChevronDown, ChevronLeft, User,
  ShoppingBag, CreditCard, AlertTriangle, CheckCircle, X
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Home',         icon: Home },
  { to: '/history',    label: 'Transactions', icon: Clock },
  { to: '/debtors',    label: 'Debtors',      icon: Users },
  { to: '/month-end',  label: 'Reports',      icon: BarChart2 },
  { to: '/tabs',       label: 'Tabs',         icon: FolderOpen },
  { to: '/profile',    label: 'Settings',     icon: Settings },
];

const CASHIER_NOTIFICATIONS = [
  {
    id: 1, type: 'order', unread: true,
    title: 'New order created',
    body: 'Burger & Fries under Sipho Dlamini',
    amount: 'R 120,00',
    time: 'Just now',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 2, type: 'payment', unread: true,
    title: 'Payment received',
    body: 'From Thandi Mokoena',
    amount: 'R 320,00',
    time: '2h ago',
    icon: CreditCard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 3, type: 'dispute', unread: false,
    title: 'Dispute raised',
    body: 'By Kamo Sithole — order on 3 May',
    amount: null,
    time: 'Yesterday',
    icon: AlertTriangle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    id: 4, type: 'resolved', unread: false,
    title: 'Dispute resolved',
    body: 'Order adjusted for Lerato Nkosi',
    amount: 'R 85,00',
    time: '2 days ago',
    icon: CheckCircle,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

/* ─── Sidebar (tablet + desktop only) ─── */
export const Sidebar = () => {
  const loc = useLocation();
  return (
    <aside className="hidden md:flex w-56 lg:w-60 flex-shrink-0 flex-col h-full bg-[#0d1321] border-r border-white/5">

      {/* Logo */}
      <div className="px-4 lg:px-5 py-5 lg:py-6 flex items-center gap-3">
        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
            <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
            <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
            <circle cx="36" cy="33" r="9" fill="#0a3328" stroke="#34d399" strokeWidth="2"/>
            <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-[14px] lg:text-[15px] leading-none tracking-tight font-['Plus_Jakarta_Sans']">TabTrack</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">Track. Manage. Grow.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active =
            loc.pathname === to ||
            (to !== '/dashboard' && loc.pathname.startsWith(to));
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

      {/* Upgrade card */}
      <div className="mx-2 lg:mx-3 mb-3 p-3 lg:p-4 rounded-2xl bg-[#141d2e] border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <p className="text-sm font-bold text-white">Go Premium</p>
        </div>
        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Get advanced insights and grow your business.
        </p>
        <button className="w-full py-2 rounded-xl bg-emerald-500 text-emerald-950 text-xs font-bold hover:bg-emerald-400 transition-colors">
          Upgrade Now
        </button>
      </div>

      {/* User card */}
      <div className="mx-2 lg:mx-3 mb-4 p-3 rounded-2xl bg-[#141d2e] border border-white/5 flex items-center gap-3 cursor-pointer hover:border-white/10 transition-colors">
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          TH
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">The Green Bistro</p>
          <p className="text-xs text-gray-400">Owner</p>
        </div>
        <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
      </div>
    </aside>
  );
};

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
        className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <Bell size={17} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 md:top-12 z-50 w-72 md:w-80 bg-white rounded-2xl border border-gray-100 overflow-hidden"
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
                <button onClick={markAllRead} className="text-[11px] text-emerald-600 font-semibold hover:text-emerald-700">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 md:max-h-80 overflow-y-auto divide-y divide-gray-50">
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
                          <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5">
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
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="w-full text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1"
              >
                View all activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Mobile Bottom Nav ─── */
const MobileNav = () => {
  const loc = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1321] border-t border-white/5">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active =
            loc.pathname === to ||
            (to !== '/dashboard' && loc.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all active:scale-90 ${
                active ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${active ? 'bg-emerald-500/10' : ''}`}>
                <Icon size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

/* ─── MainLayout ─── */
const MainLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex h-screen bg-[#eef2f7] font-['Inter'] overflow-hidden">

      {/* Sidebar — tablet/desktop only */}
      <Sidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-black/5 bg-white">
          <div className="flex items-center gap-3">

            {/* Mobile: show logo when no back button */}
            {!showBack && (
              <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
                    <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
                    <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
                    <circle cx="36" cy="33" r="9" fill="#0a3328" stroke="#34d399" strokeWidth="2"/>
                    <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}

            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            )}

            {title ? (
              <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight font-['Plus_Jakarta_Sans']">{title}</h1>
            ) : (
              <div>
                <p className="text-gray-400 text-xs md:text-sm">{greeting} 👋</p>
                <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight font-['Plus_Jakarta_Sans']">The Green Bistro</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightAction && <div>{rightAction}</div>}
            <NotificationBell notifications={CASHIER_NOTIFICATIONS} />
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <User size={17} className="text-gray-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;