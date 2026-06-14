import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Pencil, X, Check, Clock } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';
import { addNotification, addEditRequest } from '../../store/notificationStore';
import { sendPushNotification } from '../../utils/pushNotifications';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH    = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

const DebtorHistory = () => {
  const { id } = useParams();

  const [customer, setCustomer]         = useState(null);
  const [orders, setOrders]             = useState([]);
  const [pendingEdits, setPendingEdits] = useState({}); // { orderId: newAmount }
  const [loading, setLoading]           = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newAmount, setNewAmount]       = useState('');
  const [saving, setSaving]             = useState(false);
  const [monthFilter, setMonthFilter]   = useState('this');
  const [specificDay, setSpecificDay]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: cust } = await supabase
      .from('customers')
      .select('id, name, code, balance, auth_user_id, owner_id')
      .eq('id', id)
      .single();

    const { data: ords } = await supabase
      .from('orders')
      .select('id, name, amount, date, customer_id')
      .eq('customer_id', id)
      .order('date', { ascending: false });

    // Fetch any pending edits for this customer's orders
    const { data: edits } = await supabase
      .from('order_edits')
      .select('order_id, new_amount, status')
      .eq('customer_id', id)
      .eq('status', 'pending');

    // Build a map of orderId → pending new_amount
    const editMap = {};
    (edits || []).forEach(e => { editMap[e.order_id] = e.new_amount; });

    setCustomer(cust || null);
    setOrders(ords || []);
    setPendingEdits(editMap);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filterOrders = (list) => {
    if (monthFilter === 'this') return list.filter(o => o.date?.startsWith(CURRENT_MONTH));
    if (monthFilter === 'last') return list.filter(o => o.date?.startsWith(LAST_MONTH));
    if (monthFilter === 'day' && specificDay) return list.filter(o => o.date === specificDay);
    return list;
  };

  const filteredOrders = filterOrders(orders).sort((a, b) => new Date(b.date) - new Date(a.date));

  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const monthYear = new Date(order.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(order);
    return groups;
  }, {});

  const months     = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
  const monthTotal = month => groupedOrders[month].reduce((sum, o) => sum + o.amount, 0);
  const grandTotal = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

  const openEdit = (order) => {
    // Don't allow editing an order that already has a pending edit
    if (pendingEdits[order.id] !== undefined) return;
    setEditingOrder(order);
    setNewAmount(String(order.amount));
  };

  const handleSaveEdit = async () => {
    const oldAmount = editingOrder.amount;
    const updated   = parseFloat(newAmount);
    if (isNaN(updated) || updated === oldAmount) { setEditingOrder(null); return; }

    setSaving(true);

    // 1. Create order_edit record in Supabase (customer must accept)
    await addEditRequest({
      orderId:    editingOrder.id,
      customerId: id,
      oldAmount,
      newAmount:  updated,
    });

    // 2. Notify the owner
    if (customer?.owner_id) {
      await addNotification({
        user_id: customer.owner_id,
        type:    'edit',
        title:   'Order edit requested',
        body:    `${editingOrder.name} — change from ${formatZAR(oldAmount)} to ${formatZAR(updated)}`,
        amount:  formatZAR(updated),
      });
    }

    // 3. Notify the customer (in-app + push to device)
    if (customer?.auth_user_id) {
      await addNotification({
        user_id: customer.auth_user_id,
        type:    'edit',
        title:   'Order amount edited',
        body:    `${editingOrder.name} was changed to ${formatZAR(updated)} — please review`,
        amount:  formatZAR(updated),
      });
      await sendPushNotification({
        userId: customer.auth_user_id,
        title:  'Order amount edited',
        body:   `${editingOrder.name} was changed to ${formatZAR(updated)} — tap to review`,
        url:    '/customer/disputes',
      });
    }

    // 4. Update local pending state immediately — no refetch needed
    setPendingEdits(prev => ({ ...prev, [editingOrder.id]: updated }));

    setSaving(false);
    setEditingOrder(null);
  };

  if (loading) return (
    <MainLayout title="Loading..." showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400 dark:text-white/30">Loading...</p>
      </div>
    </MainLayout>
  );

  if (!customer) return (
    <MainLayout title="Not Found" showBack>
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-bold text-gray-400 dark:text-white/30">History not found</p>
      </div>
    </MainLayout>
  );

  return (
    <>
      <MainLayout title="Transaction History" showBack>
        <div className="flex flex-col gap-5">

          {/* ── Left col ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* Customer card */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0f2347 0%, #1a3565 100%)', boxShadow: '0 16px 48px rgba(10,22,40,0.2)' }}>
              <div className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              <div className="relative z-10 flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{customer.name}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">{customer.code}</p>
                </div>
              </div>
              <div className="relative z-10 rounded-2xl px-4 py-3 flex justify-between items-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Period Total</p>
                <p className="text-lg font-black text-white">{formatZAR(grandTotal)}</p>
              </div>
            </div>

            {/* Pending edits notice */}
            {Object.keys(pendingEdits).length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.15)' }}>
                <Clock size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {Object.keys(pendingEdits).length} order edit{Object.keys(pendingEdits).length > 1 ? 's' : ''} waiting for customer approval
                </p>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'this', label: 'This Month' },
                { key: 'last', label: 'Last Month' },
                { key: 'day',  label: 'By Day' },
                { key: 'all',  label: 'All' },
              ].map(t => (
                <button key={t.key} onClick={() => setMonthFilter(t.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    monthFilter === t.key
                      ? 'text-white'
                      : 'bg-white dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-100 dark:border-white/10'
                  }`}
                  style={monthFilter === t.key ? { backgroundColor: '#0f2347' } : undefined}>
                  {t.label}
                </button>
              ))}
            </div>

            {monthFilter === 'day' && (
              <input type="date" value={specificDay} onChange={e => setSpecificDay(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-white/5 rounded-2xl text-sm font-semibold text-gray-700 dark:text-white outline-none border border-gray-100 dark:border-white/10 focus:border-emerald-400 transition-colors" />
            )}

            {/* Summary box */}
            <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50 dark:border-white/5">
                <p className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-wider">Transactions</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{filteredOrders.length}</p>
              </div>
              <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-white/5">
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Total</p>
                <p className="font-black text-sm text-[#0f2347] dark:text-emerald-400">{formatZAR(grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* ── Right col ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {months.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                  <Calendar size={20} className="text-gray-300 dark:text-white/20" />
                </div>
                <p className="text-sm font-bold text-gray-400 dark:text-white/30">No transactions found</p>
              </div>
            ) : (
              months.map(month => (
                <div key={month}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">{month}</span>
                      <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider">
                      {formatZAR(monthTotal(month))}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {groupedOrders[month].map((order, i) => {
                      const pendingAmount = pendingEdits[order.id];
                      const hasPending    = pendingAmount !== undefined;

                      return (
                        <div key={order.id}
                          className={`flex items-center gap-4 px-5 py-4 ${
                            i < groupedOrders[month].length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
                          } ${hasPending ? 'bg-orange-50/40 dark:bg-orange-500/5' : ''}`}>

                          {/* Date badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            hasPending
                              ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20'
                              : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10'
                          }`}>
                            {hasPending
                              ? <Clock size={13} className="text-orange-500 dark:text-orange-400" />
                              : <span className="text-xs font-black text-gray-500 dark:text-white/40">
                                  {new Date(order.date).getDate()}
                                </span>
                            }
                          </div>

                          {/* Name + status */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{order.name}</p>
                            {hasPending ? (
                              <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-wider mt-0.5">
                                Awaiting customer approval
                              </p>
                            ) : (
                              <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mt-0.5">
                                Ref #{order.id.slice(0, 5).toUpperCase()}
                              </p>
                            )}
                          </div>

                          {/* Amount — show old + new if pending */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {hasPending ? (
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 dark:text-white/30 line-through">
                                  {formatZAR(order.amount)}
                                </p>
                                <p className="text-sm font-black text-orange-500 dark:text-orange-400">
                                  {formatZAR(pendingAmount)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {formatZAR(order.amount)}
                              </p>
                            )}

                            {/* Edit button — disabled if pending */}
                            <button
                              onClick={() => openEdit(order)}
                              disabled={hasPending}
                              title={hasPending ? 'Edit pending customer approval' : 'Edit amount'}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                hasPending
                                  ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 cursor-not-allowed'
                                  : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-100 dark:hover:border-blue-500/20'
                              }`}>
                              {hasPending
                                ? <Clock size={13} className="text-orange-400 dark:text-orange-400" />
                                : <Pencil size={13} className="text-gray-400 dark:text-white/30" />
                              }
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </MainLayout>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-3xl p-6 shadow-2xl mb-4 border border-transparent dark:border-white/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-base font-black text-gray-900 dark:text-white">Edit Amount</p>
              <button onClick={() => setEditingOrder(null)} className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/30 font-medium mb-5">
              {editingOrder.name} • {editingOrder.date}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10">
                <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1">Current</p>
                <p className="text-lg font-black text-gray-400 dark:text-white/40">{formatZAR(editingOrder.amount)}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl px-4 py-3 border border-blue-100 dark:border-blue-500/20">
                <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">New Amount</p>
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="w-full bg-transparent text-lg font-black text-blue-700 dark:text-blue-300 outline-none"
                  autoFocus
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium text-center mb-4">
              The customer will be notified and must accept this change
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditingOrder(null)}
                className="py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-bold text-gray-500 dark:text-white/40">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !newAmount || parseFloat(newAmount) === editingOrder.amount}
                className={`py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                  ${!saving && newAmount && parseFloat(newAmount) !== editingOrder.amount
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed'}`}>
                <Check size={15} /> {saving ? 'Saving…' : 'Save & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebtorHistory;