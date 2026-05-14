import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, FolderOpen,
  ArrowRight, ArrowDownLeft, FileText,
  Link2, QrCode,
} from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PAYMENTS } from '../../data/mockData';
import { formatZAR } from '../../utils/format';

// ── helpers ───────────────────────────────────────────────────────────────────
const totalOutstanding = MOCK_CUSTOMERS.reduce((sum, c) => sum + (c.balance || 0), 0);
const activeDebtors    = MOCK_CUSTOMERS.filter(c => (c.balance || 0) > 0).length;
const settledDebtors   = MOCK_CUSTOMERS.filter(c => (c.balance || 0) === 0).length;

const fallbackActivity = [
  { type: 'payment', name: 'Jason M.',  amount: 750, when: 'Today' },
  { type: 'order',   name: 'Sipho D.',  amount: 320, when: 'Yesterday' },
  { type: 'payment', name: 'Linda K.',  amount: 900, when: '2 days ago' },
];

const recentActivity = (() => {
  const acts = [
    ...(MOCK_PAYMENTS || []).slice(0, 2).map(p => ({
      type: 'payment', name: p.customerName || 'Customer', amount: p.amount, when: 'Today',
    })),
    ...(MOCK_ORDERS || []).slice(0, 1).map(o => ({
      type: 'order', name: o.customerName || 'Customer', amount: o.amount, when: 'Yesterday',
    })),
  ].slice(0, 3);
  return acts.length >= 2 ? acts : fallbackActivity;
})();

// ── Sparkline ─────────────────────────────────────────────────────────────────
// Sits absolutely within the stats card, spanning full width just above the stats row
const Sparkline = () => {
  const pts = [30, 50, 35, 60, 45, 70, 55, 80, 65, 90];
  const w = 200, h = 60;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map(v => h - (v / 100) * h);
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '76px',  /* stats row height: py-5 (20px × 2) + content (~36px) ≈ 76px */
        height: '80px',
        width: '100%',
        opacity: 0.5,
        zIndex: 0,
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="#fff" stroke="#4ade80" strokeWidth="2" />
    </svg>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Active Debtors', sub: 'Manage your debtors',       icon: Users, color: '#e8f5e9', iconColor: '#2e7d32', badge: activeDebtors, path: '/debtors' },
    { label: 'Transactions',   sub: 'View transaction history',   icon: Clock, color: '#e3f2fd', iconColor: '#1565c0', path: '/history' },
    { label: 'Invite Link',    sub: 'Share your restaurant link', icon: Link2, color: '#fce4ec', iconColor: '#c62828', path: '/invite' },
    { label: 'QR Code',        sub: 'View & print your QR code',  icon: QrCode,color: '#e8eaf6', iconColor: '#283593', path: '/qr' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-5">

        {/* ── Stats card ── */}
        <div
          className="rounded-2xl overflow-hidden relative text-white"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
        >
          {/* Sparkline — placed first so z-index stacking is easy */}
          <Sparkline />

          {/* Top section — balance + LIVE badge */}
          <div className="flex justify-between items-start relative z-10 px-7 pt-7 pb-4">
            <div>
              <p className="text-[11px] tracking-[1.5px] uppercase text-white/50 mb-2">Total Outstanding</p>
              <p className="text-4xl font-bold tracking-tight leading-none">{formatZAR(totalOutstanding)}</p>
              <p className="text-white/40 text-sm mt-2">Across all tabs</p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400"
              style={{ background: 'rgba(74,222,128,0.15)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              LIVE
            </div>
          </div>

          {/* Spacer — gives the sparkline visible breathing room */}
          <div className="h-16" />

          {/* Stats row */}
          <div
            className="relative z-10 flex gap-0 px-7 py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { label: 'Active Tabs',   value: MOCK_CUSTOMERS.length, icon: FolderOpen },
              { label: 'Total Debtors', value: MOCK_CUSTOMERS.length, icon: Users },
              { label: 'Settled',       value: settledDebtors,        check: true },
            ].map(({ label, value, icon: Icon, check }, i) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-3"
                style={{
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingRight: i < 2 ? 24 : 0,
                  marginRight:  i < 2 ? 24 : 0,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74,222,128,0.15)' }}
                >
                  {check
                    ? <span className="text-emerald-400 text-base font-bold">✓</span>
                    : Icon && <Icon size={15} color="#4ade80" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Middle row ── */}
        <div className="flex gap-5">

          {/* Left col */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Month End CTA */}
            <div className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: '#0f172a' }}>
              <div>
                <p className="text-white font-bold text-base">Month End</p>
                <p className="text-white/40 text-xs mt-1">View summary and close the month</p>
              </div>
              <button
                onClick={() => navigate('/month-end')}
                className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                View Report <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick links 2×2 */}
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map(({ label, sub, icon: Icon, color, iconColor, badge, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="bg-white rounded-2xl p-5 text-left flex flex-col gap-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: color }}>
                      <Icon size={17} color={iconColor} />
                    </div>
                    {badge !== undefined && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#dcfce7', color: '#15803d' }}>{badge}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <ArrowRight size={13} className="text-gray-300 absolute right-4 bottom-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="w-72 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
            <p className="font-bold text-gray-900 text-sm mb-4">Recent Activity</p>
            <div className="flex-1 flex flex-col gap-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: a.type === 'payment' ? '#dcfce7' : '#e0f2fe' }}>
                    {a.type === 'payment'
                      ? <ArrowDownLeft size={15} color="#16a34a" />
                      : <FileText size={15} color="#0284c7" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 leading-none">
                      {a.type === 'payment' ? 'Payment received from' : 'New tab opened for'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{a.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatZAR(a.amount)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.when}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/history')}
              className="mt-5 w-full py-2.5 rounded-xl border border-gray-100 bg-white text-gray-900 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              View All Activity <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* ── Progress banner ── */}
        {/* ── Progress banner ── */}
{(() => {
  const MONTHLY_TARGET = 20; // orders needed to hit 100%
  const currentMonth = new Date().toISOString().slice(0, 7);
  const ordersThisMonth = MOCK_ORDERS.filter(o => o.date.startsWith(currentMonth)).length;
  const progress = Math.min(100, Math.round((ordersThisMonth / MONTHLY_TARGET) * 100));

  const getMessage = (pct) => {
    if (pct === 0)        return { text: "Let's get started! Log your first order 👋",    sub: "Every order counts." };
    if (pct < 10)         return { text: "First steps taken! Keep building 🌱",            sub: "You're on your way." };
    if (pct < 20)         return { text: "Good start! Customers are coming in 🙌",         sub: "Keep the momentum going." };
    if (pct < 30)         return { text: "Getting busier! Orders are picking up 📈",       sub: "You're building a habit." };
    if (pct < 40)         return { text: "Nice work! Your regulars are loyal ☕",           sub: "Almost halfway there." };
    if (pct < 50)         return { text: "Halfway soon! Keep the tabs coming 💪",          sub: "Strong month in progress." };
    if (pct < 60)         return { text: "Solid month! You've hit halfway 🎯",             sub: "More than halfway done." };
    if (pct < 70)         return { text: "Your business is growing! 🎉",                  sub: "Keep tracking and stay on top." };
    if (pct < 80)         return { text: "Great momentum! Customers love you 🔥",         sub: "Almost at full capacity." };
    if (pct < 90)         return { text: "Outstanding month! Nearly there 🚀",            sub: "Push to close it strong." };
    if (pct < 100)        return { text: "Almost at 100%! Incredible month 🏅",           sub: "One last push!" };
    return               { text: "Full house! Best month yet 🏆",                         sub: "You smashed the target!" };
  };

  const { text, sub } = getMessage(progress);

  // bar colour shifts green → emerald → teal as you climb
  const barColor = progress < 40
    ? 'linear-gradient(90deg, #86efac, #4ade80)'
    : progress < 70
    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
    : 'linear-gradient(90deg, #22c55e, #15803d)';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-8">
      <div className="flex-1">
        <p className="font-bold text-green-600 text-sm mb-1">{text}</p>
        <p className="text-gray-400 text-xs mb-4">{sub}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: barColor }}
            />
          </div>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {ordersThisMonth} of {MONTHLY_TARGET} orders this month
        </p>
      </div>
      <div className="w-28 h-20 flex-shrink-0">
        <svg viewBox="0 0 120 80" className="w-full h-full">
          {[20, 35, 50, 65, 80].map((h, i) => (
            <rect key={i} x={i * 22 + 4} y={80 - h} width={14} height={h} rx="3"
              fill={i === 4 ? '#22c55e' : '#dcfce7'} />
          ))}
          <polyline points="11,60 33,45 55,30 77,20 99,5"
            fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <polygon points="95,0 103,10 99,5" fill="#22c55e" />
        </svg>
      </div>
    </div>
  );
})()}

      </div>
    </MainLayout>
  );
};

export default Dashboard;