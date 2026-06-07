import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, AlertCircle, X, Lock } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { formatZAR } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const MONTH_NAME    = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

const MonthEnd = () => {
  const navigate = useNavigate();

  const [customers, setCustomers]               = useState([]);
  const [orders, setOrders]                     = useState([]);
  const [payments, setPayments]                 = useState({});
  const [loading, setLoading]                   = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount]                     = useState('');
  const [closing, setClosing]                   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: custData, error: custErr } = await supabase
      .from('customers')
      .select('id, name, code, balance, unsettled_previous_month, previous_month_balance')
      .eq('owner_id', user.id)
      .order('name', { ascending: true });

    if (custErr) { console.error('fetchCustomers:', custErr); setLoading(false); return; }

    const customerIds = (custData || []).map(c => c.id);

    let orderData   = [];
    let paymentData = [];

    if (customerIds.length > 0) {
      const [ordRes, payRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, customer_id, name, amount, date')
          .in('customer_id', customerIds)
          .gte('date', `${CURRENT_MONTH}-01`)
          .order('date', { ascending: false }),
        supabase
          .from('payments')
          .select('customer_id, amount')
          .in('customer_id', customerIds)
          .eq('month', CURRENT_MONTH),
      ]);

      orderData   = ordRes.data || [];
      paymentData = payRes.data || [];
    }

    const paymentsMap = {};
    paymentData.forEach(p => {
      paymentsMap[p.customer_id] = (paymentsMap[p.customer_id] || 0) + p.amount;
    });

    setCustomers(custData || []);
    setOrders(orderData);
    setPayments(paymentsMap);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getMonthlyTotal  = id => orders.filter(o => o.customer_id === id).reduce((s, o) => s + o.amount, 0);
  const getMonthlyOrders = id => orders.filter(o => o.customer_id === id);
  const isPaid           = id => (payments[id] || 0) >= getMonthlyTotal(id) && getMonthlyTotal(id) > 0;

  const paidAmount      = parseFloat(amount) || 0;
  const selectedBalance = selectedCustomer ? getMonthlyTotal(selectedCustomer.id) : 0;
  const rollover        = Math.max(0, selectedBalance - paidAmount);

  const unpaidCount = customers.filter(c => !isPaid(c.id) && getMonthlyTotal(c.id) > 0).length;
  const canClose    = unpaidCount === 0 && customers.filter(c => getMonthlyTotal(c.id) > 0).length > 0;

  const handleConfirmPayment = async () => {
    if (!selectedCustomer || paidAmount <= 0) return;

    await supabase.from('payments').insert({
      customer_id: selectedCustomer.id,
      amount:      paidAmount,
      date:        new Date().toISOString().split('T')[0],
      month:       CURRENT_MONTH,
    });

    setPayments(prev => ({
      ...prev,
      [selectedCustomer.id]: (prev[selectedCustomer.id] || 0) + paidAmount,
    }));
    setSelectedCustomer(null);
    setAmount('');
  };

  const handleClose = async () => {
    if (!canClose) return;
    setClosing(true);

    const updates = customers
      .filter(c => getMonthlyTotal(c.id) > 0)
      .map(c => {
        const paid       = payments[c.id] || 0;
        const monthTotal = getMonthlyTotal(c.id);
        const leftover   = Math.max(0, monthTotal - paid);

        return supabase
          .from('customers')
          .update({
            unsettled_previous_month: leftover > 0,
            previous_month_balance:   leftover,
          })
          .eq('id', c.id);
      });

    await Promise.all(updates);
    setClosing(false);
    alert(`${MONTH_NAME} has been closed successfully.`);
    navigate('/dashboard');
  };

  const PaymentPanel = () => {
    const monthOrders = getMonthlyOrders(selectedCustomer.id);
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f2347 0%, #0a3328 50%, #0f4d3a 100%)', boxShadow: '0 16px 48px rgba(10,22,40,0.2)' }}>
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-white text-base">{selectedCustomer.name}</p>
                <p className="text-xs font-black text-white/40 uppercase tracking-widest">{selectedCustomer.code}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedCustomer(null); setAmount(''); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <X size={14} className="text-white/50" />
            </button>
          </div>
          <div className="rounded-2xl px-4 py-3 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm text-white/40 font-bold uppercase tracking-wider">{MONTH_NAME} Total</p>
            <p className="text-xl font-black text-white">{formatZAR(selectedBalance)}</p>
          </div>
        </div>

        {monthOrders.length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-2 ml-1">Orders This Month</p>
            <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
              {monthOrders.map((item, i) => (
                <div key={item.id} className={`flex justify-between items-center px-5 py-4 ${i < monthOrders.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                  <div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm font-medium text-gray-400 dark:text-white/40 mt-0.5">{item.date}</p>
                  </div>
                  <p className="font-black text-base text-gray-900 dark:text-emerald-400">{formatZAR(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="text-sm font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">Amount Paid (ZAR)</label>
            <button onClick={() => setAmount(String(selectedBalance))}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
              Pay Full
            </button>
          </div>
          <input
            type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full px-5 py-5 bg-white dark:bg-white/5 rounded-2xl outline-none text-2xl font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300 dark:placeholder:text-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00" autoFocus
          />
        </div>

        {paidAmount > 0 && rollover > 0 && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.15)' }}>
            <p className="text-orange-500 dark:text-orange-400 text-sm font-black uppercase tracking-tight mb-2">Rollover Summary</p>
            <div className="flex justify-between text-base">
              <span className="text-orange-600/80 dark:text-orange-400/60 font-medium">Carries to next month</span>
              <span className="font-black text-orange-600 dark:text-orange-400">{formatZAR(rollover)}</span>
            </div>
          </div>
        )}

        {paidAmount > 0 && paidAmount >= selectedBalance && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <div className="flex justify-between items-center text-base">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Fully settled</span>
              <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        )}

        <button onClick={handleConfirmPayment} disabled={paidAmount <= 0}
          className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98]"
          style={paidAmount > 0
            ? { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', boxShadow: '0 6px 20px rgba(5,150,105,0.2)' }
            : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
          }>
          Confirm Payment
        </button>
      </div>
    );
  };

  const OverviewContent = () => (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={canClose
          ? { backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }
          : { backgroundColor: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.15)' }
        }>
        {canClose
          ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
          : <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />}
        <div>
          <p className={`text-sm font-black uppercase tracking-wider ${canClose ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {canClose ? 'All accounts settled' : `${unpaidCount} account${unpaidCount !== 1 ? 's' : ''} still unpaid`}
          </p>
          <p className="text-xs text-gray-400 dark:text-white/30 font-medium mt-0.5">
            {canClose ? 'Ready to close the month' : 'Cannot close until all are settled'}
          </p>
        </div>
      </div>

      <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest ml-1">All Accounts</p>

      <div className="space-y-2.5">
        {loading ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-white/30 font-medium">Loading accounts…</p>
          </div>
        ) : customers.filter(c => getMonthlyTotal(c.id) > 0).length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-white/30 font-medium">No orders this month</p>
          </div>
        ) : (
          customers.map(customer => {
            const monthlyTotal     = getMonthlyTotal(customer.id);
            const paid             = isPaid(customer.id);
            const amountPaid       = payments[customer.id] || 0;
            const customerRollover = Math.max(0, monthlyTotal - amountPaid);
            if (monthlyTotal === 0) return null;

            return (
              <div key={customer.id}
                onClick={() => !paid && setSelectedCustomer(customer)}
                className={`bg-white dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between transition-all ${!paid ? 'cursor-pointer hover:shadow-md' : ''} ${selectedCustomer?.id === customer.id ? 'ring-2 ring-emerald-400' : ''}`}
                style={{ border: paid ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(234,88,12,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: paid ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0f2347, #1a3565)' }}>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mt-0.5">{customer.code}</p>
                    {paid && customerRollover > 0 && (
                      <p className="text-xs font-black text-orange-500 dark:text-orange-400 mt-0.5">Rollover: {formatZAR(customerRollover)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-black text-base ${paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                      {formatZAR(monthlyTotal)}
                    </p>
                    <p className={`text-xs font-black uppercase tracking-tight mt-0.5 ${paid ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-400 dark:text-orange-400/70'}`}>
                      {paid ? 'Settled' : 'Unpaid'}
                    </p>
                  </div>
                  {!paid && <ChevronRight size={15} className="text-gray-300 dark:text-white/20" />}
                  {paid  && <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={handleClose} disabled={!canClose || closing}
        className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        style={canClose && !closing
          ? { background: 'linear-gradient(135deg, #0f2347 0%, #0a3328 50%, #0f4d3a 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(15,35,71,0.2)' }
          : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
        }>
        <Lock size={15} />
        {closing ? 'Closing month…' : canClose ? `Close ${MONTH_NAME}` : `${unpaidCount} Unpaid — Cannot Close`}
      </button>
    </div>
  );

  const SidebarSummary = () => (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 sticky top-4">
      <p className="text-xs font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-4">Month Summary</p>
      <div className="space-y-3">
        {[
          { label: 'Total accounts', value: customers.filter(c => getMonthlyTotal(c.id) > 0).length,                          color: 'text-gray-900 dark:text-white'        },
          { label: 'Settled',        value: customers.filter(c => isPaid(c.id) && getMonthlyTotal(c.id) > 0).length,          color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Unpaid',         value: unpaidCount,                                                                        color: 'text-orange-500 dark:text-orange-400'   },
        ].map(({ label, value, color }, i) => (
          <div key={label} className={`flex justify-between items-center py-2 ${i < 2 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
            <p className="text-sm text-gray-500 dark:text-white/40 font-medium">{label}</p>
            <p className={`text-base font-black ${color}`}>{value}</p>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Total collected</p>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
            {formatZAR(Object.values(payments).reduce((s, v) => s + v, 0))}
          </p>
        </div>
      </div>
    </div>
  );

  if (selectedCustomer) {
    return (
      <MainLayout title={`${MONTH_NAME} Close`} showBack>
        <div className="block lg:hidden max-w-xl"><PaymentPanel /></div>
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          <div className="col-span-3"><OverviewContent /></div>
          <div className="col-span-2"><PaymentPanel /></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${MONTH_NAME} Close`} showBack>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><OverviewContent /></div>
        <div className="lg:col-span-1"><SidebarSummary /></div>
      </div>
    </MainLayout>
  );
};

export default MonthEnd;