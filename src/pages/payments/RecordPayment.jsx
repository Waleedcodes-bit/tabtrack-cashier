import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Clock, Loader, AlertTriangle } from 'lucide-react';

import InnerLayout from '../../components/layout/InnerLayout';
import { supabase } from '../../lib/supabase';
import { formatZAR } from '../../utils/format';
import { sendPushNotification } from '../../utils/pushNotifications';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

const RecordPayment = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount]                     = useState('');
  const [paymentDate, setPaymentDate]           = useState(new Date().toISOString().split('T')[0]);

  const [ownerId, setOwnerId]               = useState(null);
  const [customers, setCustomers]           = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [currentOrders, setCurrentOrders]   = useState([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [loadingOrders, setLoadingOrders]   = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState('');

  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setOwnerId(user.id);

        const [custRes, payRes] = await Promise.all([
          supabase
            .from('customers')
            .select('id, name, code, balance, auth_user_id')
            .eq('owner_id', user.id)
            .gt('balance', 0)
            .order('name'),
          supabase
            .from('payments')
            .select('id, customer_id, amount, date, month, customers!inner(owner_id)')
            .eq('customers.owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const custData = custRes.data || [];
        setCustomers(custData);

        const payData = payRes.data || [];
        const enriched = payData.map(p => {
          const c = custData.find(c => c.id === p.customer_id);
          return { ...p, customerName: c?.name || '—', customerCode: c?.code || '—' };
        });
        setRecentPayments(enriched);
      } catch (err) {
        console.error('RecordPayment list error:', err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchList();
  }, []);

  useEffect(() => {
    if (!selectedCustomer) { setCurrentOrders([]); return; }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, name, amount, date')
          .eq('customer_id', selectedCustomer.id)
          .gte('date', `${CURRENT_MONTH}-01`)
          .order('date', { ascending: false });

        if (error) throw error;
        setCurrentOrders(data || []);
      } catch (err) {
        console.error('Orders fetch error:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [selectedCustomer]);

  const paidAmount  = parseFloat(amount) || 0;
  const balance     = selectedCustomer?.balance || 0;
  const rollover    = Math.max(0, balance - paidAmount);
  const isOverpaid  = paidAmount > balance;
  const overpaidBy  = paidAmount - balance;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = async () => {
    if (paidAmount <= 0 || !selectedCustomer) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      // 1. Insert payment record
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          customer_id: selectedCustomer.id,
          amount: paidAmount,
          date: paymentDate,
          month: CURRENT_MONTH,
        });
      if (payError) throw payError;

      // 2. Update customer balance
      

      // 3. Log activity
      await supabase.from('activity_logs').insert({
        type: 'payment',
        title: `Payment recorded — ${selectedCustomer.name}`,
        subtitle: `${formatZAR(paidAmount)} on ${paymentDate}`,
      });

      // 4. Push notification to customer
      if (selectedCustomer.auth_user_id) {
        const newBalance = Math.max(0, balance - paidAmount);
        await sendPushNotification({
          userId: selectedCustomer.auth_user_id,
          title:  'Payment recorded',
          body:   `${formatZAR(paidAmount)} payment received${newBalance > 0 ? ` · ${formatZAR(newBalance)} remaining` : ' · Fully settled!'}`,
          url:    '/customer/dashboard',
        });
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Payment submit error:', err);
      setSubmitError('Failed to record payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCustomer) {
    return (
      <InnerLayout title="Record Payment" showBack>
        <div className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all font-medium text-sm shadow-sm"
              autoFocus
            />
          </div>

          {searchQuery.length > 0 && (
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-gray-400 text-sm font-medium py-8">No accounts found</p>
              ) : (
                filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCustomer(c); setSearchQuery(''); }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all shadow-sm hover:border-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{c.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-black text-sm text-gray-900">{formatZAR(c.balance)}</p>
                        <p className="text-[9px] font-bold text-red-500 uppercase">Owed</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {searchQuery.length === 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Recent Payments</p>
              {loadingList ? (
                <div className="flex justify-center py-8">
                  <Loader size={20} className="animate-spin text-gray-300" />
                </div>
              ) : recentPayments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400 font-medium">
                  No payments recorded yet
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {recentPayments.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center px-5 py-4 ${i < recentPayments.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                          <Clock size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{p.customerName}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.customerCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">{formatZAR(p.amount)}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{p.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout title="Record Payment" showBack>
      <div className="space-y-4">
        <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl shadow-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white text-sm border border-white/5">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-white">{selectedCustomer.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedCustomer.code}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedCustomer(null); setAmount(''); setCurrentOrders([]); }}
              className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg"
            >
              Change
            </button>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex justify-between items-center border border-white/5">
            <p className="text-xs text-gray-400 font-medium">Outstanding Balance</p>
            <p className="text-lg font-bold text-white">{formatZAR(balance)}</p>
          </div>
        </div>

        {loadingOrders && (
          <div className="flex justify-center py-4">
            <Loader size={18} className="animate-spin text-gray-300" />
          </div>
        )}
        {!loadingOrders && currentOrders.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">This Month's Orders</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {currentOrders.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center px-5 py-3 ${i < currentOrders.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900">{formatZAR(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Paid (ZAR)</label>
            <button
              onClick={() => setAmount(String(balance))}
              className="text-[10px] font-black text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-lg"
            >
              Pay Full {formatZAR(balance)}
            </button>
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={`w-full px-5 py-5 bg-white rounded-2xl border outline-none text-2xl font-bold text-gray-900 focus:ring-4 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${isOverpaid
                ? 'border-amber-400 focus:ring-amber-500/10 focus:border-amber-400'
                : 'border-gray-100 focus:ring-green-500/10 focus:border-green-500'
              }`}
            placeholder="0.00"
            autoFocus
          />
        </div>

        {/* Overpayment warning */}
        {isOverpaid && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 text-sm font-black uppercase tracking-tight">Amount exceeds balance</p>
              <p className="text-amber-600 text-xs font-medium mt-0.5">
                You're recording {formatZAR(overpaidBy)} more than what's owed. Double-check the amount before confirming.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 ml-1">Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
            className="w-full px-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none text-sm font-semibold text-gray-700 focus:border-green-400 transition-colors"
          />
        </div>

        {paidAmount > 0 && !isOverpaid && rollover > 0 && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <p className="text-orange-600 text-xs font-bold uppercase tracking-tight mb-2">Allocation Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600/80 font-medium">Rollover to next month</span>
              <span className="font-bold text-orange-700">{formatZAR(rollover)}</span>
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-xs text-red-500 font-medium text-center">{submitError}</p>
        )}

        <div className="pt-2">
          <button
            onClick={handleConfirm}
            disabled={paidAmount <= 0 || submitting}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]
              ${paidAmount > 0 && !submitting
                ? isOverpaid
                  ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600'
                  : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            {submitting ? 'Recording…' : isOverpaid ? 'Confirm Anyway' : 'Confirm Payment'}
          </button>
          {!isOverpaid && (
            <p className="text-center text-[10px] text-gray-400 mt-4 px-6 uppercase tracking-widest font-bold leading-relaxed">
              Remaining balance will roll over to next month.
            </p>
          )}
        </div>
      </div>
    </InnerLayout>
  );
};

export default RecordPayment;