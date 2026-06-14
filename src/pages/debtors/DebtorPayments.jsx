import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard, TrendingDown, CalendarDays, ArrowUpRight,
  BarChart3, ChevronLeft, Pencil, Check, X
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

const DebtorPayments = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  // Edit state
  const [editingId,    setEditingId]    = useState(null);
  const [editAmount,   setEditAmount]   = useState('');
  const [editSaving,   setEditSaving]   = useState(false);
  const [editError,    setEditError]    = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: cust } = await supabase
      .from('customers')
      .select('id, name, code, balance, owner_id')
      .eq('id', id)
      .single();

    const { data: pays } = await supabase
      .from('payments')
      .select('id, amount, original_amount, date, month, created_at')
      .eq('customer_id', id)
      .order('date', { ascending: false });

    setCustomer(cust || null);
    setPayments(pays || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditAmount(String(p.amount));
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditError('');
  };

  const saveEdit = async (p) => {
    const newAmount = parseFloat(editAmount);
    if (!newAmount || newAmount <= 0) {
      setEditError('Enter a valid amount');
      return;
    }
    if (newAmount === p.amount) { cancelEdit(); return; }

    setEditSaving(true);
    setEditError('');

    // Save original_amount only on first edit
    const originalAmount = p.original_amount ?? p.amount;

    const { error } = await supabase
      .from('payments')
      .update({
        amount: newAmount,
        original_amount: originalAmount,
      })
      .eq('id', p.id);

    if (error) {
      setEditError('Failed to save. Try again.');
      setEditSaving(false);
      return;
    }

    // The trigger on payments will auto-update customer balance
    // Re-fetch to get fresh balance
    await fetchData();
    cancelEdit();
    setEditSaving(false);
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = payments.filter(p => {
    if (filter === 'this') return p.date?.startsWith(CURRENT_MONTH);
    if (filter === 'last') return p.date?.startsWith(LAST_MONTH);
    return true;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalPaid  = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const thisMonth  = payments.filter(p => p.date?.startsWith(CURRENT_MONTH)).reduce((s, p) => s + (p.amount || 0), 0);
  const lastMonth  = payments.filter(p => p.date?.startsWith(LAST_MONTH)).reduce((s, p) => s + (p.amount || 0), 0);
  const largest    = payments.length > 0 ? Math.max(...payments.map(p => p.amount || 0)) : 0;
  const avgPayment = payments.length > 0 ? totalPaid / payments.length : 0;
  const initials   = customer?.name?.split(' ').map(n => n[0]).join('') || '?';

  const grouped = filtered.reduce((acc, p) => {
    const key = p.month || p.date?.slice(0, 7) || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) return (
    <MainLayout showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400 dark:text-white/30">Loading…</p>
      </div>
    </MainLayout>
  );

  if (!customer) return (
    <MainLayout showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-400 dark:text-white/30">Customer not found</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout showBack>
      <div className="flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/debtor/${id}`)}
            className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500 dark:text-white/40" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-emerald-300 text-sm flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
              {initials}
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{customer.name}</h1>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{customer.code}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/30 font-black">Still Owes</p>
            <p className={`text-base font-black ${customer.balance > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
              {formatZAR(customer.balance)}
            </p>
          </div>
        </div>

        {/* ── Hero stat card ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0a3328 50%, #0f4d3a 100%)' }}>
          <div className="px-6 pt-6 pb-5">
            <p className="text-[10px] uppercase tracking-[1.5px] text-white/40 font-bold mb-1">Total Paid</p>
            <p className="text-4xl font-black text-white tracking-tight leading-none mb-1">{formatZAR(totalPaid)}</p>
            <p className="text-white/30 text-xs font-medium">
              {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            {[
              { label: 'This Month', value: formatZAR(thisMonth) },
              { label: 'Last Month', value: formatZAR(lastMonth) },
              { label: 'Average',    value: formatZAR(avgPayment) },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3.5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">{label}</p>
                <p className="text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick stats row ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={13} className="text-emerald-500" />
              <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">Largest</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{formatZAR(largest)}</p>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={13} className="text-blue-500" />
              <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">Count</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{payments.length}</p>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2">
          {[
            { key: 'all',  label: 'All Time'   },
            { key: 'this', label: 'This Month' },
            { key: 'last', label: 'Last Month' },
          ].map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                filter === t.key
                  ? 'text-white'
                  : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
              }`}
              style={filter === t.key ? { background: 'linear-gradient(135deg, #0f2347, #0f4d3a)' } : undefined}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Payment list ── */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
              <CreditCard size={20} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-white/30">No payments for this period</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {months.map(month => {
              const monthPayments = grouped[month];
              const monthTotal    = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);

              return (
                <div key={month}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">
                        {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {formatZAR(monthTotal)}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {monthPayments.map((p, i) => (
                      <div key={p.id}
                        className={`px-5 py-4 ${i < monthPayments.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>

                        {editingId === p.id ? (
                          /* ── Edit mode ── */
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <Pencil size={13} className="text-amber-500" />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                inputMode="decimal"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-2 bg-white dark:bg-white/10 rounded-xl border border-amber-300 dark:border-amber-500/40 outline-none text-base font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0.00"
                              />
                              {editError && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{editError}</p>}
                            </div>
                            <button
                              onClick={() => saveEdit(p)}
                              disabled={editSaving}
                              className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0"
                            >
                              <Check size={14} className="text-white" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0"
                            >
                              <X size={14} className="text-gray-500 dark:text-white/40" />
                            </button>
                          </div>
                        ) : (
                          /* ── View mode ── */
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <TrendingDown size={14} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Payment</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <CalendarDays size={9} className="text-gray-400 dark:text-white/30" />
                                <p className="text-[10px] font-medium text-gray-400 dark:text-white/30">{p.date}</p>
                                {p.original_amount != null && (
                                  <>
                                    <span className="text-gray-300 dark:text-white/10 text-[10px]">·</span>
                                    <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400">
                                      Edited from {formatZAR(p.original_amount)}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                +{formatZAR(p.amount)}
                              </p>
                              <button
                                onClick={() => startEdit(p)}
                                className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                              >
                                <Pencil size={12} className="text-gray-400 dark:text-white/30" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Period total */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-white/5">
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  {filter === 'all' ? 'All Time Total' : filter === 'this' ? 'This Month Total' : 'Last Month Total'}
                </p>
                <p className="font-black text-base text-emerald-600 dark:text-emerald-400">
                  {formatZAR(filtered.reduce((s, p) => s + (p.amount || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default DebtorPayments;