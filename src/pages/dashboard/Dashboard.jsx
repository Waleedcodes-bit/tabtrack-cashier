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

const currentMonth = new Date().toISOString().slice(0, 7);
const paidCustomerIds = new Set((MOCK_PAYMENTS || []).filter(p => p.month === currentMonth).map(p => p.customerId));
const pendingAmount = (MOCK_ORDERS || [])
  .filter(o => o.date.startsWith(currentMonth) && !paidCustomerIds.has(o.customerId))
  .reduce((sum, o) => sum + (o.amount || 0), 0);

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getRelativeLabel = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
};

const startOfWeek = getStartOfWeek();

const recentActivity = [
  ...(MOCK_PAYMENTS || [])
    .filter(p => new Date(p.date) >= startOfWeek)
    .map(p => ({ type: 'payment', name: p.customerName || 'Customer', amount: p.amount, when: getRelativeLabel(p.date) })),
  ...(MOCK_ORDERS || [])
    .filter(o => new Date(o.date) >= startOfWeek)
    .map(o => ({ type: 'order', name: o.customerName || o.name || 'Customer', amount: o.amount, when: getRelativeLabel(o.date) })),
].sort((a, b) => {
  const rank = (w) => w === 'Today' ? 0 : w === 'Yesterday' ? 1 : 2;
  return rank(a.when) - rank(b.when);
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Invite Link', sub: 'Share your shop link',    icon: Link2,  color: '#fce4ec', iconColor: '#c62828', path: '/invite' },
    { label: 'QR Code',     sub: 'View & print your QR code', icon: QrCode, color: '#e8eaf6', iconColor: '#283593', path: '/qr' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 lg:gap-5">

        {/* ── Stats card ── */}
        <div
          className="rounded-2xl overflow-hidden text-white"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}
        >
          <div className="flex justify-between items-start px-5 md:px-7 pt-5 md:pt-7 pb-4">
            <div>
              <p className="text-[10px] md:text-[11px] tracking-[1.5px] uppercase text-white/50 mb-1.5">Total Outstanding</p>
              <p className="text-3xl md:text-4xl font-bold tracking-tight leading-none">{formatZAR(totalOutstanding)}</p>
              <p className="text-white/40 text-xs md:text-sm mt-2">Across all tabs</p>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400"
              style={{ background: 'rgba(74,222,128,0.15)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              LIVE
            </div>
          </div>

          <div
            className="flex px-5 md:px-7 py-4 md:py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { label: 'Pending',       value: formatZAR(pendingAmount), icon: Clock, orange: true },
              { label: 'Total Debtors', value: activeDebtors,            icon: Users },
              { label: 'Settled',       value: settledDebtors,           check: true },
            ].map(({ label, value, icon: Icon, check, orange }, i) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-2 md:gap-3"
                style={{
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingRight: i < 2 ? 16 : 0,
                  marginRight:  i < 2 ? 16 : 0,
                }}
              >
                <div
                  className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: orange ? 'rgba(251,146,60,0.15)' : 'rgba(74,222,128,0.15)' }}
                >
                  {check
                    ? <span className="text-emerald-400 text-sm font-bold">✓</span>
                    : Icon && <Icon size={13} color={orange ? '#fb923c' : '#4ade80'} />}
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                  <p className={`font-bold text-white ${orange ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Month End CTA ── */}
        <div
          className="rounded-2xl overflow-hidden flex items-center justify-between"
          style={{ background: '#0f172a' }}
        >
          {/* Emerald left stripe */}
          <div className="w-1.5 self-stretch flex-shrink-0" style={{ background: 'linear-gradient(180deg, #34d399, #0f4d3a)' }} />

          <div className="flex items-center gap-3 flex-1 px-4 py-4 md:py-5">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <FolderOpen size={16} color="#34d399" />
            </div>
            <p className="text-white font-bold text-sm md:text-base">Month End</p>
          </div>

          <button
            onClick={() => navigate('/month-end')}
            className="flex items-center gap-2 font-semibold text-sm px-4 py-2 mr-4 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
            style={{ background: '#34d399', color: '#0a1f14' }}
          >
            View Report <ArrowRight size={13} />
          </button>
        </div>

        {/* ── Quick links: full width 2 cards ── */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {quickLinks.map(({ label, sub, icon: Icon, color, iconColor, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white dark:bg-[#0d1f2d] rounded-2xl p-4 md:p-5 text-left flex items-center gap-4 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color }}
              >
                <Icon size={18} color={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{label}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* ── Recent Activity: full width ── */}
        <div className="bg-white dark:bg-[#0d1f2d] rounded-2xl border border-gray-100 dark:border-white/10 p-4 md:p-5">
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-3 md:mb-4">Recent Activity</p>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-white/30">No activity this week yet.</p>
          ) : (
            <div className="flex flex-col">
              {recentActivity.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-3 ${i !== 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                  <div
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: a.type === 'payment' ? '#dcfce7' : '#e0f2fe' }}
                  >
                    {a.type === 'payment'
                      ? <ArrowDownLeft size={13} color="#16a34a" />
                      : <FileText size={13} color="#0284c7" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-white/30 leading-none">
                      {a.type === 'payment' ? 'Payment from' : 'New tab for'}
                    </p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{a.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">{formatZAR(a.amount)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.when}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/history')}
            className="mt-4 w-full py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            View All Activity <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;