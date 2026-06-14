import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, FolderOpen,
  ArrowRight, ArrowDownLeft, FileText,
  Link2, QrCode,
} from 'lucide-react';

import MainLayout from '../../components/layout/MainLayout';
import { formatZAR } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getRelativeLabel = (ts) => {
  const d         = new Date(ts);
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1); yesterday.setHours(0, 0, 0, 0);

  const timeStr = d.toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Africa/Johannesburg',
  });

  if (d >= today)     return `Today · ${timeStr}`;
  if (d >= yesterday) return `Yesterday · ${timeStr}`;
  return d.toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'Africa/Johannesburg',
  }) + ` · ${timeStr}`;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    pendingAmount: 0,
    totalDebtors: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', user.id)
      .single();

    setBusinessName(profile?.business_name || '');

    const { data: customers } = await supabase
      .from('customers')
      .select('id, balance')
      .eq('owner_id', user.id);

    const customerList = customers || [];
    const customerIds  = customerList.map(c => c.id);

    const totalOutstanding = customerList.reduce((s, c) => s + (c.balance || 0), 0);
    const totalDebtors     = customerList.length;

    let pendingAmount = 0;
    if (customerIds.length > 0) {
      // Pending = order_edits with status pending (cashier edited, customer not yet accepted)
      const { data: pendingEdits } = await supabase
        .from('order_edits')
        .select('new_amount')
        .in('customer_id', customerIds)
        .eq('status', 'pending');

      pendingAmount = (pendingEdits || []).reduce((s, e) => s + (e.new_amount || 0), 0);
    }

    setStats({ totalOutstanding, pendingAmount, totalDebtors });

    if (customerIds.length > 0) {
      const startOfWeek = getStartOfWeek().toISOString().split('T')[0];

      const { data: recentPayments } = await supabase
  .from('payments')
  .select('customer_id, amount, date, created_at, customers(name)')
  .in('customer_id', customerIds)
  .gte('date', startOfWeek)
  .order('created_at', { ascending: false });

const { data: recentOrders } = await supabase
  .from('orders')
  .select('customer_id, name, amount, date, created_at, customers(name)')
  .in('customer_id', customerIds)
  .gte('date', startOfWeek)
  .order('created_at', { ascending: false });

      const activity = [
  ...(recentPayments || []).map(p => ({
    type:   'payment',
    name:   p.customers?.name || 'Customer',
    amount: p.amount,
    when:   getRelativeLabel(p.created_at),
    date:   p.created_at,
  })),
  ...(recentOrders || []).map(o => ({
    type:   'order',
    name:   o.customers?.name || o.name || 'Customer',
    amount: o.amount,
    when:   getRelativeLabel(o.created_at),
    date:   o.created_at,
  })),
].sort((a, b) => new Date(b.date) - new Date(a.date));

      setRecentActivity(activity);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const quickLinks = [
    { label: 'Invite Link', icon: Link2,  color: '#fce4ec', iconColor: '#c62828', path: '/invite' },
    { label: 'QR Code',     icon: QrCode, color: '#e8eaf6', iconColor: '#283593', path: '/qr'     },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 lg:gap-5">

        {businessName ? (
          <div>
            <p className="text-[10px] uppercase tracking-[1.5px] text-gray-400 dark:text-white/30 mb-0.5">
              Welcome back
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {businessName}
            </h1>
          </div>
        ) : null}

        <div className="rounded-2xl overflow-hidden text-white"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f4d3a 100%)' }}>
          <div className="flex justify-between items-start px-5 md:px-7 pt-5 md:pt-7 pb-4">
            <div>
              <p className="text-[10px] md:text-[11px] tracking-[1.5px] uppercase text-white/50 mb-1.5">Total Outstanding</p>
              <p className="text-3xl md:text-4xl font-bold tracking-tight leading-none">
                {loading ? '—' : formatZAR(stats.totalOutstanding)}
              </p>
              <p className="text-white/40 text-xs md:text-sm mt-2">Across all tabs</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400"
              style={{ background: 'rgba(74,222,128,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              LIVE
            </div>
          </div>

          <div className="flex px-5 md:px-7 py-4 md:py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { label: 'Pending',       value: loading ? '—' : formatZAR(stats.pendingAmount), icon: Clock, orange: true },
              { label: 'Total Debtors', value: loading ? '—' : stats.totalDebtors,             icon: Users },
            ].map(({ label, value, icon: Icon, orange }, i) => (
              <div key={label} className="flex-1 flex items-center gap-2 md:gap-3"
                style={{
                  borderRight: i < 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingRight: i < 1 ? 16 : 0,
                  marginRight:  i < 1 ? 16 : 0,
                }}>
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: orange ? 'rgba(251,146,60,0.15)' : 'rgba(74,222,128,0.15)' }}>
                  <Icon size={13} color={orange ? '#fb923c' : '#4ade80'} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                  <p className={`font-bold text-white ${orange ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden flex items-center justify-between" style={{ background: '#0f172a' }}>
          <div className="w-1.5 self-stretch flex-shrink-0" style={{ background: 'linear-gradient(180deg, #34d399, #0f4d3a)' }} />
          <div className="flex items-center gap-3 flex-1 px-4 py-4 md:py-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <FolderOpen size={16} color="#34d399" />
            </div>
            <p className="text-white font-bold text-sm md:text-base">Month End</p>
          </div>
          <button onClick={() => navigate('/month-end')}
            className="flex items-center gap-2 font-semibold text-sm px-4 py-2 mr-4 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
            style={{ background: '#34d399', color: '#0a1f14' }}>
            View Report <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {quickLinks.map(({ label, icon: Icon, color, iconColor, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="bg-white dark:bg-[#0d1f2d] rounded-2xl p-4 md:p-5 text-left flex items-center gap-4 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color }}>
                <Icon size={18} color={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{label}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#0d1f2d] rounded-2xl border border-gray-100 dark:border-white/10 p-4 md:p-5">
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-3 md:mb-4">Recent Activity</p>
          {loading ? (
            <p className="text-xs text-gray-400 dark:text-white/30">Loading…</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-white/30">No activity this week yet.</p>
          ) : (
            <div className="flex flex-col">
              {recentActivity.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-3 ${i !== 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: a.type === 'payment' ? '#dcfce7' : '#e0f2fe' }}>
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
          <button onClick={() => navigate('/history')}
            className="mt-4 w-full py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            View All Activity <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;