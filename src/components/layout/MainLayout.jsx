
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Home, Clock, Users, BarChart2,
  Settings, Bell,
  ChevronLeft, User,
  ShoppingBag, CreditCard, AlertTriangle, CheckCircle, X
} from 'lucide-react';

const SIDEBAR_NAV = [
  { to: '/dashboard',  label: 'Home',         icon: Home },
  { to: '/history',    label: 'Transactions', icon: Clock },
  { to: '/debtors',    label: 'Debtors',      icon: Users },
  { to: '/month-end',  label: 'Reports',      icon: BarChart2 },
  { to: '/settings',    label: 'Settings',     icon: Settings },
];

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home',     icon: Home },
  { to: '/debtors',   label: 'Debtors',  icon: Users },
  { to: '/history',   label: 'History',  icon: Clock },
  { to: '/settings',   label: 'Settings', icon: Settings },
];

const NOTIF_ICON_MAP = {
  order:    { icon: ShoppingBag,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  payment:  { icon: CreditCard,    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
  dispute:  { icon: AlertTriangle, iconBg: 'bg-orange-50',  iconColor: 'text-orange-500'  },
  resolved: { icon: CheckCircle,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
};
const enrichNotif = (n) => ({ ...NOTIF_ICON_MAP[n.type] || NOTIF_ICON_MAP.order, ...n });

export const Sidebar = () => {
  const loc = useLocation();
  return (
    <aside className="hidden md:flex w-52 lg:w-60 flex-shrink-0 flex-col h-full bg-[#0d1321] border-r border-white/5">
      <div className="px-4 lg:px-5 py-5 lg:py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="13" width="22" height="4.5" rx="2.25" fill="#34d399"/>
            <rect x="8" y="22" width="16" height="4.5" rx="2.25" fill="rgba(52,211,153,0.6)"/>
            <rect x="8" y="31" width="19" height="4.5" rx="2.25" fill="rgba(52,211,153,0.35)"/>
            <circle cx="36" cy="33" r="9" fill="#0a3328" stroke="#34d399" strokeWidth="2"/>
            <path d="M32.5 33l2.2 2.2 3.8-3.8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-none tracking-tight font-['Plus_Jakarta_Sans']">Navoq</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">Track. Manage. Grow.</p>
        </div>
      </div>

      <nav className="flex-1 px-2 lg:px-3 space-y-0.5">
        {SIDEBAR_NAV.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to !== '/dashboard' && loc.pathname.startsWith(to));
          return (
            <Link
              key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Icon size={17} />
              <span className="font-semibold text-sm">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 lg:px-5 py-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-[10px] text-white/40 leading-relaxed">A product of</p>
        <p className="text-xs text-white/60 font-semibold tracking-wide mt-0.5">Nidaam Labs (Pty) Ltd</p>
      </div>
    </aside>
  );
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen]     = useState(false);
  const [items, setItems]   = useState([]);
  const unreadCount = items.filter(n => n.unread).length;

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('hidden', null)
      .order('created_at', { ascending: false })
      .limit(10);
    setItems(data || []);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('main-bell')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ unread: false })
      .eq('user_id', user.id).eq('unread', true);
    setItems(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const dismiss = async (id) => {
    await supabase.from('notifications').update({ hidden: true }).eq('id', id);
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const relativeTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/15 transition-colors"
      >
        <Bell size={16} className="text-gray-500 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0d1f2d]" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-72 md:w-80 bg-white dark:bg-[#0d1f2d] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Notifications</p>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-emerald-400 font-semibold">Mark all read</button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-gray-200 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No notifications</p>
                </div>
              ) : items.map(n => {
                const meta = NOTIF_ICON_MAP[n.type] || NOTIF_ICON_MAP.order;
                const Icon = meta.icon;
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.unread ? 'bg-emerald-50/40 dark:bg-emerald-500/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={meta.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{n.title}</p>
                        <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 dark:text-white/20 dark:hover:text-white/50 flex-shrink-0 mt-0.5"><X size={12} /></button>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
                      <div className="flex items-center justify-between mt-1">
                        {n.amount && <p className="text-xs font-bold text-gray-900 dark:text-white">{n.amount}</p>}
                        <p className="text-[10px] text-gray-400 ml-auto">{relativeTime(n.created_at)}</p>
                      </div>
                    </div>
                    {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
              <button onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="w-full text-center text-xs font-semibold text-emerald-500 py-1">
                View all activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MobileNav = () => {
  const loc = useLocation();
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div
        className="bg-[#0d1321] border border-white/10 rounded-[2rem] px-2 py-2 flex items-center justify-around"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
      >
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to !== '/dashboard' && loc.pathname.startsWith(to));
          return (
            <Link
              key={to} to={to}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all active:scale-90 ${
                active ? 'bg-emerald-500/15' : ''
              }`}
            >
              <Icon size={20} className={active ? 'text-emerald-400' : 'text-gray-500'} />
              <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${active ? 'text-emerald-400' : 'text-gray-500'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const MainLayout = ({ children, title, showBack = false, rightAction }) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#eef2f7] dark:bg-[#0a1628] font-['Inter'] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 lg:px-8 py-3.5 md:py-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0d1f2d]">
          <div className="flex items-center gap-3">
            {!showBack && (
              <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="17" height="17" viewBox="0 0 48 48" fill="none">
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
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            )}

            {title ? (
              <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans']">{title}</h1>
            ) : (
              <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight font-['Plus_Jakarta_Sans']">
                Dashboard
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightAction && <div>{rightAction}</div>}
            <NotificationBell />
            <button onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/15 transition-colors">
              <User size={16} className="text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-8 pb-24 md:pb-6 lg:pb-8">
          {children}
          <div className="md:hidden mt-8 pb-2 text-center">
            <p className="text-[10px] text-gray-400 dark:text-white/20">A product of</p>
            <p className="text-xs text-gray-500 dark:text-white/30 font-semibold tracking-wide mt-0.5">Nidaam Labs (Pty) Ltd</p>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
};

export default MainLayout;
